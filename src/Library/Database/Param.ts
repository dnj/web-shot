import Model, { ColumnType } from "./Model";
export default class Param extends Model {
	public static isParam = true;
	public readonly name: string;
	public readonly value: string;
	public constructor(protected tableName: string, protected nameOfkey: string) {
		super();
	}
	public columns() {
		return [
			{name: this.nameOfkey, type: ColumnType.Int, primary: true},
			{name: "name", type: ColumnType.Varchar, length: 100, primary: true, collation: "latin1_general_ci"},
			{name: "value", type: ColumnType.Text, nullable: true},
		];
	}
	public table() {
		return this.tableName + "_params";
	}
}
