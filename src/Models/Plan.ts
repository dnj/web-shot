import Model, {ColumnType, RelationType} from "../Library/Database/Model";
import Service from "./Service";

export default class Plan extends Model {
	public readonly id: number;
	public readonly title: string;
	public readonly hits?: number;
	public readonly requests?: number;
	protected table() {
		return "plans";
	}
	protected columns() {
		return [
			{name: "id", type: ColumnType.Int, autoIncrement: true, primary: true},
			{name: "title", type: ColumnType.Varchar, length: 255},
			{name: "hits", type: ColumnType.Int, unsigned: true, nullable: true},
			{name: "requests", type: ColumnType.Int, unsigned: true, nullable: true},
		];
	}
	protected relations() {
		return [
			{relation: RelationType.OneToMany, column: "services", model: Service, foreignColumn: "plan"},
		];
	}
}
