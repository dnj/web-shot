import EscapedString from "../EscapedString";
import ICondition from "../ICondition";
export default class RawCondition implements ICondition {
	public constructor(public condition: string, public values?: Array<string|number>) {
	}
	public toString() {
		return this.values ? new EscapedString(this.condition, this.values) : this.condition;
	}
}
