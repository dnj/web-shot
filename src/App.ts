import * as fs from "fs";
import * as puppeteer from "puppeteer";
import HttpRouting from "./HttpServer/Routing";
import ConfigManager from "./Library/ConfigManager";
import DatabaseManager from "./Library/Database/DatabaseManager";
import HttpServer, { ISSLOptions } from "./Library/HttpServer/HttpServer";
import Shot from "./Models/Shot";

export default class App {
	public static async run() {
		App.CWD();
		App.runDB();
		await App.loadConfig();
		await App.runHttpServer();
		await App.changeUserGroup();
		App.removeOldShotsInterval();
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
	private static async removeOldShotsInterval() {
		setInterval(App.removeOldShots, 3600 * 1000);
		setInterval(App.removeOrphanShots, 3600 * 2000);
		await App.removeOldShots();
		await App.removeOrphanShots();
	}
	private static async removeOldShots() {
		const readDir = (dir: string): Promise<string[]> => {
			return new Promise((resolve, reject) => {
				fs.readdir(dir, (err, items) => {
					if (err) {
						return reject(err);
					}
					resolve(items);
				});
			});
		};
		const unlink = (file: string): Promise<void> => {
			return new Promise((resolve, reject) => {
				if (fs.existsSync(file)) {
					fs.unlink(file, (err) => {
						if (err) {
							return reject(err);
						}
						resolve();
					});
				} else {
					resolve();
				}
			});
		};
		const option = await App.getConfig().get("oldshots", {});
		if (option.maxAge === undefined) {
			option.maxAge = 86400 * 2;
		}
		if (option.maxAge === 0) {
			return;
		}
		const model = new Shot();
		model.where("create_at", Math.floor(Date.now() / 1000) - option.maxAge, "<");
		const shots = await model.get(1000);
		if (shots.length === 0) {
			return;
		}
		const storage = Shot.getImageStoragePath();
		const items = await readDir(storage);
		for (const shot of shots) {
			for (const item of items) {
				if (item.startsWith(shot.id + ".") || item.startsWith(shot.id + "-")) {
					unlink(storage + "/" + item);
					break;
				}
			}
			await shot.delete();
		}
	}
	private static removeOrphanShots() {
		const storage = Shot.getImageStoragePath();
		const checkAndRemoveShot = (id: string, item: string): Promise<void> => {
			return new Promise((resolve, reject) => {
				(new Shot()).where("id", id).has().then((shot) => {
					if (!shot && fs.existsSync(storage + "/" + item)) {
						fs.unlink(storage + "/" + item, (err) => {
							if (err) {
								console.error("error in deleting " + storage + "/" + item, err);
								return reject(err);
							}
							resolve();
						});
					}
				}, reject);
			});
		};
		return new Promise<void>((resolve, reject) => {
			fs.readdir(storage, async (err, items) => {
				if (err) {
					return reject(err);
				}
				for (const item of items.slice(0, 1000)) {
					const matches = item.match(/^(\d+).*.(?:jpg|png|gif)$/i);
					if (!matches.length) {
						continue;
					}
					await checkAndRemoveShot(matches[1], item);
				}
			});
			resolve();
		});
	}
}
