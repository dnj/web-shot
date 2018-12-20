import * as $ from "jquery";

export default class HomePage {
	public static initIfNeeded() {
		HomePage.$body = $("body.homepage");
		if (HomePage.$body.length) {
			HomePage.init();
		}
	}
	protected static $body: JQuery;
	protected static init() {
		HomePage.ShootShotListener();
	}
	protected static ShootShotListener() {
		const $header = $(".page-content .header");
		const $shots = $(".shots", $header);
		$(".btn-shoot-shot", $header).on("click", (e) => {
			e.preventDefault();
			const url = $("input[name=url]", $header).val() as string;
			if (url.substring(0, 7) !== "http://" && url.substring(0, 8) !== "https://") {
				return;
			}
			if ($(".shot", $shots).length === 4) {
				$(".shot", $shots).last().remove();
			}
			let width: number;
			let height: number;
			$shots.each(function() {
				const $image = $("img", this);
				if (width === undefined || $image.width() > width) {
					width = $image.width();
				}
				if (height === undefined || $image.height() > height) {
					height = $image.height();
				}
			});
			$shots.prepend(`<div class="col-md-3 col-sm-3 col-6 shot">
			<img class="img-fluid" src="capture?url=${url}&fullPage=true&width=700&crop=1200" alt="Preview of ${url}" style="min-width: ${width}px; min-height: ${height}px;">
		</div>`);
		});
	}
}
