import "bootstrap";
import * as $ from "jquery";
import Docs from "./Classes/Docs";
import Gallery from "./Classes/Gallery";
import HomePage from "./Classes/HomePage";

$(() => {
	HomePage.initIfNeeded();
	Docs.initIfNeeded();
	Gallery.initIfNeeded();
});
