import * as fs from "fs";
import * as path from "path";
import Client from "../../Library/HttpServer/Client";
import Docs from "../Views/HomePage/Docs";
import Index from "../Views/HomePage/Index";

export default class HomePage {
	public static storageShots(client: Client, data: {file: string}) {
		const dir = path.resolve(__dirname, "../../storage/shots/");
		const fullPath = path.resolve(dir, data.file);
		if (fullPath.startsWith(dir)) {
			client.sendFile(fullPath);
		}
	}
	public static index(client: Client) {
		const view = new Index();
		view.hostname = client.host;
		client.sendView(view);
	}
	public static docs(client: Client) {
		const view = new Docs();
		view.hostname = client.host;
		client.sendView(view);
	}
	public static ACMEChallenge(client: Client, data: {file: string}) {
		return HomePage.assets(client, {
			path: ".well-known/acme-challenge/" + data.file,
		});
	}
	public static assets(client: Client, data: {path: string}) {
		const fullPath = path.resolve(__dirname, "../public/assets/", data.path.replace(/\.\./, ""));
		fs.exists(fullPath, (exists) => {
			if (exists) {
				client.sendFile(fullPath);
			} else {
				client.sendNotFound();
			}
		});
	}
}
