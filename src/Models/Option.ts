import Model, {ColumnType} from "../Library/Database/Model";

export default class Option extends Model {
	public static getAutoloads() {
		return (new Option()).where("autoload", 1).get();
	}
	public static byName(name: string) {
		return (new Option()).where("name", name).getOne();
	}
	public readonly name: number;
	public readonly value: any;
	public readonly atuoload: boolean;
	public set(column: string, value: any) {
		return super.set(column, ((typeof value === "object" || typeof value === "boolean") && column === "value") ? JSON.stringify(value) : value);
	}
	public valueOfColumn(column: string) {
		if (column === "value") {
			const value = super.valueOfColumn("value") as string;
			if (value && value.length) {
				const c = value.charAt(0);
				if (c === "{" || c === "[") {
					return JSON.parse(value);
				} else if (value === "true") {
					return true;
				} else if (value === "false") {
					return false;
				}
				return value;
			}
			return null;
		}
		return super.valueOfColumn(column);
	}
	protected table() {
		return "options";
	}
	protected columns() {
		return [
			{name: "name", type: ColumnType.Varchar, collation: "latin1_general_ci", length: 100, primary: true},
			{name: "value", type: ColumnType.Text},
			{name: "autoload", type: ColumnType.Boolean},
		];
	}
}
