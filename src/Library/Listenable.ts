import Event, { EventCallback, IEventListener } from "./Event";

abstract class Listenable {
	protected events: IEventListener[] = [];
	public trigger(event: string | Event) {
		const eventObj = typeof event === "string" ? new Event(event) : event;
		for (const listener of this.events) {
			if (listener.type === eventObj.type) {
				listener.callback.call(this, eventObj);
			}
		}
		return eventObj;
	}
	public on(type: string, callback: EventCallback) {
		this.events.push({
			type: type,
			callback: callback,
		});
	}
}
export default Listenable;
