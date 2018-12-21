import * as $ from "jquery";

interface IShot {
	url: string;
	path: string;
}

export default class Gallery {
	public static initIfNeeded() {
		Gallery.$body = $("body.gallery");
		if (Gallery.$body.length) {
			Gallery.init();
		}
	}
	protected static $body: JQuery;
	protected static init() {
		Gallery.loadMoreShots();
	}
	protected static loadMoreShots() {
		let page = 1;
		let totlaCount: number;
		let ipp: number;
		$(window).on("scroll", function() {
			if ((totlaCount !== undefined && page * ipp >= totlaCount) || page >= 20) {
				return;
			}
			const windowHeight = $(document).height() - $(this).height();
			const scrollTop = $(this).scrollTop();
			if (windowHeight / 2 < scrollTop) {
				$.ajax({
					url: `/gallery`,
					data: {
						ajax: 1,
						page: ++page,
					},
					type: "get",
					success: (data) => {
						for (const shot of data.shots as IShot[]) {
							$(".page-content .shots", Gallery.$body).append(`<a href="${shot.url}" class="shot" target="_blank">
							<img class="img-fluid" src="${shot.path}" alt="Preview of ${shot.url}">
						</a>`);
						}
						totlaCount = data.totlaCount;
						ipp = data.ipp;
					},
					error: (error) => {
						console.error("ajax.error", error);
					},
				});
			}
		});
	}
}
