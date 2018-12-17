import * as fs from "fs";
import * as path from "path";
import Client from "../../Library/HttpServer/Client";
import Index from "../Views/HomePage/Index";

export default class HomePage {
	public static index(client: Client) {
		client.sendView(Index);
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
