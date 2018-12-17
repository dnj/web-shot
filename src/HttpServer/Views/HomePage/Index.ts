import * as path from "path";
import View from "../../../Library/MVC/View";

export default class Index extends View {
	public getHTMLFile() {
		return path.resolve(__dirname, "../../HTML/HomePage/Index.ejs");
	}
}
