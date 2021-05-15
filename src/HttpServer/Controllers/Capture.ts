import * as fs from "fs";
import * as Jimp from "jimp";
import * as puppeteer from "puppeteer";
import App from "../../App";
import ServerError from "../../Library/Exceptions/ServerError";
import Client from "../../Library/HttpServer/Client";
import InputValidation, { InputType } from "../../Library/InputValidation";
import Shot, { Format, Status } from "../../Models/Shot";
enum ErrorType {
	RESOLVE,
	TIMEOUT,
	INTERNAL,
}
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
		try {
			const shot = await Capture.shoot(data);
			const image = await shot.resize(data.width, data.crop);
			client.sendFile(image);
		} catch (e) {
			console.error(e);
			if (e instanceof puppeteer.errors.TimeoutError) {
				Capture.sendErrorMessage(client, ErrorType.TIMEOUT, data.format, data.width, data.crop);
			} else if (e instanceof Error) {
				if (e.message.indexOf("net::ERR_NAME_NOT_RESOLVED") !== -1) {
					Capture.sendErrorMessage(client, ErrorType.RESOLVE, data.format, data.width, data.crop);
				} else if (e.message.indexOf("net::ERR_CONNECTION_TIMED_OUT") !== -1) {
					Capture.sendErrorMessage(client, ErrorType.TIMEOUT, data.format, data.width, data.crop);
				} else {
					Capture.sendErrorMessage(client, ErrorType.INTERNAL, data.format, data.width, data.crop);
				}
			} else {
				Capture.sendErrorMessage(client, ErrorType.INTERNAL, data.format, data.width, data.crop);
				throw e;
			}
		}
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
			try {
				await page.setViewport({width: data.viewportWidth, height: data.viewportHeight});
				await page.goto(shot.url, {waitUntil: "networkidle2"});
				const dir = Shot.getImageStoragePath() + "/";
				if (!fs.existsSync(__dirname + dir)) {
					fs.mkdirSync(dir, {
						recursive: true,
						mode: 755,
					});
				}
				const file = dir + shot.id + "." + data.format;
				await App.lockBrowser();
				await page.bringToFront();
				await page.screenshot({
					path: file,
					type: data.format === "png" ? "png" : "jpeg",
					fullPage: data.fullPage === true,
				});
				page.close();
				App.releaseBrowser();
				shot.set("status", Status.Available);
				shot.set("image", shot.id + "." + data.format);
				shot.set("capture_at", Math.floor(Date.now() / 1000));
				shot.save();
			} catch (e) {
				page.close();
				shot.set("status", Status.Error);
				shot.save();
				throw e;
			}
		}
		return shot;
	}
	private static async newPage() {
		const sleep = (ms) => new Promise<void>((resolve) => {
			setTimeout(resolve, ms);
		});
		const config = App.getConfig();
		const browser = await App.getBrowser();
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
	private static async sendErrorMessage(client: Client, type: ErrorType, format: "jpg" | "png", width?: number, height?: number) {
		const image = await Jimp.read(width, height, 0xffffffff);
		const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
		const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK);
		const marginTop = Math.floor(height / 3);
		const marginLeft = Math.floor(width / 8);
		if (type === ErrorType.RESOLVE) {
			image.print(fontBig, marginLeft, marginTop, "DNS ERROR", marginLeft * 6, 20);
			image.print(fontSmall, marginLeft, marginTop + 40, "The requested URL could not be retrieved", Math.floor(width / 8) * 6, Math.floor(height / 3) * 2);
		} else if (type === ErrorType.TIMEOUT) {
			image.print(fontBig, marginLeft, marginTop, "Connection Error", marginLeft * 6, 20);
			image.print(fontSmall, marginLeft, marginTop + 40, "Connection timed out", Math.floor(width / 8) * 6, Math.floor(height / 3) * 2);
		}  else if (type === ErrorType.INTERNAL) {
			image.print(fontBig, marginLeft, marginTop, "Internal Error", marginLeft * 6, 20);
			image.print(fontSmall, marginLeft, marginTop + 40, "The requested URL could not be retrieved", Math.floor(width / 8) * 6, Math.floor(height / 3) * 2);
		}
		const mime = format === "jpg" ? Jimp.MIME_JPEG : Jimp.MIME_PNG;
		client.send(await image.getBufferAsync(mime));
	}
}
