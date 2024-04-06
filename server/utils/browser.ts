import { Mutex } from 'async-mutex';
import puppeteer, {Browser, Page} from 'puppeteer';

export interface IScreenshotOptions {
	url: string;
	format: "jpeg" | "png";
	fullpage: boolean;
	viewportWidth?: number;
	viewportHeight?: number;
	timeout?: number;
}

interface LockWorker<T> {
	(instance: Browser): Promise<T> | T;
}

export class NavigationError extends Error {
	public constructor(public readonly errorCode: string, public readonly url: string) {
		super(`${errorCode} at ${url}`);
	}
}
class BroswerWrapper {
	private lock: Mutex;
	private lastUseAt: Date;

	public constructor(private browser: Browser) {
		this.lock = new Mutex();
		this.lastUseAt = new Date();
	}

	public runExclusive<T>(callback: LockWorker<T>, priority?: number): Promise<T> {
		return this.lock.runExclusive(() => {
			this.lastUseAt = new Date();
			return callback(this.browser);
		}, priority);
	}

	public cancelLock(): void {
		this.lock.cancel();
	}

	public close(): Promise<void> {
		return this.runExclusive(async (instance) => {
			await instance.close();
			this.lock.cancel();
		});
	}

	public getIdleTime(): number {
		return Date.now() - this.lastUseAt.getTime();
	}

	public async screenshot(options: IScreenshotOptions): Promise<Buffer> {
		const page = await this.runExclusive((instance) => instance.newPage());		
		await page.setViewport({ width: options.viewportWidth || 0, height: options.viewportHeight || 0 });
		let image: Buffer;
		try {
			await this.goto(page, options);
			image = await this.runExclusive(() => page.screenshot({
				type: options.format,
				fullPage: options.fullpage,
				optimizeForSpeed: true,
			}));
		} finally {
			try {
				await page.close();
			} catch { }
		}
		return image;
	}

	private goto(page: Page, options:IScreenshotOptions): Promise<void> {
		return new Promise((resolve, reject) => {
			page.on("requestfailed", (request) => {
				console.log(request);
				const url = request.url();
				if (url === options.url) {
					const failure = request.failure();
					reject(new NavigationError(failure?.errorText || "UNKNOWN_ERROR", url));
				}
			});
			page.goto(options.url, { waitUntil: "networkidle2", timeout: options.timeout }).then(() => resolve(), reject);
		})
	}
}

let browser: BroswerWrapper | undefined = undefined;
let idleTimer: NodeJS.Timer;

export async function useBrowser(): Promise<BroswerWrapper> {
	if (!browser) {
		const browserInstance = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: false });
		browser = new BroswerWrapper(browserInstance);
		browserInstance.on("disconnected", () => {
			browser?.cancelLock(); 
			browser = undefined;
		});
		if (idleTimer === undefined) {
			setupIdleTimer();
		}
	}
	return browser;
}

export async function screenshot(options: IScreenshotOptions): Promise<Buffer> {
	const browser = await useBrowser();
	return browser.screenshot(options);
}

function setupIdleTimer() {
	idleTimer = setInterval(() => {
		if (browser && browser.getIdleTime() >= 60000) {
			browser.close();
		}
	}, 15000);
}
