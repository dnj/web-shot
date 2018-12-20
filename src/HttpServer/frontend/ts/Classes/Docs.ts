import * as $ from "jquery";

export default class Docs {
	public static initIfNeeded() {
		Docs.$body = $("body.docs");
		if (Docs.$body.length) {
			Docs.init();
		}
	}
	protected static $body: JQuery;
	protected static init() {
		Docs.changeUrlListener();
	}
	protected static changeUrlListener() {
		$(".page-content input[name=url]", Docs.$body).on("change keyup", function() {
			const val = $(this).val() as string;
			if (val.length) {
				$(".page-content .btn-shoot-shot", Docs.$body).attr("href", val);
			}
		}).trigger("change");
	}
}
