import * as ejs from "ejs";

abstract class View {
	public abstract title: string;
	public bodyClasses: string | string[] = [];
	public abstract getHTMLFile(): string;
	public forAjax(): {[key: string]: any; } {
		return {};
	}
	public preLoad(): Promise<void> {
		return Promise.resolve();
	}
	public render(): Promise<string> {
		return new Promise(async (resolve, reject) => {
			await this.preLoad();
			(ejs as any).delimiter = "?";
			ejs.clearCache();
			ejs.renderFile(this.getHTMLFile(), this, {context: this}, (err, html) => {
				if (err) {
					return reject(err);
				}
				resolve(html);
			});
		});
	}
}
export default View;
