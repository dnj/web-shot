import * as fs from "fs";
import * as http from "http";
import * as mime from "mime";
import * as stream from "stream";
import * as url from "url";
import View from "../MVC/View";
import HttpServer from "./HttpServer";

export default class Client {
	public host: string;
	public path: string;
	public url: url.UrlWithParsedQuery;
	public constructor(private server: HttpServer, private request: http.IncomingMessage, private response: http.ServerResponse, public isHttps: boolean) {
		this.host = request.headers.host;
		this.path = request.url;
		this.url = url.parse((this.isHttps ? "https" : "http") + "://" + this.host + request.url, true);
	}
	public sendNotFound() {
		this.server.notFoundPage().then((notfound) => {
			this.response.writeHead(404, {"Content-Type": "text/html"});
			this.response.end(notfound);
		});
	}
	public send(chunk: string | Buffer | ArrayBuffer) {
		this.response.end(chunk);
	}
	// tslint:disable:ban-types
	public async sendView(view: Function | View) {
		let obj: View;
		if (view instanceof View) {
			obj = view;
		} else {
			obj = new (view.prototype.constructor)();
		}
		try {
			await obj.preLoad();
			if (typeof this.url.query.ajax === "string" && this.url.query.ajax === "1") {
				const json = await obj.forAjax();
				this.sendJSON(json);
			} else {
				const html = await obj.render();
				this.response.writeHead(200, {"Content-Type": "text/html"});
				this.response.end(html);
			}
		} catch (e) {
			console.error(e);
			this.response.writeHead(500, {"Content-Type": "text/html"});
			this.response.end();
		}
	}
	public sendStream(size: number, readableStream: stream.Readable, mimeType: string) {
		this.response.writeHead(200, {"Content-Type": mimeType, "Content-Length": size});
		readableStream.pipe(this.response);
	}
	public sendFile(path: string) {
		return new Promise<void>((resolve, reject) => {
			const contentType = mime.getType(path) || "application/octet-stream";
			fs.stat(path, (err, stats) => {
				if (err) {
					this.response.writeHead(500, {"Content-Type": "text/html"});
					return reject(err);
				}
				this.sendStream(stats.size, fs.createReadStream(path), contentType);
				resolve();
			});
		});
	}
	public sendJSON(data: any, code?: number) {
		this.response.writeHead(code || 200, {"Content-Type": "text/json"});
		this.response.end(JSON.stringify(data));
	}
	public redirect(newURL: string, code: 301 | 302 = 302) {
		this.response.writeHead(code, {
			Location: newURL,
		});
		this.response.end();
	}
}
