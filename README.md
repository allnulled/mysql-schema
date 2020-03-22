# mysql-schema

Generate a JSON representing the schema of your MySQL database.

## Install

`$ npm i -g mysql-schema`

## Why?

To generate schema definitions of MySQL databases automatically.

To abstract your code and repeat things the least possible.

Note that if your code depends on the structure of the data (and not on the data itself), then you are coding for any database.

## Usage

This tool enables you to generate a `json` file representing your `mysql` database.

### CLI usage

This is a short explanation of how the CLI works.

```bash
$ mysql-schema
	[--user]           root                           # database user                 = process.env.DB_USER           || 'root'
	[--password]       root123                        # database user password        = process.env.DB_PASSWORD       || 'root123'
	[--host]           127.0.0.1                      # database host                 = process.env.DB_HOST           || '127.0.0.1'
	[--port]           3306                           # database port                 = process.env.DB_PORT           || '3306'
	[--database]       test                           # database name                 = process.env.DB_NAME           || 'test'
	[--configurations] mysql-schema.configurations.js # database configurations file  = process.env.DB_CONFIGURATIONS || ./mysql-schema.configurations.js
	[--extensions]     mysql-schema.extensions.js     # database schema extensions    = process.env.DB_EXTENSIONS     || ./mysql-schema.extensions.js
	[--as-json]                                       # to generate a json & not a js = false
	--output           schema.test.js(on)             # output file                   = "schema.${database}.js"
```

### API usage

This is a short explanation of how the API works.

```js
require("mysql-schema").getSchema({
	user:            process.env.DB_USER           || 'root',
	password:        process.env.DB_PASSWORD       || 'root123',
	host:            process.env.DB_HOST           || '127.0.0.1',
	port:            process.env.DB_PORT           || '3306',
	database:        process.env.DB_NAME           || 'test',
	configurations:  process.env.DB_CONFIGURATIONS || "./mysql-schema.configurations.js",
	extensions:      process.env.DB_EXTENSIONS     || "./mysql-schema.extensions.js",
	asJson:          false,
	output:          `./schema.${database}.js`
})
```




### `const MySQLSchema = require("mysql-schema")`

Master class of the `mysql-schema` API.




### `MySQLSchema.getSchema(options:Object):Promise<schema:Object>`



**Asynchronous**.


**Description**:  Generates a schema representing the MySQL database pointing.


**Parameter**:  `options` - object with:

   - `user`:           `string` - user of the database. Default: process.env.DB_USER or "admin"
   - `password`:       `string` - password of the database. Default: process.env.DB_PASSWORD or "admin123"
   - `host`:           `string` - host of the database. Default: process.env.DB_HOST or "127.0.0.1"
   - `port`:           `string` - port of the database. Default: process.env.DB_PORT or "3306"
   - `database`:       `string` - name of the database. Default: process.env.DB_NAME or "test"
   - `configurations`: `string` - configurations file for the database. Default: process.env.DB_CONFIGURATIONS or "./.mysql-schema.configurations.js"
   - `extensions`:     `string` - extensions file for the generation. Default: process.env.DB_EXTENSIONS or "./.mysql-schema.extensions.js"
   - `asJson`:         `boolean` - flag to output a `json` instead of a `js` file. Default: false
   - `output`:         `string` - 






## Issues

Please, report issues and suggestions [here](https://github.com/allnulled/mysql-schema/issues).

## License

This project is licensed under [WTFPL or What The Fuck Public License](http://www.wtfpl.net/), which means 'do what you want with it'.
