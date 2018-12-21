import { IRule } from "../Library/HttpServer/HttpServer";
import Capture from "./Controllers/Capture";
import HomePage from "./Controllers/HomePage";

export default [
	{path: "/assets/:path...", controller: HomePage.assets},
	{path: "/storage/shots/:file", controller: HomePage.storageShots},
	{path: "/.well-known/acme-challenge/:file", controller: HomePage.ACMEChallenge},
	{path: "/", controller: HomePage.index},
	{path: "/capture", controller: Capture.request},
	{path: "/docs", controller: HomePage.docs},
	{path: "/gallery", controller: HomePage.gallery},
] as IRule[];
