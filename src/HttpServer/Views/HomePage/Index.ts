import * as path from "path";
import View from "../../../Library/MVC/View";
import Shot, { Status } from "../../../Models/Shot";

export default class Index extends View {
	public title = "وب شات";
	public bodyClasses = "homepage";
	public images: string[] = [];
	public hostname: string;
	public getHTMLFile() {
		return path.resolve(__dirname, "../../HTML/HomePage/Index.ejs");
	}
	public async preLoad(): Promise<void> {
		const model = new Shot();
		model.where("status", Status.Available);
		model.where("full_page", "1");
		model.orderBy("create_at", "DESC");
		const shots = await model.get(4);
		const allresizes: Array<Promise<string>> = [];
		for (const shot of shots) {
			allresizes.push(shot.resize(700, 1200));
		}
		this.images = await Promise.all(allresizes);
	}
}
