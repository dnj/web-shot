import AndCondition from "./Condition/AndCondition";
import BetweenCondition from "./Condition/BetweenCondition";
import BinaryCondition from "./Condition/BinaryCondition";
import InCondition from "./Condition/InCondition";
import LikeCondition from "./Condition/LikeCondition";
import NullCondition from "./Condition/NullCondition";
import OrCondition from "./Condition/OrCondition";
import RawCondition from "./Condition/RawCondition";
import RegexpCondition from "./Condition/RegexpCondition";
import EscapedString from "./EscapedString";
import ICondition from "./ICondition";
import Value from "./Value";

export type BinaryConditionOperator = "=" | "!=" | ">" | ">=" | "<" | "<=";
export type Connector = "AND" | "OR";
export default class Condition implements ICondition {
	protected _condition: ICondition;

	public equals(column: string, value: Value, connector: Connector = "AND") {
		this.compare(column, value, "=", connector);
	}
	public NotEquals(column: string, value: Value, connector: Connector = "AND") {
		this.compare(column, value, "!=", connector);
	}

	public compare(column: string, value: Value, operator: BinaryConditionOperator, connector: Connector = "AND") {
		const condition = new BinaryCondition(column, value, operator);
		this.connect(condition, connector);
	}

	public like(column: string, value: Value, connector: Connector = "AND") {
		const condition = new LikeCondition(column, value);
		this.connect(condition, connector);
	}
	public notLike(column: string, value: Value, connector: Connector = "AND") {
		const condition = new LikeCondition(column, value, false);
		this.connect(condition, connector);
	}
	public regexp(column: string, value: string, connector: Connector = "AND") {
		const condition = new RegexpCondition(column, value);
		this.connect(condition, connector);
	}
	public notRegexp(column: string, value: string, connector: Connector = "AND") {
		const condition = new RegexpCondition(column, value, false);
		this.connect(condition, connector);
	}

	public in(column: string, values: Value[], connector: Connector = "AND") {
		const condition = new InCondition(column, values);
		this.connect(condition, connector);
	}
	public notIn(column: string, values: Value[], connector: Connector = "AND") {
		const condition = new InCondition(column, values, false);
		this.connect(condition, connector);
	}

	public null(column: string, connector: Connector = "AND") {
		const condition = new NullCondition(column);
		this.connect(condition, connector);
	}
	public notNull(column: string, connector: Connector = "AND") {
		const condition = new NullCondition(column, false);
		this.connect(condition, connector);
	}

	public between(column: string, start: number, end: number, connector: Connector = "AND") {
		const condition = new BetweenCondition(column, start, end);
		this.connect(condition, connector);
	}
	public notBetween(column: string, start: number, end: number, connector: Connector = "AND") {
		const condition = new BetweenCondition(column, start, end, false);
		this.connect(condition, connector);
	}
	public raw(condition: string, values?: Value[], connector: Connector = "AND") {
		this.connect(new RawCondition(condition, values), connector);
	}
	public and(condition: ICondition) {
		if (this._condition === undefined) {
			this._condition = condition;
			return;
		}
		this._condition = new AndCondition(this._condition, condition);
	}
	public or(condition: ICondition) {
		if (this._condition === undefined) {
			this._condition = condition;
			return;
		}
		this._condition = new OrCondition(this._condition, condition);
	}
	public isEmpty() {
		return this._condition === undefined;
	}
	public toString() {
		if (this._condition === undefined) {
			return "1";
		}
		return this._condition.toString();
	}
	protected connect(condition: ICondition, connector: Connector) {
		if (connector === "AND") {
			this.and(condition);
		} else if (connector === "OR") {
			this.or(condition);
		}
	}
}
