export default class Exception extends Error {
	public constructor(message: string) {
		super(message);
	}
	public getMessage(): string {
		return this.message;
	}
}
