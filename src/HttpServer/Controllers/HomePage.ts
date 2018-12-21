import * as fs from "fs";
import * as path from "path";
import Client from "../../Library/HttpServer/Client";
import InputValidation, { InputType } from "../../Library/InputValidation";
import Docs from "../Views/HomePage/Docs";
import Gallery from "../Views/HomePage/Gallery";
import Index from "../Views/HomePage/Index";

interface IData {
	page: number;
	ipp: number;
}

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
		view.hostname = client.url.protocol + "//" + client.url.host;
		client.sendView(view);
	}
	public static docs(client: Client) {
		const view = new Docs();
		view.hostname = client.url.protocol + "//" + client.url.host;
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
	public static async gallery(client: Client) {
		const validator = new InputValidation({
			page: {
				type: InputType.Number,
				min: 1,
				default: 1,
			},
			ipp: {
				type: InputType.Number,
				min: 1,
				max: 30,
				default: 25,
			},
		}, client.url.query as any);
		const data = validator.validate() as IData;
		const view = new Gallery();
		view.page = data.page;
		view.ipp = data.ipp;
		client.sendView(view);
	}
}
