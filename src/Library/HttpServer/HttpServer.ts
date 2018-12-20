import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as path from "path";
import ServerError from "../Exceptions/ServerError";
import Client from "./Client";

// tslint:disable:ban-types

interface ICachedRulePath {
	type: "static" | "dynamic" | "wildcard";
	name: string;
	regex?: RegExp;
	minimum?: number;
}
interface ICachedRule {
	path: ICachedRulePath[];
	controller: Function;
	haveWildcard: boolean;
}

export interface IRuleStaticPath {
	type: "static";
	name: string;
}
export interface IRuleDynamicPath {
	type: "dynamic";
	name: string;
	regex?: RegExp;
}
export interface IRuleWildcardPath {
	type: "wildcard";
	name: string;
	regex?: RegExp;
	minimum?: number;
}
export interface IRule {
	path: Array<IRuleStaticPath | IRuleDynamicPath | IRuleWildcardPath | string> | string;
	controller: Function;
}
export interface ISSLOptions {
	/**
	 * listening port for https connections
	 * @default 443
	 */
	port?: number;
	/**
	 * Path to key file which saved in pem format
	 */
	key: string;
	/**
	 * Path to cert file which saved in pem format
	 */
	cert: string;
	/**
	 * redirect to https
	 * @default true
	 */
	redirect?: boolean;
}
export interface IOptions {
	/**
	 * listening port for http connections
	 * @default 80
	 */
	port?: number;
	/**
	 * listening hostname for http connections
	 */
	hostname?: string;
	publicdirectory?: string;
	ssl?: ISSLOptions;
}
export default class HttpServer {
	private options: IOptions;
	private http: http.Server;
	private https: https.Server;
	private routes: ICachedRule[] = [];
	public constructor(protected rules: IRule[], options?: IOptions) {
		if (options === undefined) {
			options = {};
		}
		if (options.port === undefined) {
			options.port = 80;
		}
		if (options.hostname === undefined) {
			options.hostname = "anbari.space";
		}
		if (options.publicdirectory === undefined) {
			options.publicdirectory = path.resolve(__dirname, "../../HttpServer/public");
		}
		if (options.ssl) {
			if (!options.ssl.port) {
				options.ssl.port = 443;
			}
			if (options.ssl.redirect === undefined) {
				options.ssl.redirect = true;
			}
		}
		this.options = options;
	}
	public run(): Promise<void> {
		this.cacheRules();
		const promises: Array<Promise<void>> = [];
		promises.push(this.runHttp());
		if (this.options.ssl) {
			promises.push(this.runHttps());
		}
		return Promise.all(promises) as any;
	}
	public notFoundPage(): Promise<Buffer> {
		return Promise.resolve(Buffer.from(`<html>
		<head><title>404 Not Found</title></head>
		<body bgcolor="white">
		<center><h1>404 Not Found</h1></center>
		<hr><center>nginx/1.10.3 (Ubuntu)</center>
		</body>
		</html>`, "utf8"));
		/*return new Promise((resolve, reject) => {
			fs.readFile(this.options.publicdirectory + "/notfound.html", (err, data) => {
				if (err) {
					return reject(err);
				}
				resolve(data);
			});
		});*/
	}

	private runHttp(): Promise<void> {
		this.http = http.createServer((request, response) => {
			this.handleRequest(request, response, false);
		});
		return new Promise((resolve) => {
			this.http.listen(this.options.port, resolve);
		});
	}
	private runHttps(): Promise<void> {
		return new Promise((resolve, reject) => {
			fs.readFile(this.options.ssl.key, "utf8", (errKey, key) => {
				if (errKey) {
					return reject(errKey);
				}
				fs.readFile(this.options.ssl.cert, "utf8", (errCert, cert) => {
					if (errCert) {
						return reject(errCert);
					}
					this.https = https.createServer({
						key: key,
						cert: cert,
					}, (request, response) => {
						this.handleRequest(request, response, true);
					});
					this.https.listen(this.options.ssl.port, resolve);
				});
			});
		});
	}

