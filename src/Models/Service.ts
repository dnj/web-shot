import Model, {ColumnType, RelationType} from "../Library/Database/Model";
import Plan from "./Plan";
export enum Status {
	Deactive,
	Active,
	Suspend,
}
export default class Service extends Model {
	public readonly id: number;
	public readonly plan: Promise<Plan>;
	public readonly ip?: string;
	public readonly domain?: string;
	public readonly hits: number;
	public readonly requests: number;
	public readonly create_at: number;
	public readonly expire_at?: number;
	public readonly reset_at: number;
	public readonly status: Status;
	protected table() {
		return "services";
	}
	protected columns() {
		return [
			{name: "id", type: ColumnType.Int, autoIncrement: true, primary: true},
			{name: "plan", type: ColumnType.Int},
			{name: "ip", type: ColumnType.Varchar, length: 15, collation: "latin1_general_ci", nullable: true, unique: true},
			{name: "domain", type: ColumnType.Varchar, length: 100, collation: "latin1_general_ci", nullable: true, unique: true},
			{name: "hits", type: ColumnType.Int, unsinged: true},
			{name: "requests", type: ColumnType.Int, unsinged: true},
			{name: "create_at", type: ColumnType.Int, unsinged: true},
			{name: "expire_at", type: ColumnType.Int, nullable: true, unsinged: true},
			{name: "reset_at", type: ColumnType.Int, unsinged: true},
			{name: "status", type: ColumnType.TinyInt},
		];
	}
	protected relations() {
		return [
			{relation: RelationType.OneToOne, column: "plan", model: Plan},
		];
	}
}
