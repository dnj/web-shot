import BinaryCondition from "./BinaryCondition";
export default class LikeCondition extends BinaryCondition {
	public constructor(public column: string | number, public value: number | string, public isLike = true) {
		super(column, value, isLike ? "LIKE" : "NOT LIKE");
	}
}
