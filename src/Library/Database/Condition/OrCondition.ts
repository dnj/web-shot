import EscapedString from "../EscapedString";
import ICondition from "../ICondition";
import AndCondition from "./AndCondition";
export default class OrCondition implements ICondition {
	public constructor(public left: ICondition, public right: ICondition) {
	}
	public toString() {
		let str: string = "";
		const left = this.left.toString();
		const leftIsEscaped = left instanceof EscapedString;
		const leftString = left instanceof EscapedString ? left.string : left;
		const right = this.right.toString();
		const rightIsEscaped = right instanceof EscapedString;
		const rightString = right instanceof EscapedString ? right.string : right;
		str += this.left instanceof AndCondition ? `(${leftString})` : leftString;
		str += " OR ";
		str += this.right instanceof AndCondition ? `(${rightString})` : rightString;
		if (leftIsEscaped || rightIsEscaped) {
			const values: Array<string|number> = [];
			if (leftIsEscaped) {
				values.push(...(left as EscapedString).values);
				if (rightIsEscaped) {
					values.push(...(right as EscapedString).values);
				}
			} else if (rightIsEscaped) {
				values.push(...(right as EscapedString).values);
			}
			return new EscapedString(str, values);
		}
	}
}
