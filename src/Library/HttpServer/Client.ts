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
	public constructor(private server: HttpServer, private request: http.IncomingMessage, private response: http.ServerResponse) {
		this.host = request.headers.host;
		this.path = request.url;
		this.url = url.parse(request.url, true);
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
	public sendView(view: Function) {
		const obj: View = new (view.prototype.constructor)();
		obj.render().then((html) => {
			this.response.writeHead(200, {"Content-Type": "text/html"});
			this.response.end(html);
		}, (error) => {
			console.error(error);
			this.response.writeHead(500, {"Content-Type": "text/html"});
			this.response.end();
		});
	}
	public sendStream(size: number, readableStream: stream.Readable, mimeType: string) {
		this.response.writeHead(200, {"Content-Type": mimeType, "Content-Length": size});
		readableStream.pipe(this.response);
	}
	public sendFile(path: string) {
		return new Promise((resolve, reject) => {
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
