
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
}

export default IRelation;
