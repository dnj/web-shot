import { IScreenshotOptions, screenshot } from "../utils/browser";
import fs from "fs/promises";
import crypto from "crypto";
import { z } from "zod";
import { H3Event } from "h3";
import path from "path";
import sharp from "sharp";
import { usePrisma } from "../utils/prisma";
import { fileURLToPath } from 'url';
import { SCREENSHOT_DIR, SCREENSHOT_MAX_AGE, getScreenshotPath, setupScreenshotClear } from "../utils/screenshot";

class LockError extends Error {
	public constructor(message = "screenshot is in lock") {
		super(message);
	}
}

interface ScreenshotFileInfo {
	age: number;
	size: number;
	createdAt: Date;
	width: number;
	height: number;
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

function getScreenshotFilename(options: IScreenshotOptions): string {
	const values = `${options.url}-${options.fullpage ? '1' : '0'}-${options.viewportWidth}-${options.viewportWidth}`;
	const hash = crypto.createHash("sha256").update(values).digest("hex");
	return `${hash}.${options.format}`;
}

async function getScreenshotInfo(filepath: string, lockTimeout: number = 15000): Promise<ScreenshotFileInfo> {
	await waitForScreenshotLock(filepath, lockTimeout);
	const stat = await fs.stat(filepath);
	const age = Math.floor((Date.now() - stat.ctime.getTime()) / 1000);
	const metadata = await sharp(filepath).metadata();
	if (metadata.width === undefined || metadata.height === undefined) {
		throw new Error("image file is currpted");
	}
	return {
		age,
		size: stat.size,
		createdAt: stat.ctime,
		width: metadata.width,
		height: metadata.height,
	};
}

async function waitForScreenshotLock(filepath: string, lockTimeout: number = 15000): Promise<void> {
	const startAt = Date.now();
	while (!lockTimeout || Date.now() - startAt < lockTimeout) {
		try {
			await fs.stat(filepath + ".lock");
		} catch {
			return;
		}
	}
	throw new LockError("timeout");
}

async function lockScreenshot(filepath: string, lockTimeout: number = 15000): Promise<string> {
	await waitForScreenshotLock(filepath, lockTimeout);
	const lockFile = filepath + ".lock";
	await fs.writeFile(lockFile, "");
	return lockFile;
}

async function resizeScreenshot(filepath: string, info: ScreenshotFileInfo, options?: ScreenshotResizeOptions): Promise<Buffer> {
	if (options && ((options.width && options.width != info.width) || (options.height && options.height != info.height))) {
		const image = sharp(filepath);
		return image.resize({
			width: options.width,
			height: options.height,
			fit: "fill"
		}).toBuffer();
	}
	return fs.readFile(filepath)
}

function getFinalImageSize(info: ScreenshotFileInfo, resize?: ScreenshotResizeOptions): { width: number, height: number } {
	return {
		width: resize?.width || info.width,
		height: resize?.height || info.height,
	};
}
async function sendScreenshot(event: H3Event, filepath: string, info: ScreenshotFileInfo, resize?: ScreenshotResizeOptions): Promise<Buffer | undefined> {
	resize = getFinalImageSize(info, resize);

	const image = await resizeScreenshot(filepath, info, resize);
	const etag = crypto.createHash("md5").update(JSON.stringify(resize)).update(image).digest("hex");

	setHeader(event, "Cache-Control", `public,max-age=${SCREENSHOT_MAX_AGE}`);
	setHeader(event, "Expires", (new Date(info.createdAt.getTime() + SCREENSHOT_MAX_AGE * 1000)).toUTCString());
	setHeader(event, "ETag", etag);
	setHeader(event, "Last-Modified", info.createdAt.toUTCString());

	const requestModifiedSince = getHeader(event, "If-Modified-Since");
	const requestModifiedSinceDate = requestModifiedSince ? new Date(requestModifiedSince) : undefined;
	let cache = (requestModifiedSince !== undefined && requestModifiedSinceDate?.toUTCString() === info.createdAt.toUTCString());

	const requestEtag = getHeader(event, "If-None-Match");
	if (requestEtag !== undefined) {
		cache = cache || requestEtag === etag;
	}

	if (cache) {
		setResponseStatus(event, 304);
		return;
	}

	const format = path.extname(filepath).substring(1);
	setHeader(event, "Content-Type", `image/${format}`);
	setHeader(event, "Content-Length", image.byteLength);

	return image;
}

export default defineEventHandler(async (event) => {
	assertMethod(event, "GET", false);

	const query = await getValidatedQuery(event, captureRequestSchema.parse);


	const filename = getScreenshotFilename(query);
	const filepath = getScreenshotPath(filename);

	await waitForScreenshotLock(filepath);
	let info: ScreenshotFileInfo | undefined;
	try {
		info = await getScreenshotInfo(filepath);
	} catch {

	}

	if (info) {
		if (info.age < query.maxAge) {
			return sendScreenshot(event, filepath, info, query);
		} else {
			await fs.rm(filepath);
		}
	}
	const lock = await lockScreenshot(filepath);
	let image: Buffer;
	try {
		const shot = await usePrisma().shot.create({
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
			image = await screenshot(query);
			await fs.writeFile(filepath, image);
			await usePrisma().shot.update({
				data: { capture_at: new Date(), status: "AVAILABLE", image: filename },
				where: { id: shot.id }
			});
		} catch (e) {
			await usePrisma().shot.update({
				data: { capture_at: new Date(), status: "ERROR" },
				where: { id: shot.id }
			});

			throw e;
		}
	} finally {
		await fs.rm(lock);
	}

	setupScreenshotClear();

	return sendScreenshot(event, filepath, {
		age: 0,
		createdAt: new Date(),
		size: image.byteLength,
		width: query.viewportWidth,
		height: query.viewportHeight,
	}, query);
});
