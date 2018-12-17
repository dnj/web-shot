import * as puppeteer from "puppeteer";
import HttpRouting from "./HttpServer/Routing";
import ConfigManager from "./Library/ConfigManager";
import DatabaseManager from "./Library/Database/DatabaseManager";
import HttpServer from "./Library/HttpServer/HttpServer";

export default class App {
	public static async run() {
		App.runDB();
		await App.loadConfig();
		App.runBrowser();
		App.runHttpServer();
	}
	public static getDatabaseManager() {
		return this.databaseManager;
	}
	public static getBrowser() {
		return this.browser;
	}
	public static getConfig() {
		return this.config;
	}
	private static databaseManager: DatabaseManager;
	private static browser: puppeteer.Browser;
	private static config: ConfigManager;
	private static runDB() {
		App.databaseManager = new DatabaseManager({
			host: "127.0.0.1",
			username: "root",
			password: "yeganemehr",
			database: "web-shot",
			charset: "utf8mb4",
		});
	}
	private static async runHttpServer() {
		const server = new HttpServer(HttpRouting, {
			port: await App.getConfig().get("http_port", 80) as number,
			hostname: await App.getConfig().get("http_hostname") as string,
		});
		server.run();
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
}
