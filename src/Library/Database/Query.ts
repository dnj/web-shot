import App from "../../App";
import Condition, {BinaryConditionOperator, Connector as ConditionConnector} from "./Condition";
import RawCondition from "./Condition/RawCondition";
import EscapedString from "./EscapedString";
import ICondition from "./ICondition";
import IRow from "./IRow";
import Value from "./Value";

export type JoinType = "LEFT" | "RIGHT" | "INNER";
export type OrderType = "ASC" | "DESC" | string;
export type Limit = number | number[];
export interface IJoin {
	table: string;
	condition: ICondition;
	type: JoinType;
}
export interface IOrder {
	column: string;
	method: OrderType;
}
export default class Query {
	protected _where: Condition;
	protected _having: Condition;
	protected _joins: IJoin[] = [];
	protected _orders: IOrder[] = [];
	protected _groupby: string;
	public constructor() {
		this._where = new Condition();
		this._having = new Condition();
	}

	public where(column: string, value?: Value, operator: BinaryConditionOperator = "=", connector?: ConditionConnector) {
		this._where.compare(column, value, operator, connector);
		return this;
	}
	public whereNot(column: string, value: Value, connector?: ConditionConnector) {
		this._where.NotEquals(column, value, connector);
		return this;
	}

	public whereLike(column: string, value: Value, connector?: ConditionConnector) {
		this._where.like(column, value, connector);
		return this;
	}
	public whereNotLike(column: string, value: Value, connector?: ConditionConnector) {
		this._where.notLike(column, value, connector);
		return this;
	}

	public whereRegexp(column: string, value: string, connector?: ConditionConnector) {
		this._where.regexp(column, value, connector);
		return this;
	}
	public whereNotRegexp(column: string, value: string, connector?: ConditionConnector) {
		this._where.notRegexp(column, value, connector);
		return this;
	}

	public whereIn(column: string, values: Value[], connector?: ConditionConnector) {
		this._where.in(column, values, connector);
		return this;
	}
	public whereNotIn(column: string, values: Value[], connector?: ConditionConnector) {
		this._where.notIn(column, values, connector);
		return this;
	}

	public whereNull(column: string, connector?: ConditionConnector) {
		this._where.null(column, connector);
		return this;
	}
	public whereNotNull(column: string, connector?: ConditionConnector) {
		this._where.notNull(column, connector);
		return this;
	}

	public whereBetween(column: string, start: number, end: number, connector?: ConditionConnector) {
		this._where.between(column, start, end, connector);
		return this;
	}
	public whereNotBetween(column: string, start: number, end: number, connector?: ConditionConnector) {
		this._where.notBetween(column, start, end, connector);
		return this;
	}

	public whereRaw(condition: string, values?: Value[], connector?: ConditionConnector) {
		this._where.raw(condition, values, connector);
		return this;
	}
	public whereAnd(condition: ICondition) {
		this._where.and(condition);
		return this;
	}
	public whereOr(condition: ICondition) {
		this._where.or(condition);
		return this;
	}

