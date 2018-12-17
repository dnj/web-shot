import Exception from "../Exception";
import Listenable from "../Listenable";
import Condition, {BinaryConditionOperator, Connector as ConditionConnector} from "./Condition";
import RawCondition from "./Condition/RawCondition";
import EscapedString from "./EscapedString";
import ICondition from "./ICondition";
import IRow from "./IRow";
import PrepareDataEvent from "./PrepareDataEvent";
import Query, { IJoin, IOrder, JoinType, Limit, OrderType } from "./Query";
import Value from "./Value";

export enum ColumnType {
	TinyInt,
	SmallInt,
	MediumInt,
	Int,
	BigInt,
	Decimal,
	Float,
	Double,
	Bit,
	Boolean,
	Date,
	DateTime,
	Timestamp,
	Time,
	Year,
	Char,
	Varchar,
	TinyText,
	Text,
	MediumText,
	LongText,
	Binary,
	Varbinary,
	TinyBlob,
	Blob,
	MediumBlob,
	LongBlob,
	Json,
}
export enum IndexType {
	Primary,
	Index,
	Unique,
}
export interface IColumn {
	name: string;
	type: ColumnType;
	autoIncrement?: boolean;
	length?: number;
	nullable?: boolean;
	collation?: string;
	primary?: boolean;
	unique?: boolean;
	index?: boolean;
}
export interface IIndex {
	name?: string;
	type?: IndexType;
	column: string | string[];
}
export enum RelationType {
	OneToOne,
	OneToMany,
}

interface IRelation {
	relation: RelationType;
	column: string;
	// tslint:disable-next-line:ban-types
	model: Function;
	foreignColumn?: string;
	loader?: () => any;
}

