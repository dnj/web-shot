import ServerError from "./ServerError";

export default class InputValidationError extends ServerError {
	public constructor(public input: string, public type = "") {
		super(`value of "${input}" is not valid`);
	}
	public toJson() {
		return {
			error: "InputValidationError",
			input: this.input,
			type: this.type,
		};
	}
}
