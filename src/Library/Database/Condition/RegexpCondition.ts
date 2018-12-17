import BinaryCondition from "./BinaryCondition";
export default class RegexpCondition extends BinaryCondition {
	public constructor(public column: string | number, public regexp: string, public isMatch = true) {
		super(column, regexp, isMatch ? "REGEXP" : "NOT REGEXP");
	}
}
