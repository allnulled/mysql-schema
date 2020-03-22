const mysql = require("mysql");
const _debug = require("debug");
const debug = _debug("mysql-schema");
const debugError = _debug("mysql-schema:error");

_debug.enable("mysql-schema");

/**
 * 
 * ### `const MySQLSchema = require("mysql-schema")`
 * 
 * Master class of the `mysql-schema` API.
 * 
 */
class MySQLSchema {

	static GET_CONNECTION(options) {
		return mysql.createConnection({
			user: options.user,
			password: options.password,
			database: options.database,
			host: options.host,
			port: options.port,
			...options.otherOptions
		});
	}

	static GET_QUERY() {
		return ``;
	}

	static DEFAULT_OPTIONS() {
		return {
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			database: process.env.DB_NAME,
			otherOptions: {},
			configurations: process.env.DB_CONFIGURATIONS || false,
			extensions: process.env.DB_EXTENSIONS || false,
			asJson: false,
			output: process.env.DB_SCHEMA || false,
		};
	}

	static DEFAULT_EXTENSIONS() {
		return {};
	}

	/**
	 * 
	 * ### `MySQLSchema.getSchema(options:Object):Promise<schema:Object>`
	 * 
	 * @asynchronous
	 * @description Generates a schema representing the MySQL database pointing.
	 * @parameter `options` - object with:
	 * 
	 *    - `user`:           `string` - user of the database. Default: process.env.DB_USER or "admin"
	 *    - `password`:       `string` - password of the database. Default: process.env.DB_PASSWORD or "admin123"
	 *    - `host`:           `string` - host of the database. Default: process.env.DB_HOST or "127.0.0.1"
	 *    - `port`:           `string` - port of the database. Default: process.env.DB_PORT or "3306"
	 *    - `database`:       `string` - name of the database. Default: process.env.DB_NAME or "test"
	 *    - `configurations`: `string` - configurations file for the database. Default: process.env.DB_CONFIGURATIONS or `false`
	 *    - `extensions`:     `string` - extensions file for the generation. Default: process.env.DB_EXTENSIONS or `false`
	 *    - `asJson`:         `boolean` - flag to output a `json` instead of a `js` file. Default: `false`
	 *    - `output`:         `string` - destination of the file with the schema. Default: process.env.DB_SCHEMA or `false`.
	 * 
	 */
	static getSchema(passedOptions = {}, passedExtensions = {}) {
		return new Promise((ok, fail) => {
			const options = Object.assign({}, this.DEFAULT_OPTIONS(), passedOptions);
			if(options.configurations) {
				Object.assign(options, require(options.configurations));
			}
			const extensions = Object.assign({}, this.DEFAULT_EXTENSIONS(), passedExtensions);
			if(options.extensions) {
				Object.assign(extensions, require(options.extensions));
			}
			const query = this.GET_QUERY();
			const connection = this.GET_CONNECTION(options);
			connection.query(query, function(error, result) {
				if(error) {
					debugError("error generating schema");
					debugError(error);
					return fail(error);
				}
				const [data, structure] = result;
				const formatted = this.format(data);
				return ok({ raw: data, formatted });
			});
		});
	}

	static format(data) {

	}

}

module.exports = MySQLSchema;