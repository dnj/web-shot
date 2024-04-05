import { Shot } from "@prisma/client";
import { usePrisma } from "./prisma"

export const SCREENSHOT_MAX_AGE = 86400 * 15; // Seconds
export const SCREENSHOT_MAX_LOCK_TIME = 15;
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
	await useCaptureStorage().removeItem(shot.id.toString());
	await usePrisma().shot.delete({
		where: {
			id: shot.id
		}
	});
}

export async function purgeOrphanShots(): Promise<void> {
	const entries = await useCaptureStorage().getKeys();
	for (const filename of entries) {
		if (!/^\d+$/.test(filename)) {
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
			id: parseInt(filename, 10)
		}
	});
	if (shot === null) {
		await useCaptureStorage().removeItem(filename);
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

export function useCaptureStorage() {
	return useStorage("captures");
}
