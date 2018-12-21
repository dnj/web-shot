import * as path from "path";
import View from "../../../Library/MVC/View";

export default class Docs extends View {
	public title = "مستندات";
	public bodyClasses = "docs";
	public hostname: string;
	public getHTMLFile() {
		return path.resolve(__dirname, "../../HTML/HomePage/Docs.ejs");
	}
}
