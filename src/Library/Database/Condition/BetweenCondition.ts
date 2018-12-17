import EscapedString from "../EscapedString";
import ICondition from "../ICondition";
export default class BetweenCondition implements ICondition {
	public constructor(public column: string, public start: number, public end: number, public isBetween = true) {
	}
	public toString() {
		return new EscapedString(`${this.column} ${this.isBetween ? "BETWEEN" : "NOT BETWEEN"} ? AND ?`, [this.start, this.end]);
	}
}
