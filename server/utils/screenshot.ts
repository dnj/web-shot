import { Shot } from "@prisma/client";
import { usePrisma } from "./prisma"
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

export const SCREENSHOT_MAX_AGE = 86400 * 15; // Seconds
export const SCREENSHOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "captures");
let clearTimer: NodeJS.Timer|undefined;

export async function purgeOldShots(): Promise<void> {
	let cursor: undefined | {id: number};
	while(true) {
		const shots = await usePrisma().shot.findMany({
			cursor: cursor,
			take: 1000,
			where: {
				capture_at: {
					lt: new Date(Date.now() - SCREENSHOT_MAX_AGE * 100)
				},
				status: "AVAILABLE"
			}
		});

		if (shots.length) {
			cursor = { id: shots[shots.length - 1].id };
		} else {
			break;
		}

		for(const shot of shots) {
			try {
				await purgeShot(shot);
			} catch (e) {
				console.error("Error during purging old shot", e);
			}
		}
	}
}

export async function purgeShot(shot: Shot): Promise<void> {
	if (shot.image) {
		await deleteScreenshot(shot.image);
	}
	await usePrisma().shot.delete({
		where: {
			id: shot.id
		}
	});
}

export async function deleteScreenshot(filename: string): Promise<void> {
	const filepath = getScreenshotPath(filename);
	try {
		await fs.rm(filepath);
	} catch {}
}

export async function purgeOrphanShots(): Promise<void> {
	const entries = (await fs.readdir(SCREENSHOT_DIR));
	for (const filename of entries) {
		if (!filename.endsWith(".png") && !filename.endsWith(".jpeg")) {
			continue;
		}
		try {
			await purgeOrphanShot(filename);
		} catch (e) {
			console.error(`Error during purging orphan shot (filename: ${filename}): `, e);
		}
	}
}

export async function purgeOrphanShot(filename: string): Promise<void> {
	const shot = await usePrisma().shot.findUnique({
		where: {
			image: filename
		}
	});
	if (shot === null) {
		await deleteScreenshot(filename);
	}
}

export function setupScreenshotClear(): void {
	if (clearTimer !== undefined) {
		return;
	}
	clearTimer = setInterval(() => {
		purgeOldShots().catch((e) => {
			console.error("Error during purging old shots", e);
		});
		purgeOrphanShots().catch((e) => {
			console.error("Error during purging ophan shots", e);
		});
	}, 24 * 60 * 1000);
}

export function getScreenshotPath(filename: string): string {
	return path.join(SCREENSHOT_DIR, filename);
}
