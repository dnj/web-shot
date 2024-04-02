import { useBrowser } from "../utils/browser"

export default defineEventHandler(async (event) => {
	const browser = await useBrowser();
	return "hhh";
})