	public havingAnd(condition: ICondition) {
		this._having.and(condition);
		return this;
	}
	public havingOr(condition: ICondition) {
		this._having.or(condition);
		return this;
	}
	public join(table: string, condition: ICondition|string, type: JoinType) {
		if (typeof condition === "string") {
			condition = new RawCondition(condition);
		}
		this._joins.push({table, condition, type});
		return this;
	}
	public orderBy(column: string, method: OrderType) {
		this._orders.push({column, method});
		return this;
	}
	public groupBy(column: string) {
		this._groupby = column;
		return this;
	}
	public raw(query: string|EscapedString): Promise<IRow[]> {
		return new Promise((resolve, reject) => {
			let str: string;
			let values: Value[];
			if (typeof query === "string") {
				str = query;
			} else {
				str = query.string;
				values = query.values;
			}
			App.getDatabaseManager().query(str, values).then(resolve, reject);
		});
	}
	public get(table: string, limit?: Limit, columns?: string|string[]): Promise<IRow[]> {
		if (columns !== undefined) {
			if (typeof columns !== "string") {
				columns = columns.join(", ");
			}
		} else {
			columns = "*";
		}
		const query = new EscapedString(`SELECT ${columns} FROM ${table}`);
		query.append(this.createJoins());
		query.append(this.createWhere());
		query.append(this.createGroupBy());
		query.append(this.createOrders());
		query.append(this.createLimit(limit));
		return this.raw(query);
	}
	public getOne(table: string, columns?: string|string[]): Promise<IRow> {
		return new Promise((resolve, reject) => {
			this.get(table, 1, columns).then((rows) => {
				resolve(rows.length > 0 ? rows[0] : undefined);
			}, reject);
		});
	}
	public getValue(table: string, column: string): Promise<Value> {
		return new Promise((resolve, reject) => {
			this.get(table, 1, [column + " as `val`"]).then((rows) => {
				resolve(rows.length > 0 ? rows[0].val : undefined);
			}, reject);
		});
	}
	public has(table: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.get(table, 1, "1").then((rows) => {
				resolve(rows.length > 0);
			}, reject);
		});
	}
	public insert(table: string, row: IRow): Promise<number> {
		return new Promise((resolve, reject) => {
			let columns = "";
			let placeholders = "";
			const values: Value[] = [];
			for (const column in row) {
				if (row[column] !== undefined) {
					if (columns) {
						columns += ", ";
						placeholders += ", ";
					}
					columns += column;
					placeholders += "?";
					values.push(row[column]);
				}
			}
			App.getDatabaseManager().getConnection().then((connection) => {
				connection.query(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values, (err, results) => {
					connection.release();
					if (err) {
						reject(err);
					} else {
						resolve(results.insertId);
					}
				});
			}, reject);
		});
	}
	public update(table: string, row: IRow): Promise<number> {
		return new Promise((resolve, reject) => {
			let sets = "";
			const values: Value[] = [];
			for (const key in row) {
				if (row[key] !== undefined) {
					if (sets) {
						sets += ", ";
					}
					sets += `${key} = ?`;
					values.push(row[key]);
				}
			}
			const query = new EscapedString(`UPDATE ${table} SET ${sets}`, values);
			query.append(this.createWhere());
			App.getDatabaseManager().getConnection().then((connection) => {
				connection.query(query.string, query.values, (err, results) => {
					connection.release();
					if (err) {
						reject(err);
					} else {
						resolve(results.affectedRows);
					}
				});
			}, reject);
		});
	}
	public delete(table: string, limit?: Limit): Promise<number> {
		return new Promise((resolve, reject) => {
			const query = new EscapedString(`DELETE FROM ${table}`);
			query.append(this.createWhere());
			query.append(this.createLimit(limit));
			App.getDatabaseManager().getConnection().then((connection) => {
				connection.query(query.string, query.values, (err, results) => {
					connection.release();
					if (err) {
						reject(err);
					} else {
						resolve(results.affectedRows);
					}
				});
			}, reject);
		});
	}
	protected createJoins() {
		let str = "";
		let values: Value[] = [];
		for (const join of this._joins) {
			let conditionStr: string;
			if (typeof join.condition === "string") {
				conditionStr = join.condition;
			} else {
				const condition = join.condition.toString();
				if (typeof condition === "string") {
					conditionStr = condition;
				} else {
					conditionStr = condition.string;
					values = values.concat(condition.values);
				}
			}
			str += ` ${join.type} JOIN ${join.table} ON ${conditionStr}`;
		}
		return values.length === 0 ? str : new EscapedString(str, values);
	}
	protected createOrders() {
		if (!this._orders.length) {
			return "";
		}
		let str;
		for (const order of this._orders) {
			if (str) {
				str += ", ";
			} else {
				str = " ORDER BY ";
			}
			str += order.column + " " + order.method;
		}
		return str;
	}
	protected createLimit(limit: Limit) {
		let str = "";
		if (limit !== undefined) {
			str += " LIMIT ";
			if (typeof limit === "number") {
				str += limit;
			} else {
				str += limit[0] + ", " + limit[1];
			}
		}
		return str;
	}
	protected createGroupBy() {
		let str = "";
		if (this._groupby) {
			str += " GROUP BY " + this._groupby;
		}
		return str;
	}
	protected createWhere() {
		let str = "";
		let values: Value[] = [];
		if (!this._where.isEmpty()) {
			const where = this._where.toString();
			if (where instanceof EscapedString) {
				str += " WHERE " + where.string;
				values = values.concat(where.values);
			} else {
				str += " WHERE " + where;
			}
		}
		return values.length === 0 ? str : new EscapedString(str, values);
	}
}
