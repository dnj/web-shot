import * as url from "url";
import InputValidationError from "./Exceptions/InputValidationError";

export enum InputType {
	Number,
	String,
	URL,
	Boolean,
	Email,
	Cellphone,
	IPv4,
	Date,
}
export interface IRule {
	required?: boolean;
	type?: InputType;
	default?: string | number | boolean;
}
export interface IPreDefinedRule<T> {
	values?: T[];
}
export interface INumberRule extends IRule, IPreDefinedRule<number> {
	type: InputType.Number;
	zero?: boolean; // Default: false
	negetive?: boolean; // Default: false
	float?: boolean; // Default: false
	default?: number;
	min?: number;
	max?: number;
}
export interface INullableRule {
	empty?: boolean; // Default: false
}
export interface IStringRule extends IRule, INullableRule, IPreDefinedRule<string> {
	type: InputType.String;
	htmlTags?: boolean; // Default: false
	multiLine?: boolean; // Default: true
	default?: string;
}
export interface IURLRule extends IRule, INullableRule, IPreDefinedRule<string> {
	type: InputType.URL;
	protocols?: string[]; // Default: ["http", "https"]
	default?: string;
}
export interface IEmailRule extends IRule, INullableRule, IPreDefinedRule<string> {
	type: InputType.Email;
	default?: string;
}
export interface ICellphoneRule extends IRule, INullableRule, IPreDefinedRule<string> {
	type: InputType.Cellphone;
	default?: string;
}
export interface IIPv4Rule extends IRule, INullableRule, IPreDefinedRule<string> {
	type: InputType.IPv4;
	default?: string;
}
export interface IDateRule extends IRule, INullableRule {
	type: InputType.Date;
}
export interface IBooleanRule extends IRule {
	type: InputType.Boolean;
	default?: boolean;
}
export interface IRules {
	[key: string]: INumberRule | IStringRule | IURLRule | IEmailRule | ICellphoneRule | IIPv4Rule | IDateRule | IBooleanRule;
}
interface IData {
	[key: string]: string;
}
export default class InputValidation {
	private newData: {
		[key: string]: any;
	} = {};
	public constructor(public rules: IRules, public data: IData) {
	}
	public validate() {
		for (const input in this.rules) {
			if (this.rules[input] !== undefined) {
				const rule = this.rules[input];
				if (this.data[input] === undefined) {
					if (rule.required) {
						throw new InputValidationError(input);
					} else if (rule.default !== undefined) {
						this.newData[input] = rule.default;
					}
					continue;
				}
				switch (rule.type) {
					case (InputType.Number): this.validateNumber(input); break;
					case (InputType.String): this.validateString(input); break;
					case (InputType.URL): this.validateURL(input); break;
					case (InputType.Boolean): this.validateBoolean(input); break;
					case (InputType.Email): this.validateEmail(input); break;
					case (InputType.Cellphone): this.validateCellphone(input); break;
					case (InputType.IPv4): this.validatvaeIPv4(input); break;
					case (undefined): this.newData[input] = this.data[input]; break;
				}
			}
		}
		return this.newData;
	}
	private validateNumber(input: string) {
		const data = this.data[input] as string;
		const rule = this.rules[input] as INumberRule;
		if (!data) {
			if (!rule.zero) {
				throw new InputValidationError(input, "empty-value");
			} else if (rule.default !== undefined) {
				this.newData[input] = rule.default;
			}
			return;
		}
		let regexStr = "^\\s*";
		if (rule.negetive) {
			regexStr += "-?";
		}
		regexStr += "\\d+";
		if (rule.float) {
			regexStr += "(?:\\.\\d+)";
		}
		regexStr += "\\s*$";
		const regex = new RegExp(regexStr);
		if (!regex.test(data)) {
			throw new InputValidationError(input, "not-a-number");
		}
		const number = rule.float ? parseFloat(data) : parseInt(data, 10);
		if (rule.values && rule.values.length) {
			let found = false;
			for (const item of rule.values) {
				if (item === number) {
					found = true;
					break;
				}
			}
			if (!found) {
				throw new InputValidationError(input, "not-defined-value");
			}
		} else {
			if (!number && !rule.zero) {
				throw new InputValidationError(input);
			}
			if (rule.min !== undefined && number < rule.min) {
				throw new InputValidationError(input, "min-value");
			}
			if (rule.max !== undefined && number > rule.max) {
				throw new InputValidationError(input, "max-value");
			}
		}
		this.newData[input] = number;
	}
	private validateString(input: string) {
		let data = this.data[input] as string;
		const rule = this.rules[input] as IStringRule;
		if (!data) {
			if (!rule.empty) {
				throw new InputValidationError(input);
			} else if (rule.default !== undefined) {
				this.newData[input] = rule.default;
			}
			return;
		}
		if (rule.values && rule.values.length) {
			let found = false;
			for (const item of rule.values) {
				if (item === data) {
					found = true;
					break;
				}
			}
			if (!found) {
				throw new InputValidationError(input);
			}
		} else {
			if (!rule.htmlTags) {
				data = data.replace(/\>/, "&gt;");
				data = data.replace(/\</, "&lt;");
			}
			if (!rule.multiLine) {
				data = data.replace(/\n/, "");
			}
		}
		this.newData[input] = data;
	}
	private validateURL(input: string) {
		const data = this.data[input] as string;
		const rule = this.rules[input] as IURLRule;
		if (!data) {
			if (!rule.empty) {
				throw new InputValidationError(input);
			} else if (rule.default !== undefined) {
				this.newData[input] = rule.default;
			}
			return;
		}
		if (rule.values && rule.values.length) {
			let found = false;
			for (const item of rule.values) {
				if (item === data) {
					found = true;
					break;
				}
			}
			if (!found) {
				throw new InputValidationError(input);
			}
		} else {
			const parsed = url.parse(data);
			if (!parsed) {
				throw new InputValidationError(input);
			}
			const protocols = rule.protocols || ["http", "https"];
			const parsedProtocol = parsed.protocol.substr(0, parsed.protocol.length - 1);
			let found = false;
			for (const protocol of protocols) {
				if (parsedProtocol === protocol) {
					found = true;
					break;
				}
			}
			if (!found) {
				throw new InputValidationError(input);
			}
		}
		this.newData[input] = data;
	}
	private validateBoolean(input: string) {
		const data = this.data[input];
		const rule = this.rules[input] as IURLRule;
		this.newData[input] = !(data === "0" || data === "false" || data === "");
	}
	private validateEmail(input: string) {
		const data = this.data[input] as string;
		const rule = this.rules[input] as IURLRule;
		if (!data) {
			if (!rule.empty) {
				throw new InputValidationError(input);
			} else if (rule.default !== undefined) {
				this.newData[input] = rule.default;
			}
			return;
		}
		if (rule.values && rule.values.length) {
			let found = false;
			for (const item of rule.values) {
				if (item === data) {
					found = true;
					break;
				}
			}
			if (!found) {
				throw new InputValidationError(input);
			}
		} else {
			const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (!re.test(data.toLowerCase())) {
				throw new InputValidationError(input);
			}
		}
		this.newData[input] = data;
	}
	private validateCellphone(input: string) {
		const data = this.data[input] as string;
		const rule = this.rules[input] as IURLRule;
		if (!data) {
			if (!rule.empty) {
				throw new InputValidationError(input);
			} else if (rule.default !== undefined) {
				this.newData[input] = rule.default;
			}
			return;
		}
		if (rule.values && rule.values.length) {
			let found = false;
			for (const item of rule.values) {
				if (item === data) {
					found = true;
					break;
				}
			}
			if (!found) {
				throw new InputValidationError(input);
			}
			this.newData[input] = data;
		} else {
			const re = /^\s*(?:\+?98|0)?(\d{10})\s*$/;
			const matches = data.match(re);
			if (!matches) {
				throw new InputValidationError(input);
			}
			switch (matches[1].substr(0, 3)) {
				case("910"): case("911"): case("912"): case("913"): case("914"): case("915"): case("916"): case("917"): case("918"): case("919"): case("990"): // TCI
				case("931"): // Spadan
				case("932"): // Taliya
				case("934"): // TKC
				case("901"): case("902"): case("903"): // IranCell - ISim
				case("930"): case("933"): case("935"): case("936"): case("937"): case("938"): case("939"): // IranCell
				case("920"): case("921"): case("922"): // RighTel
				case("920"): case("921"): case("922"): // RighTel
					break;
				default:
					throw new InputValidationError(input);
			}
			this.newData[input] = "98" + matches[1];
		}
	}
	private validatvaeIPv4(input: string) {
		const data = this.data[input] as string;
		const rule = this.rules[input] as IURLRule;
		if (!data) {
			if (!rule.empty) {
				throw new InputValidationError(input);
			} else if (rule.default !== undefined) {
				this.newData[input] = rule.default;
			}
			return;
		}
		if (rule.values && rule.values.length) {
			let found = false;
			for (const item of rule.values) {
				if (item === data) {
					found = true;
					break;
				}
			}
			if (!found) {
				throw new InputValidationError(input);
			}
		} else {
			const re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
			if (!re.test(data)) {
				throw new InputValidationError(input);
			}
		}
		this.newData[input] = data;
	}
}
