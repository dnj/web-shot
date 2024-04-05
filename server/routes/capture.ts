import { screenshot } from "../utils/browser";
import crypto from "crypto";
import { z } from "zod";
import { H3Event } from "h3";
import sharp from "sharp";
import { usePrisma } from "../utils/prisma";
import {  SCREENSHOT_MAX_AGE, SCREENSHOT_MAX_LOCK_TIME, setupScreenshotClear, useCaptureStorage } from "../utils/screenshot";
import { Shot } from "@prisma/client";
import { useImagitorErrorHandle } from "../utils/error-handling";

class LockError extends Error {
	public constructor(message = "screenshot is in lock") {
		super(message);
	}
}

interface ScreenshotResizeOptions {
	width?: number;
	height?: number;
}

const captureRequestSchema = z.object({
	url: z.string().url(),
	maxAge: z.number({ coerce: true }).min(10).positive().int().default(86400),
	format: z.enum(["png", "jpeg"]).default("jpeg"),
	fullpage: z.boolean({ coerce: true }).default(false),
	viewportWidth: z.number({ coerce: true }).min(320).positive().int().default(1200),
	viewportHeight: z.number({ coerce: true }).min(300).positive().int().default(600),
	width: z.number({ coerce: true }).positive().int().optional(),
	height: z.number({ coerce: true }).positive().int().optional(),
	timeout: z.number({ coerce: true }).positive().int().gte(2000).lt(15000).default(10000)

});

export async function resizeShot(shot: Shot, options?: ScreenshotResizeOptions): Promise<Buffer> {
	const image: Buffer | null = await useCaptureStorage().getItemRaw(shot.id.toString());
	if (image === null) {
		throw new Error("Cannot find shot file on storage");
	}
	if ((options?.width && options.width != shot.viewport_width) || (options?.height && options.height != shot.viewport_height)) {
		const resizer = sharp(image);
		return resizer.resize({
			width: options.width,
			height: options.height,
			fit: "fill"
		}).toBuffer();
	}
	return image;
}

export async function sendShot(event: H3Event, shot: Shot, resize: ScreenshotResizeOptions): Promise<Buffer | undefined> {
	resize = {
		width: resize?.width || shot.viewport_width,
		height: resize?.height || shot.viewport_height,
	};
	const image = await resizeShot(shot, resize);
	const etag = crypto.createHash("md5").update(JSON.stringify(resize)).update(image).digest("hex");

	setHeader(event, "Cache-Control", `public,max-age=${SCREENSHOT_MAX_AGE}`);
	setHeader(event, "Expires", (new Date(shot.create_at.getTime() + SCREENSHOT_MAX_AGE * 1000)).toUTCString());
	setHeader(event, "ETag", etag);
	setHeader(event, "Last-Modified", shot.create_at.toUTCString());

	const requestModifiedSince = getHeader(event, "If-Modified-Since");
	const requestModifiedSinceDate = requestModifiedSince ? new Date(requestModifiedSince) : undefined;
	let cache = (requestModifiedSince !== undefined && requestModifiedSinceDate?.toUTCString() === shot.create_at.toUTCString());

	const requestEtag = getHeader(event, "If-None-Match");
	if (requestEtag !== undefined) {
		cache = cache || requestEtag === etag;
	}

	if (cache) {
		setResponseStatus(event, 304);
		return;
	}

	setHeader(event, "Content-Type", `image/${shot.format.toLowerCase()}`);
	setHeader(event, "Content-Length", image.byteLength);

	return image;


}

export async function waitForShot(shot: number|Shot, timeout?: number): Promise<Shot> {
	const shotId = typeof shot === "object" ? shot.id : shot;

	if (timeout === undefined) {
		timeout = SCREENSHOT_MAX_LOCK_TIME * 1000;
	}
	const startAt = Date.now();
	while (!timeout || Date.now() - startAt < timeout) {
		shot = await usePrisma().shot.findUniqueOrThrow({where: {id: shotId}});
		if (shot.status !== "CAPTURING") {
			return shot;
		}
	}
	throw new LockError("timeout");
}

const handler = defineEventHandler(async (event) => {
	assertMethod(event, "GET", false);

	const query = await getValidatedQuery(event, captureRequestSchema.parse);

	let shot = await usePrisma().shot.findFirst({
		orderBy: {
			id: "desc",
		},
		where: {
			url: query.url,
			viewport_width: query.viewportWidth,
			viewport_height: query.viewportHeight,
			format: query.format.toUpperCase() as "PNG" | "JPEG",
			fullpage: query.fullpage,
			OR: [
				{
					status: "AVAILABLE",
					capture_at: {
						gte: new Date(Date.now() - query.maxAge * 10000)
					}
				},
				{
					status: "CAPTURING",
					create_at: {
						gte: new Date(Date.now() - SCREENSHOT_MAX_LOCK_TIME * 10000)
					}
				}
			]
		}
	});
	if (shot?.status === "CAPTURING") {
		try {
			shot = await waitForShot(shot);
		} catch(e) {
			if (! (e instanceof LockError)) {
				throw e;
			}
			shot = null;
		}
	}

	if (shot?.status !== "AVAILABLE") {
		shot = await usePrisma().shot.create({
			data: {
				url: query.url,
				format: query.format.toUpperCase() as "PNG" | "JPEG",
				fullpage: query.fullpage,
				viewport_width: query.viewportWidth,
				viewport_height: query.viewportHeight,
				status: "CAPTURING",
			},
		});
		try {
			const image = await screenshot(query);
			await useCaptureStorage().setItemRaw(shot.id.toString(), image);
			await usePrisma().shot.update({
				data: { capture_at: new Date(), status: "AVAILABLE" },
				where: { id: shot.id }
			});
		} catch (e) {
			await usePrisma().shot.update({
				data: { capture_at: new Date(), status: "ERROR" },
				where: { id: shot.id }
			});

			throw e;
		}

		setupScreenshotClear();
	}


	return sendShot(event, shot, query);
});


export default useImagitorErrorHandle(handler);