import * as sharp from "sharp";
import App from "../../App";
import ServerError from "../../Library/Exceptions/ServerError";
import Client from "../../Library/HttpServer/Client";
import InputValidation, { InputType } from "../../Library/InputValidation";
import Shot, { Format, Status } from "../../Models/Shot";

interface IData {
	url: string;
	maxAge: number; // Default: 86400
	format: "jpg" | "png"; // Default: jpg
	fullPage: boolean; // Default: false
	width: number; // Default: 600
	crop: number; // Default: 600
	wait: number; // Default: 0
	viewportWidth: number; // Default: 1200
	viewportHeight: number; // Default: 600
}
export default class Capture {
	public static async request(client: Client) {
		const validator = new InputValidation({
			url: {
				type: InputType.URL,
				required: true,
			},
			maxAge: {
				type: InputType.Number,
				default: 86400,
			},
			format: {
				type: InputType.String,
				values: ["jpg", "png"],
				default: "jpg",
			},
			fullPage: {
				type: InputType.Boolean,
			},
			width: {
				type: InputType.Number,
				default: 600,
			},
			crop: {
				type: InputType.Number,
				default: 600,
			},
			wait: {
				type: InputType.Number,
				min: 1,
				max: 30,
				default: 0,
			},
			viewportWidth: {
				type: InputType.Number,
				min: 1,
				max: 1200,
				default: 1200,
			},
			viewportHeight: {
				type: InputType.Number,
				min: 1,
				max: 1200,
				default: 600,
			},

		}, client.url.query as any);
		const data = validator.validate() as IData;
		const shot = await Capture.shoot(data);
		const image = await Capture.doResize(shot, data);
		client.sendFile(image);
	}
	private static async shoot(data: IData) {
		let shot: Shot;
		do {
			shot = await Shot.getOrCreate(data.url, {
				maxAge: data.maxAge,
				format: data.format === "jpg" ? Format.JPG : Format.PNG,
				full_page: data.fullPage,
				viewport_width: data.viewportWidth,
				viewport_height: data.viewportHeight,
			});
			if (shot.image) {
				const exists = await shot.isExist();
				if (!exists) {
					await shot.delete();
					shot = undefined;
				}
			}
		} while (!shot);
		if (!shot.image) {
			const page = await Capture.newPage();
			await page.setViewport({width: data.viewportWidth, height: data.viewportHeight});
			await page.goto(shot.url);
			const file = Shot.getImageStoragePath() + "/" + shot.id + "." + data.format;
			await page.screenshot({
				path: file,
				type: data.format === "png" ? "png" : "jpeg",
				fullPage: data.fullPage === true,
			});
			page.close();
			shot.set("status", Status.Available);
			shot.set("image", shot.id + "." + data.format);
			shot.set("capture_at", Math.floor(Date.now() / 1000));
			shot.save();
		}
		return shot;
	}
	private static async newPage() {
		const sleep = (ms) => new Promise<void>((resolve) => {
			setTimeout(resolve, ms);
		});
		const config = App.getConfig();
		const browser = App.getBrowser();
		const maxPages = await config.get("puppeteer_max_pages", 20) as number;
		if (!maxPages) {
			return browser.newPage();
		}
		const timeout = await config.get("puppeteer_new_page_timeout", 10) as number;
		const startAt = Date.now();
		while (timeout <= 0 || Date.now() - startAt < timeout * 1000) {
			const pages = await browser.pages();
			if (pages.length < maxPages) {
				return browser.newPage();
			}
			await sleep(300);
		}
		throw new ServerError("Timeout for new page");
	}
	private static async doResize(shot: Shot, data: IData) {
		const height = Math.min(shot.viewport_height, data.crop) * (data.width / shot.viewport_width);
		const image = shot.getImagePath({width: data.width, height: height});
		const resizedExists = await shot.isExist({width: data.width, height: height});
		if (!resizedExists) {
			const resizer = sharp(shot.getImagePath());
			if (data.crop < shot.viewport_height) {
				resizer.extract({
					height: data.crop,
					left: 0,
					top: 0,
					width: shot.viewport_width,
				});
			}
			(resizer as any).resize({width: data.width});
			if (shot.format === Format.JPG) {
				resizer.jpeg();
			} else {
				resizer.png();
			}
			await resizer.toFile(image);
		}
		return image;
	}
}
