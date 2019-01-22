import * as puppeteer from "puppeteer";
import HttpRouting from "./HttpServer/Routing";
import ConfigManager from "./Library/ConfigManager";
import DatabaseManager from "./Library/Database/DatabaseManager";
import HttpServer, { ISSLOptions } from "./Library/HttpServer/HttpServer";

export default class App {
	public static async run() {
		App.CWD();
		App.runDB();
		await App.loadConfig();
		await App.runHttpServer();
		await App.changeUserGroup();
		App.runBrowser();
	}
	public static getDatabaseManager() {
		return this.databaseManager;
	}
	public static async getBrowser(): Promise<puppeteer.Browser> {
		if (!App.browserIsLocked) {
			return App.browser;
		}
		await new Promise<void>((resolve) => {
			App.browserUnLockPromises.push({
				resolve: resolve,
				lock: false,
			});
		});
		return this.browser;
	}
	public static getConfig() {
		return this.config;
	}
	public static lockBrowser(): Promise<void> {
		if (App.browserIsLocked) {
			const promise = new Promise<void>((resolve) => {
				App.browserUnLockPromises.push({
					resolve: resolve,
					lock: true,
				});
			});
			return promise;
		}
		App.browserIsLocked = true;
		return Promise.resolve();
	}
	public static releaseBrowser() {
		App.browserIsLocked = false;
		while (App.browserUnLockPromises.length) {
			const item = App.browserUnLockPromises.shift();
			item.resolve();
			if (item.lock) {
				App.browserIsLocked = true;
				break;
			}
		}
	}
	private static databaseManager: DatabaseManager;
	private static browser: puppeteer.Browser;
	private static config: ConfigManager;
	private static browserIsLocked = false;
	private static browserUnLockPromises: Array<{resolve: () => void, lock: boolean}> = [];
	private static runDB() {
		App.databaseManager = new DatabaseManager({
			host: "127.0.0.1",
			username: "YOUR_USER",
			password: "PASSWORD",
			database: "DATABASE_NAME",
			charset: "utf8mb4",
		});
	}
	private static async runHttpServer() {
		const ssl = await App.getConfig().get("https") as ISSLOptions;
		const server = new HttpServer(HttpRouting, {
			port: await App.getConfig().get("http_port", 80) as number,
			hostname: await App.getConfig().get("http_hostname") as string,
			ssl: ssl,
		});
		await server.run();
	}
	private static async runBrowser() {
		App.browser = await puppeteer.launch({
			args: await App.getConfig().get("puppeteer_args") as string[],
			headless: await App.getConfig().get("puppeteer_headless", true) as boolean,
		});
	}
	private static loadConfig() {
		if (!App.config) {
			App.config = new ConfigManager();
		}
		return App.config.preload();
	}
	private static async changeUserGroup() {
		const options: string[] = await Promise.all([App.getConfig().get("process_user"), App.getConfig().get("process_group")]);
		if (options[1] && process.getgid && process.setgid) {
			process.setgid(options[1]);
		}
		if (options[0] && process.getuid && process.setuid) {
			process.setuid(options[0]);
		}
	}
	private static CWD() {
		process.chdir(__dirname);
	}
}
