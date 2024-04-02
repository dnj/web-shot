import puppeteer, {Browser} from 'puppeteer';

let browser: Browser|undefined = undefined;

export async function useBrowser(): Promise<Browser> {
	if (!browser) {
		browser = await puppeteer.launch({
			args: ["--no-sandbox"],
			headless: false,
		});
		browser.on("disconnected", () => {
			browser = undefined;
		});
	}
	return browser;
}