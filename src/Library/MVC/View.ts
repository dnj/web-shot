import * as ejs from "ejs";

abstract class View {
	public abstract getHTMLFile(): string;
	public forAjax(): {[key: string]: any; } {
		return {};
	}
	public render(): Promise<string> {
		return new Promise((resolve, reject) => {
			(ejs as any).delimiter = "?";
			ejs.renderFile(this.getHTMLFile(), {
				context: this,
			}, (err, html) => {
				if (err) {
					return reject(err);
				}
				resolve(html);
			});
		});
	}
}
export default View;
