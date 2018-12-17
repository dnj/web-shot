import * as fs from "fs";
import Model, {ColumnType} from "../Library/Database/Model";

export enum Status {
	Capturing,
	Available,
	Error,
}
export enum Format {
	JPG,
	PNG,
}
interface IGetOrCreateParameters {
	maxAge?: number;
	format?: Format;
	full_page?: boolean;
	viewport_width?: number;
	viewport_height?: number;
}
interface ISize {
	width: number;
	height: number;
}
export default class Shot extends Model {
	public static getImageStoragePath() {
		return "storage/shots";
	}
	public static async getByURL(url: string, parameters?: IGetOrCreateParameters): Promise<Shot> {
		if (parameters === undefined) {
			parameters = {};
		}
		const model = new Shot();
		model.whereIn("status", [Status.Available, Status.Capturing]);
		if (parameters.maxAge) {
			model.where("create_at", Math.floor(Date.now() / 1000) - parameters.maxAge, ">=");
		}
		if (parameters.format !== undefined) {
			model.where("format", parameters.format);
		}
		if (parameters.full_page !== undefined) {
			model.where("full_page", parameters.full_page ? 1 : 0);
		}
		if (parameters.viewport_width !== undefined) {
			model.where("viewport_width", parameters.viewport_width);
		}
		if (parameters.viewport_height !== undefined) {
			model.where("viewport_height", parameters.viewport_height);
		}
		model.where("url", url);
		return model.getOne();
	}
	public static async getOrCreate(url: string, parameters?: IGetOrCreateParameters): Promise<Shot> {
		if (parameters === undefined) {
			parameters = {};
		}
		let shot = await Shot.getByURL(url, parameters);
		if (shot === undefined) {
			shot = new Shot();
			shot.set("create_at", Math.floor(Date.now() / 1000));
			shot.set("url", url);
			shot.set("status", Status.Capturing);
			if (parameters.format !== undefined) {
				shot.set("format", parameters.format);
			}
			if (parameters.full_page !== undefined) {
				shot.set("full_page", parameters.full_page ? 1 : 0);
			}
			if (parameters.viewport_width !== undefined) {
				shot.set("viewport_width", parameters.viewport_width);
			}
			if (parameters.viewport_height !== undefined) {
				shot.set("viewport_height", parameters.viewport_height);
			}
			await shot.save();
		}
		return shot;
	}
	public readonly id: number;
	public readonly create_at: number;
	public readonly capture_at?: number;
	public readonly url: string;
	public readonly format: Format;
	public readonly full_page: boolean;
	public readonly viewport_width: number;
	public readonly viewport_height: number;
	public readonly image?: string;
	public readonly status: Status;
	public getImagePath(size?: ISize) {
		let path = Shot.getImageStoragePath() + `/${this.id}`;
		if (size && (size.height !== this.viewport_height || size.width !== this.viewport_width)) {
			path += `-${size.width}x${size.height}`;
		}
		path += "." + (this.format === Format.PNG ? "png" : "jpg");
		return path;
	}
	public isExist(size?: ISize): Promise<boolean> {
		return new Promise((resolve) => {
			fs.exists(this.getImagePath(size), (exists) => {
				resolve(exists);
			});
		});
	}
	protected table() {
		return "shots";
	}
	protected columns() {
		return [
			{name: "id", type: ColumnType.Int, autoIncrement: true, primary: true, unsinged: true},
			{name: "create_at", type: ColumnType.Int, unsinged: true},
			{name: "capture_at", type: ColumnType.Int, unsinged: true, nullable: true},
			{name: "url", type: ColumnType.Varchar, length: 535, index: true},
			{name: "format", type: ColumnType.TinyInt},
			{name: "full_page", type: ColumnType.TinyInt},
			{name: "image", type: ColumnType.Varchar, length: 100, collation: "latin1_general_ci", nullable: true},
			{name: "status", type: ColumnType.TinyInt},
		];
	}
}
