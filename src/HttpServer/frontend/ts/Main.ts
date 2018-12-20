import * as $ from "jquery";
import Docs from "./Classes/Docs";
import HomePage from "./Classes/HomePage";

$(() => {
	HomePage.initIfNeeded();
	Docs.initIfNeeded();
});
