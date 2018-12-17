import Listenable from "./Listenable";

export type EventCallback = (event?: Event) => void;
export interface IEventListener {
	type: string;
	callback: EventCallback;
}
export default class Event {
	protected _type: string;
	protected _isPrevented: boolean = false;
	public constructor(type: string) {
		this._type = type;
	}
	public preventDefault() {
		this._isPrevented = false;
	}
	get type() {
		return this._type;
	}
	get isPrevented() {
		return this._isPrevented;
	}
}
