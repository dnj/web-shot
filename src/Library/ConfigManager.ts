import Option from "../Models/Option";

export default class ConfigManager {
	private cache: {
		[key: string]: any;
	} = {};
	public async preload() {
		const options = await Option.getAutoloads();
		for (const option of options) {
			this.cache[option.name] = option.valueOfColumn("value");
		}
	}
	public async get(name: string, defaultValue?: any) {
		if (this.cache[name] !== undefined) {
			return this.cache[name];
		}
		const option = await Option.byName(name);
		if (!option) {
			return defaultValue;
		}
		return this.cache[name] = option.valueOfColumn("value");
	}
	public async set(name: string, value: any, autoload = false) {
		let option = await Option.byName(name);
		if (!option) {
			option = new Option();
			option.set("name", name);
		}
		option.set("value", value);
		option.set("autoload", autoload ? 1 : 0);
		await option.save();
		return this.cache[name] = option.valueOfColumn("value");
	}
	public async delete(name: string) {
		const option = await Option.byName(name);
		if (option) {
			await option.delete();
		}
	}
}
