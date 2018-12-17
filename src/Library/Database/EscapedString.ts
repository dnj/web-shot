export default class EscapedString {
	protected _string: string;
	protected _values: Array<string|number> = [];
	public constructor(string: string, values?: Array<string|number>) {
		this._string = string;
		this._values = values;
	}
	public append(str: string|EscapedString) {
		if (typeof str === "string") {
			this._string += str;
		} else {
			this._string += str._string;
			this._values = this._values ? this._values.concat(str._values) : str._values;
		}
	}
	get string() {
		return this._string;
	}
	get values() {
		return this._values;
	}
}
