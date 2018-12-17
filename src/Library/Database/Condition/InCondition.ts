import EscapedString from "../EscapedString";
import ICondition from "../ICondition";
export default class InCondition implements ICondition {
	public constructor(public column: string, public values: Array<string|number>, public isIn = true) {
	}
	public toString() {
		let str = `${this.column} ${this.isIn ? "IN" : "NOT IN"} (`;
		for (let x = 0, l = this.values.length; x < l; x++) {
			str += x > 0 ? ", ?" : "?";
		}
		str += ")";
		return new EscapedString(str, this.values);
	}
}
