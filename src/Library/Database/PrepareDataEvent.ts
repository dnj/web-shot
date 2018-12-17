import Event from "../Event";
import IRow from "./IRow";
export default class PrepareDataEvent extends Event {
	public constructor(public readonly originalData: IRow) {
		super("prepareData");
	}
}
