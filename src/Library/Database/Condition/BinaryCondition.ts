import EscapedString from "../EscapedString";
import ICondition from "../ICondition";
export type Operator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "LIKE" | "NOT LIKE" | "REGEXP" | "NOT REGEXP";
export default class BinaryCondition implements ICondition {
	public constructor(public column: string | number, public value: number | string, public operator: Operator) {
	}
	public toString() {
		return new EscapedString(`${this.column} ${this.operator} ?`, [this.value]);
	}
}
