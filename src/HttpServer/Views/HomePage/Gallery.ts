import * as path from "path";
import View from "../../../Library/MVC/View";
import Shot, { Status } from "../../../Models/Shot";

interface IShot {
	url: string;
	path: string;
}

export default class Gallery extends View {
	public title = "گالری تصاویر";
	public bodyClasses = "gallery";
	public page: number;
	public ipp: number;
	public shots: IShot[] = [];
	public shotsCount: number;
	public getHTMLFile() {
		return path.resolve(__dirname, "../../HTML/HomePage/Gallery.ejs");
	}
	public async preLoad(): Promise<void> {
		const model = new Shot();
		model.where("status", Status.Available);
		model.where("full_page", "1");
		model.orderBy("create_at", "DESC");
		model.withTotalCount();
		const shots = await model.paginate(this.page, this.ipp);
		this.shotsCount = model.getTotalCount();
		const allresizes: Array<Promise<void>> = [];
		for (const shot of shots) {
			const promise = shot.resize(700, 1200).then((resized) => {
				this.shots.push({
					url: shot.url,
					path: resized,
				});
			});
			allresizes.push(promise);
		}
		return Promise.all(allresizes) as any;
	}
	public async forAjax() {
		return {
			shots: this.shots,
			ipp: this.ipp,
			totlaCount: this.shotsCount,
		};
	}
}
