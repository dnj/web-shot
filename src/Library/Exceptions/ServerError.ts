import IJsonableError from "./IJsonableError";

export default class ServerError extends Error implements IJsonableError {
	public code = 500;
	public toJson(): any {
		return {
			error : "InternalError",
			message: this.message,
		};
	}
}
