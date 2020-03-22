const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
const { stringify: JsStringify } = require("javascript-stringify");
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

	static getConnection(options) {
		return mysql.createConnection({
			user: options.user,
			password: options.password,
			database: options.database,
			host: options.host,
			port: options.port,
			...options.otherOptions
		});
	}

	static GET_QUERY_FOR_CONSTRAINTS(options) {
		return `
			SELECT 
				TABLE_CONSTRAINTS.TABLE_NAME AS '$table',
				KEY_COLUMN_USAGE.COLUMN_NAME AS '$column',
				TABLE_CONSTRAINTS.CONSTRAINT_TYPE AS '$constraintType',
			    TABLE_CONSTRAINTS.CONSTRAINT_NAME AS '$constraintName',
				KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME AS '$referencedTable',
			    KEY_COLUMN_USAGE.REFERENCED_COLUMN_NAME AS '$referencedColumn',
			    KEY_COLUMN_USAGE.ORDINAL_POSITION AS '$ordinalPosition',
		    	KEY_COLUMN_USAGE.POSITION_IN_UNIQUE_CONSTRAINT AS '$positionInUniqueConstraint'
			FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
			LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE
		    	ON KEY_COLUMN_USAGE.TABLE_SCHEMA = TABLE_CONSTRAINTS.TABLE_SCHEMA
					AND KEY_COLUMN_USAGE.TABLE_NAME = TABLE_CONSTRAINTS.TABLE_NAME
					AND KEY_COLUMN_USAGE.CONSTRAINT_NAME = TABLE_CONSTRAINTS.CONSTRAINT_NAME
			WHERE TABLE_CONSTRAINTS.TABLE_SCHEMA = '${options.database}'
				AND TABLE_CONSTRAINTS.CONSTRAINT_TYPE != 'PRIMARY KEY';`;
	}

	static GET_QUERY(options) {
		return `
			SELECT DISTINCT
			    TABLES.TABLE_SCHEMA AS '$database',
			    TABLES.TABLE_NAME AS '$table',
			    # TABLES.TABLE_TYPE AS '$tableType',
			    COLUMNS.COLUMN_NAME AS '$column',
			    COLUMNS.COLUMN_TYPE AS '$columnType',
			    COLUMNS.IS_NULLABLE AS '$isColumnNullable',
			    COLUMNS.COLUMN_DEFAULT AS '$defaultColumnValue',
			    COLUMNS.EXTRA AS '$extraColumnInformation',
			    COLUMNS.ORDINAL_POSITION AS '$ordinalColumnPosition',
			    COLUMNS.CHARACTER_MAXIMUM_LENGTH AS '$maximumCharactersLength',
			    IF(LOCATE(' unsigned', COLUMNS.COLUMN_TYPE) > 0,1,0) AS '$isUnsigned',
			    COLUMNS.EXTRA LIKE '%auto_increment%' AS '$isAutoIncrement',
			    KEY_COLUMN_USAGE.CONSTRAINT_NAME AS '$boundConstraint',
			    KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME AS '$referencedTable',
			    KEY_COLUMN_USAGE.REFERENCED_COLUMN_NAME AS '$referencedColumn'
			FROM INFORMATION_SCHEMA.TABLES
			LEFT JOIN INFORMATION_SCHEMA.COLUMNS ON 
			    COLUMNS.TABLE_SCHEMA = TABLES.TABLE_SCHEMA AND
			    COLUMNS.TABLE_NAME = TABLES.TABLE_NAME
			LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ON
			    KEY_COLUMN_USAGE.TABLE_SCHEMA = TABLES.TABLE_SCHEMA AND 
			    KEY_COLUMN_USAGE.TABLE_NAME = TABLES.TABLE_NAME AND
			    KEY_COLUMN_USAGE.COLUMN_NAME = COLUMNS.COLUMN_NAME
			WHERE
			    TABLES.TABLE_SCHEMA = '${options.database}' AND
			    TABLES.TABLE_TYPE = 'BASE TABLE'
			ORDER BY TABLES.TABLE_SCHEMA ASC, TABLES.TABLE_NAME ASC, COLUMNS.COLUMN_NAME ASC;`;
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
			envFile: false,
			output: process.env.DB_SCHEMA || false,
		};
	}

	static DEFAULT_EXTENSIONS() {
		return {
			perColumn: {
				auth_user: {
					id: {
						description: "First injected extension"
					}
				}
			}
		};
	}

	/**
	 * 
	 * ### `MySQLSchema.getSchema(options:Object):Promise<schema:Object>`
	 * 
	 * @asynchronous
	 * @description Generates a schema representing the MySQL database pointing.
	 * @parameter `options` - object with properties (all of them optional):
	 * 
	 *    - `user`:           `string` - user of the database.
	 *        - **default:** `process.env.DB_USER` or `"root"`
	 *    - `password`:       `string` - password of the database.
	 *        - **default:** `process.env.DB_PASSWORD` or `""`
	 *    - `host`:           `string` - host of the database.
	 *        - **default:** `process.env.DB_HOST` or `"127.0.0.1"`
	 *    - `port`:           `string` - port of the database.
	 *        - **default:** `process.env.DB_PORT` or `3306`
	 *    - `database`:       `string` - name of the database.
	 *        - **default:** `process.env.DB_NAME` or `"test"`
	 *    - `configurations`: `string` - configurations file for the database.
	 *        - **default:** `process.env.DB_CONFIGURATIONS` or `false`
	 *    - `extensions`:     `string` - extensions file for the generation.
	 *        - **default:** `process.env.DB_EXTENSIONS` or `false`
	 *    - `asJson`:         `boolean` - flag to output a `json` instead of a `js` file.
	 *        - **default:** `false`
	 *    - `output`:         `string` - destination of the file with the schema.
	 *        - **default:** `process.env.DB_SCHEMA` or `false`.
	 * 
	 */
	static getSchema(passedOptions = {}, passedExtensions = {}) {
		let __options, __extensions, __connection;
		return new Promise((ok, fail) => {
			__options = Object.assign({}, this.DEFAULT_OPTIONS(), passedOptions);
			if (__options.configurations) {
				Object.assign(__options, require(__options.configurations));
			}
			__extensions = Object.assign({}, this.DEFAULT_EXTENSIONS(), passedExtensions);
			if (__options.__extensions) {
				Object.assign(__extensions, require(__options.__extensions));
			}
			if (__options.envFile) {
				require("dotenv").config({
					path: __options.envFile
				});
			}
			if(__options.debug) {
				debug("Opening connection...");
			}
			const query = this.GET_QUERY(__options);
			const queryForConstraints = this.GET_QUERY_FOR_CONSTRAINTS(__options);
			__connection = this.getConnection(__options);
			let index = 0;
			const schema = {};
			if(__options.debug) {
				debug("Querying constraints...");
				debug(queryForConstraints);
			}
			__connection.query(queryForConstraints, (error, data) => {
				if (error) {
					debugError("error generating schema constraints");
					debugError(error);
					return fail(error);
				}
				schema.constraints = data;
				index++;
				if (index === 2) ok(schema);
			});
			if(__options.debug) {
				debug("Querying columns...");
				debug(query);
			}
			__connection.query(query, (error, data) => {
				if (error) {
					debugError("error generating schema");
					debugError(error);
					return fail(error);
				}
				schema.columns = data;
				index++;
				if (index === 2) ok(schema);
			});
		}).then(schema => {
			if(__options.debug) {
				debug("Closing connection...");
			}
			__connection.end();
			return schema;
		}).then(schema => {
			if(__options.debug) {
				debug("Formatting result...");
			}
			return this.format(schema, __options, __extensions);
		}).then(schema => {
			return new Promise((ok, fail) => {
				if (__options.output) {
					if (__options.asJson) {
						if(__options.debug) {
							debug("Creating schema.*.json file...");
						}
						fs.writeFile(__options.output, this.formatJsonOutput(schema), "utf8", (error) => {
							if (error) return fail(error);
							return ok(schema);
						});
					} else {
						if(__options.debug) {
							debug("Creating schema.*.js file...");
						}
						fs.writeFile(__options.output, this.formatJsOutput(schema), "utf8", (error) => {
							if (error) return fail(error);
							return ok(schema);
						});
					}
				} else {
					return ok(schema);
				}
			}).then(schema => {
				if(__options.debug) {
					debug("Created file at: ");
					debug(path.resolve(__options.output));
				}
				return schema;
			}).catch(error => {
				throw error
			});
		});
	}

	static format(...args) {
		return require(__dirname + "/schema-formatter.js")(...args);
	}

	static formatJsonOutput(schema) {
		return JSON.stringify(schema, null, 2);
	}

	static formatJsOutput(schema) {
		return `module.exports = ${this.stringifyFn(schema, 2)};`;
	}

	static stringifyFn(obj, tab = 4) {
		return JsStringify(obj, function(value, indent, stringify) {
			if(typeof value === "function") {
				return value.toString();
			}
			if (value instanceof RegExp) {
				return `/${value.source}/${value.flags}`;
			}
			if(value instanceof Date) {
				return `new Date(${JSON.stringify(value.toString())})`;
			}
			return stringify(value, null, tab);
		}, tab);
	}

}

module.exports = MySQLSchema;