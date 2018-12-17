import * as mysql from "mysql";
import IRow from "./IRow";
import Value from "./Value";

export interface IOptions {
	connectionLimit?: number;
	host: string;
	port?: number;
	username: string;
	password: string;
	database?: string;
	charset?: string;
}
export default class DatabaseManager {
	protected pool: mysql.Pool;
	protected options: IOptions;
	public constructor(options: IOptions) {
		if (options.connectionLimit === undefined) {
			options.connectionLimit = 10;
		}
		if (options.port === undefined) {
			options.port = 3306;
		}
		this.options = options;
		this.pool = mysql.createPool({
			connectionLimit: this.options.connectionLimit,
			host: this.options.host,
			user: this.options.username,
			password: this.options.password,
			database: this.options.database,
			charset: this.options.charset,
		});
	}
	public close(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.pool.end((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
	public getConnection(): Promise<mysql.PoolConnection> {
		return new Promise((resolve, reject) => {
			this.pool.getConnection((err, connection) => {
				if (err) {
					reject(err);
				} else {
					resolve(connection);
				}
			});
		});
	}
	public query(query: string, values?: Value[]): Promise<IRow[]> {
		return new Promise((resolve, reject) => {
			this.pool.query(query, values, (err, results, feilds) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			});
		});
	}
}