abstract class Model extends Listenable {
	protected _where: Condition;
	protected _having: Condition;
	protected _joins: IJoin[] = [];
	protected _orders: IOrder[] = [];
	protected _groupby: string;
	protected _row: IRow = {};
	protected _isNew = true;
	protected _unsaveds: string[] = [];
	public constructor() {
		super();
		this._where = new Condition();
		this._having = new Condition();
		this.initRelations();
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
	public raw(query: string|EscapedString): Promise<this[]> {
		return new Promise((resolve, reject) => {
			const q = new Query();
			q.raw(query).then((rows) => {
				resolve(this.createModelsFromRow(rows));
			}, reject);
		});
	}
	public get(limit?: Limit): Promise<this[]> {
		return new Promise((resolve, reject) => {
			this.getQueryFromThis().get(this.table(), limit, this.table() + ".*").then((rows) => {
				resolve(this.createModelsFromRow(rows));
			}, reject);
		});
	}
	public getOne(): Promise<this> {
		return new Promise((resolve, reject) => {
			this.get(1).then((models) => {
				resolve(models.length ? models[0] : undefined);
			}, reject);
		});
	}

	public has(): Promise<boolean> {
		return this.getQueryFromThis().has(this.table());
	}
	public save(modifications?: IRow): Promise<void> {
		if (modifications) {
			for (const column in modifications) {
				if (modifications[column] !== undefined) {
					this.set(column, modifications[column]);
				}
			}
		}
		if (this._isNew) {
			return this.insert();
		} else {
			return this.update();
		}
	}
	public delete(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this._isNew) {
				this.getQueryFromThis().delete(this.table()).then(() => {
					this._isNew = true;
					resolve();
				}, reject);
			} else {
				resolve();
			}
		});
	}
	public valueOfColumn(column: string) {
		return this._row[column];
	}
	public valueOfRelation(column: string): Promise<Model|Model[]> {
		let relation: IRelation;
		for (const r of this.relations()) {
			if (r.column === column) {
				relation = r;
				break;
			}
		}
		if (relation === undefined) {
			return undefined;
		}
		if (relation.relation === RelationType.OneToOne) {
			if (this._row[relation.column] === undefined || this._row[relation.column] === null) {
				return undefined;
			}
			const model: Model = new (relation.model as any)();
			let foreignColumn: string;
			if (relation.foreignColumn) {
				foreignColumn = relation.foreignColumn;
			} else {
				const primaryKey = model.getPrimaryKey();
				if (typeof primaryKey === "string") {
					foreignColumn = primaryKey;
				} else {
					throw new Exception("foreign model primary key have multiple columns");
				}
			}
			model.where(foreignColumn, this._row[relation.column]);
			return model.getOne();
		} else if (relation.relation === RelationType.OneToMany) {
			const foreignColumn = relation.foreignColumn ? relation.foreignColumn : relation.column;
			const primaryKey = this.getPrimaryKey();
			let model: Model;
			if ((relation.model as any).isParam) {
				model = new (relation.model as any)(this.table(), foreignColumn);
			} else {
				model = new (relation.model as any)();
			}
			if (typeof primaryKey === "string") {
				model.where(foreignColumn, this._row[primaryKey]);
			} else {
				throw new Exception("primary key have multiple columns");
			}
			return model.get();
		}
	}
	public hasRelationColumn(column: string): boolean {
		for (const r of this.relations()) {
			if (r.column === column) {
				return true;
			}
		}
		return false;
	}
	public getPrimaryKey(): string|string[] {
		for (const index of this.indexes()) {
			if (index.type === IndexType.Primary) {
				return index.column;
			}
		}
	}
	public isNew() {
		return this._isNew;
	}
	public set(column: string, value: Value|Model) {
		if (value instanceof Model) {
			const primary = value.getPrimaryKey();
			if (typeof primary === "string") {
				value = value.valueOfColumn(primary);
			} else {
				throw new Exception("foreign model primary key have multiple columns");
			}
		}
		this._row[column] = value;
		if (!this.hasRelationColumn(column)) {
			this[column] = value;
		}
		if (this._unsaveds.indexOf(column) === -1) {
			this._unsaveds.push(column);
		}
		return this;
	}
	protected abstract columns(): IColumn[];
	protected abstract table(): string;
	protected indexes(): IIndex[] {
		const indexes: IIndex[] = [];
		const columns = this.columns();
		for (const column of columns) {
			if (column.primary || column.autoIncrement) {
				let oldPrimary: IIndex;
				for (const index of indexes) {
					if (index.type === IndexType.Primary) {
						oldPrimary = index;
						break;
					}
				}
				if (oldPrimary) {
					if (typeof oldPrimary.column === "string") {
						oldPrimary.column = [oldPrimary.column, column.name];
					} else {
						oldPrimary.column.push(column.name);
					}
				} else {
					indexes.push({
						name: "PRIMARY",
						type: IndexType.Primary,
						column: column.name,
					});
				}
			} else if (column.unique) {
				indexes.push({
					name: column.name,
					type: IndexType.Unique,
					column: column.name,
				});
			} else if (column.index) {
				indexes.push({
					name: column.name,
					type: IndexType.Index,
					column: column.name,
				});
			}
		}
		return indexes;
	}
	protected relations(): IRelation[] {
		return [];
	}
	protected getQueryFromThis() {
		const query = new Query();
		const primaryKey = this.getPrimaryKey();
		if (typeof primaryKey === "string") {
			if (this._row[primaryKey] !== undefined) {
				query.where(primaryKey, this._row[primaryKey]);
			}
		} else {
			for (const key of primaryKey) {
				if (this._row[key] !== undefined) {
					query.where(key, this._row[key]);
				}
			}
		}
		if (!this._where.isEmpty()) {
			query.whereAnd(this._where);
		}
		for (const join of this._joins) {
			query.join(join.table, join.condition, join.type);
		}
		for (const order of this._orders) {
			query.orderBy(order.column, order.method);
		}
		if (this._groupby) {
			query.groupBy(this._groupby);
		}
		if (this._having) {
			query.havingAnd(this._having);
		}
		return query;
	}
	protected initRelations() {
		for (const relation of this.relations()) {
			this.initRelation(relation);
		}
	}
	protected initRelation(relation: IRelation) {
		Object.defineProperty(this, relation.column, {
			get: () => {
				return relation.loader ? relation.loader :  this.valueOfRelation(relation.column);
			},
		});
	}
	protected createModelsFromRow(rows: IRow[]): this[] {
		const models: this[] = [];
		for (const row of rows) {
			const model: this = new (this.constructor as any)();
			model._isNew = false;
			for (const key in row) {
				if (row[key] !== undefined) {
					model._row[key] = row[key];
					if (!this.hasRelationColumn(key)) {
						model[key] = row[key];
					}
				}
			}
			models.push(model);
		}
		return models;
	}
	protected getUnsavedData(): IRow {
		const row: IRow = {};
		for (const unsaved of this._unsaveds) {
			row[unsaved] = this._row[unsaved];
		}
		return row;
	}
	protected saveAllUnsavedData() {
		/*for (const unsaved of this._unsaveds) {
			this._row[unsaved] = this[unsaved];
		}*/
		this._unsaveds = [];
	}
	protected insert(): Promise<void> {
		return new Promise((resolve, reject) => {
			let row = this.getUnsavedData();
			this.trigger(new PrepareDataEvent(row));
			row = this.getUnsavedData();
			if (Object.keys(row).length > 0) {
				const query = new Query();
				query.insert(this.table(), row).then((id) => {
					this._isNew = false;
					const primary = this.getPrimaryKey();
					if (typeof primary === "string") {
						this[primary] = this._row[primary] = id;
					}
					this.saveAllUnsavedData();
					resolve();
				}, reject);
			} else {
				resolve();
			}
		});
	}
	protected update(): Promise<void> {
		return new Promise((resolve, reject) => {
			let row = this.getUnsavedData();
			this.trigger(new PrepareDataEvent(row));
			row = this.getUnsavedData();
			if (Object.keys(row).length > 0) {
				this.getQueryFromThis().update(this.table(), row).then(() => {
					this.saveAllUnsavedData();
					resolve();
				}, reject);
			} else {
				resolve();
			}
		});
	}
}
export default Model;