	private handleRequest(request: http.IncomingMessage, response: http.ServerResponse, isSSL: boolean) {
		const client = new Client(this, request, response);
		if (!isSSL) {
			let mainHost = this.options.hostname;
			if (this.options.port && this.options.port !== 80) {
				mainHost += ":" + this.options.port;
			}
			if (client.host !== mainHost) {
				client.sendNotFound();
				return;
			}
			if (this.options.ssl && this.options.ssl.redirect && !request.url.startsWith("/.well-known/acme-challenge/")) {
				let SSLMainHost = this.options.hostname;
				if (this.options.ssl.port && this.options.ssl.port !== 443) {
					SSLMainHost += ":" + this.options.ssl.port;
				}
				client.redirect(`https://${SSLMainHost}${request.url}`);
				return;
			}
		} else if (this.options.ssl) {
			let mainHost = this.options.hostname;
			if (this.options.ssl.port && this.options.ssl.port !== 443) {
				mainHost += ":" + this.options.ssl.port;
			}
			if (client.host !== mainHost) {
				client.sendNotFound();
				return;
			}
		}
		const routing = this.route(client.url.pathname);
		if (!routing) {
			client.sendNotFound();
			return;
		}
		const promise = routing.rule.controller.call(this, client, routing.data) as Promise<void>;
		if (promise) {
			promise.catch((e) => {
				if (e instanceof ServerError) {
					client.sendJSON(e.toJson(), e.code);
				} else {
					console.error(e);
				}
			});
		}
	}
	private route(url: string) {
		while (url.substr(-1) === "/") {
			url = url.substr(0, url.length - 1);
		}
		const parts = url.split("/");
		const partsLength = parts.length;
		let data: {[key: string]: string} = {};
		const checkRule = (rule: ICachedRule): boolean => {
			if (!rule.haveWildcard && rule.path.length !== partsLength) {
				return false;
			}
			let partX = 0;
			data = {};
			const checkPath = (rulePath: ICachedRulePath) => {
				if (partX >= partsLength) {
					return false;
				}
				if (rulePath.type === "static") {
					if (rulePath.name !== parts[partX]) {
						return false;
					}
					partX++;
				} else if (rulePath.type === "dynamic") {
					if (rulePath.regex !== undefined && !rulePath.regex.test(parts[partX])) {
						return false;
					}
					data[rulePath.name] = parts[partX];
					partX++;
					return true;
				} else if (rulePath.type === "wildcard") {
					let catchs = 0;
					while (partX < partsLength) {
						if (rulePath.regex !== undefined && !rulePath.regex.test(parts[partX])) {
							break;
						}
						if (data[rulePath.name]) {
							data[rulePath.name] += "/" + parts[partX];
						} else {
							data[rulePath.name] = parts[partX];
						}
						partX++;
						catchs++;
					}
					if (rulePath.minimum !== undefined) {
						if (rulePath.minimum > catchs) {
							return false;
						}
					} else if (catchs === 0) {
						return false;
					}
				}
				return true;
			};
			for (const rulePath of rule.path) {
				if (!checkPath(rulePath)) {
					return false;
				}
			}
			return true;
		};
		let found: ICachedRule;
		for (const rule of this.routes) {
			if (checkRule(rule)) {
				found = rule;
				break;
			}
		}
		if (!found) {
			return;
		}
		return {
			rule: found,
			data,
		};
	}
	private cacheRules() {
		for (const rule of this.rules) {
			const cached: ICachedRule = {
				path: [],
				controller: rule.controller,
				haveWildcard: false,
			};
			const handlePart = (part) => {
				if (part.charAt(0) === ":") {
					const isWildCard = part.substr(-3) === "...";
					cached.path.push({
						type: !isWildCard ? "dynamic" : "wildcard",
						name: part.substr(1, isWildCard ? part.length - 4 : undefined),
					});
					if (isWildCard) {
						cached.haveWildcard = true;
					}
				} else {
					cached.path.push({
						type: "static",
						name: part,
					});
				}
			};
			if (typeof rule.path === "string") {
				while (rule.path.substr(-1) === "/") {
					rule.path = rule.path.substr(0, rule.path.length - 1);
				}
				const parts = rule.path.split("/");
				for (const part of parts) {
					handlePart(part);
				}
			} else {
				for (const part of rule.path) {
					if (typeof part === "string") {
						handlePart(part);
					} else {
						if (!part.type) {
							part.type = "static";
						}
						cached.path.push(part);
						if (part.type === "wildcard") {
							cached.haveWildcard = true;
						}
					}
				}
			}
			this.routes.push(cached);
		}
	}
}
