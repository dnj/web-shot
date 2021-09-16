import * as fs from "fs";
import * as os from "os";
import * as dotenv from "dotenv";
import * as path from "path";
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
		await App.runBrowser();
		App.removeOldShotsInterval();
	}
	public static async reload() {
		App.initDotENV();
		/** save ssl cert and key path to DB if gotted from env */
		const sslDB = await App.getConfig().get("https") as ISSLOptions;
		if (!sslDB && (process.env.WEBSHOT_SSL_CERT_PATH && process.env.WEBSHOT_SSL_KEY_PATH)) {
			try {
				if (fs.existsSync(process.env.WEBSHOT_SSL_CERT_PATH) && process.env.WEBSHOT_SSL_KEY_PATH) {
					App.getConfig().set("https", {
						cert: process.env.WEBSHOT_SSL_CERT_PATH,
						key: process.env.WEBSHOT_SSL_KEY_PATH,
					});
				}
			} catch (err) {}
		}
		App.config.clearCache();
		App.config.preload();
		if (App.httpServer) {
			await App.httpServer.stop();
			await App.runHttpServer();
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
		const exitHandler = () => {
			/** no need to close browser, puppeteer handler itself */
			if (App.databaseManager) {
				App.databaseManager.close();
			}
			App.removePID();
			process.exit();
		};
		process.on("SIGINT", () => {
			console.log("webshot: got SIGINT signal.");
			exitHandler();
		});
		process.on("SIGTERM", () => {
			console.log("webshot: got SIGTERM signal.");
			exitHandler();
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
		const dir = path.dirname(App.PID_FILE);
		try {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			fs.writeFileSync(App.PID_FILE, process.pid.toString(), {
				flag: "w"
			});
		} catch (err) {
			console.log(`webshot: can not save pid in ${App.PID_FILE}, error:`, err);
		}
	}
	private static removePID() {
		if (fs.existsSync(App.PID_FILE)) {
			try {
				fs.unlinkSync(App.PID_FILE);
			} catch (err) {
				console.error(`webshot: can not remove PID file located in: '${App.PID_FILE}', Error:\n`, err);
			}
		}
	}

	private static readonly PID_FILE = "/run/webshot/webshot.pid";
	private static databaseManager: DatabaseManager;
	private static httpServer: HttpServer;
	private static browser: puppeteer.Browser;
	private static config: ConfigManager;
	private static browserIsLocked = false;
	private static browserUnLockPromises: Array<{resolve: () => void, lock: boolean}> = [];

	private static initDotENV() {
		const env = path.resolve(__dirname, "../.env");
		if (fs.existsSync(env)) {
			const content = fs.readFileSync(env, {
				encoding: "UTF8",
			});
			const envConfig = dotenv.parse(content);
			for (const key in envConfig) {
				if (envConfig[key] !== undefined) {
					process.env[key] = envConfig[key];
				}
			}
		}
	}
	private static runDB() {
		App.databaseManager = new DatabaseManager({
			host: process.env.WEBSHOT_MYSQL_HOST || "127.0.0.1",
			username: process.env.WEBSHOT_MYSQL_USER || "YOUR_USER",
			password: process.env.WEBSHOT_MYSQL_PASSWORD || "PASSWORD",
			database: process.env.WEBSHOT_MYSQL_DATABASE ||"DATABASE_NAME",
			charset: process.env.WEBSHOT_MYSQL_CHARSET || "utf8mb4",
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

		let shouldUseSSL: boolean = true;
		if (ssl && ssl.cert && ssl.key) {
			try {
				if (!fs.existsSync(ssl.cert) || !fs.existsSync(ssl.key)) {
					shouldUseSSL = false;
				}
			} catch (err) {
				shouldUseSSL = false;
			}
		}

		const config = {
			port: port,
			hostname: hostname,
			ssl: shouldUseSSL ? ssl : undefined,
		};
		App.httpServer = new HttpServer(HttpRouting, config);
		await App.httpServer.run();
	}
	private static async runBrowser() {
		/**
		 * we should filter env variables that puppeteer sees
		 * Because by default it sees all process.env and it's not good to expose information like DB, ...
		 * @see https://github.com/puppeteer/puppeteer/blob/v9.1.1/docs/api.md#puppeteerlaunchoptions
		 */
		const secretENVs = [
			"WEBSHOT_MYSQL_HOST", "WEBSHOT_MYSQL_USER", "WEBSHOT_MYSQL_DATABASE", "WEBSHOT_MYSQL_PASSWORD",
			"WEBSHOT_CERTBOT_EMAIL", "WEBSHOT_SSL_CERT_PATH", "WEBSHOT_SSL_KEY_PATH",
			"WEBSHOT_HOSTNAME", "WEBSHOT_PORT", "WEBSHOT_SSL_PORT",
		];
		const puppeteerENV: {[name: string]: string} = {};
		for (const key in process.env) {
			if (secretENVs.indexOf(key) === -1) {
				puppeteerENV[key] = process.env[key];
			}
		}
		const setupBrowser = async () => {
			console.log("webshot: setupBrowser");
			App.browser = await puppeteer.launch({
				env: puppeteerENV,
				args: await App.getConfig().get("puppeteer_args") as string[],
				headless: await App.getConfig().get("puppeteer_headless", true) as boolean,
			});
			App.browser.on("disconnected", () => {
				console.log("webshot: App.browser disconnected, try reconnect");
				setupBrowser();
			});
		};
		setupBrowser();
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
