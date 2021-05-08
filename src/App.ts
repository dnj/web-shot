import * as fs from "fs";
import * as os from "os";
import * as dotenv from "dotenv";
import * as puppeteer from "puppeteer";
import HttpRouting from "./HttpServer/Routing";
import ConfigManager from "./Library/ConfigManager";
import DatabaseManager from "./Library/Database/DatabaseManager";
import HttpServer, { ISSLOptions } from "./Library/HttpServer/HttpServer";
import Shot from "./Models/Shot";

export default class App {
	public static async run() {
		if (process.argv.length > 2) {
			const command = process.argv[2];
			switch (command) {
				case "reload":
					this.sendReloadSignal();
					break;
				default:
					console.log(`webshot: '${command}' is not a webshot command.`);
				break;
			}
			process.exit();
		}

		App.savePID();
		App.listenForSignals();
		App.CWD();
		App.initDotENV();
		App.runDB();
		await App.loadConfig();
		await App.runHttpServer();
		await App.changeUserGroup();
		App.removeOldShotsInterval();
		App.runBrowser();
	}
	public static reload() {
		App.config.clearCache();
		App.config.preload();
		if (App.httpServer) {
			App.httpServer.stop();
			App.httpServer.run();
		}
	}
	public static sendReloadSignal() {
		if (App.isDeamonIsRunnig()) {
			const PID = App.getPID();
			console.log(`webshot: send 'SIGHUP' signal to PID: '${PID}'`);
			try {
				process.kill(PID, os.constants.signals.SIGHUP);
			} catch (err) {
				console.log("webshot: error in send reload signal.\n", err);
				if (err.errno === os.constants.errno.ESRCH) {
					App.removePID();
				}
			}
		} else {
			console.log("webshot: webshot is not running!");
			App.removePID();
		}
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
	public static isDeamonIsRunnig(): boolean {
		const PID = App.getPID();
		if (PID) {
			try {
				/** check has process with PID */
				process.kill(PID, 0);
			} catch (err) {
				App.removePID();
				return false;
			}
			return true;
		}
		return false;
	}
	protected static listenForSignals() {
		process.on("SIGTERM", () => {
			console.log("webshot: got SIGTERM signal.");
			if (App.databaseManager) {
				App.databaseManager.close();
			}
			App.removePID();
			process.exit();
		});
		process.on("SIGHUP", () => {
			console.log("webshot: got SIGHUP signal, reload 'webshot' deamon.");
			App.reload();
		});
	}
	protected static getPID(): number | null {
		if (fs.existsSync(App.PID_FILE)) {
			return parseInt(fs.readFileSync(App.PID_FILE, {
				encoding: "UTF8",
			}), 10);
		}
		return null;
	}
	private static savePID() {
		fs.writeFileSync(App.PID_FILE, process.pid);
	}
	private static removePID() {
		if (fs.existsSync(App.PID_FILE)) {
			fs.unlink(App.PID_FILE, (err) => {
				console.error(`webshot: can not remove PID file located in: '${App.PID_FILE}'`);
			});
		}
	}
	private static readonly PID_FILE = "/run/web-shot.pid";
	private static databaseManager: DatabaseManager;
	private static httpServer: HttpServer;
	private static browser: puppeteer.Browser;
	private static config: ConfigManager;
	private static browserIsLocked = false;
	private static browserUnLockPromises: Array<{resolve: () => void, lock: boolean}> = [];
	private static initDotENV() {
		dotenv.config({
			path: "../.env",
		});
	}
	private static runDB() {
		App.databaseManager = new DatabaseManager({
			host: process.env.DB_HOST || "127.0.0.1",
			username: process.env.WEBSHOT_DB_USERNAME || "YOUR_USER",
			password: process.env.WEBSHOT_DB_PASSWORD || "PASSWORD",
			database: process.env.WEBSHOT_DB_NAME ||"DATABASE_NAME",
			charset: process.env.WEBSHOT_DB_CHARSET || "utf8mb4",
		});
	}
	private static async runHttpServer() {
		const port: number = process.env.WEBSHOT_PORT ?
			parseInt(process.env.WEBSHOT_PORT, 10) :
			await App.getConfig().get("http_port", 80) as number;

		const hostname: string = process.env.WEBSHOT_HOSTNAME ||
			await App.getConfig().get("http_hostname") as string;

		const ssl: ISSLOptions = (process.env.WEBSHOT_SSL_CERT_PATH && process.env.WEBSHOT_SSL_KEY_PATH) ? {
			cert: process.env.WEBSHOT_SSL_CERT_PATH,
			key: process.env.WEBSHOT_SSL_KEY_PATH,
			port: process.env.WEBSHOT_SSL_PORT ? parseInt(process.env.WEBSHOT_SSL_PORT) : 443,
			redirect: [1, "1", "true", "yes", "on"].indexOf(process.env.WEBSHOT_SSL_REDIRECT) > -1,
		} : await App.getConfig().get("https") as ISSLOptions;

		const config = {
			port: port,
			hostname: hostname,
			ssl: ssl,
		};
		console.log("App::runHttpServer", config);
		App.httpServer = new HttpServer(HttpRouting, config);
		await App.httpServer.run();
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
