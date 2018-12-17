import ICondition from "../ICondition";
export default class NullCondition implements ICondition {
	public constructor(public column: string, public isNull: boolean = true) {
	}
	public toString() {
		return `${this.column} ${this.isNull ? "IS" : "IS NOT"} NULL`;
	}
}
