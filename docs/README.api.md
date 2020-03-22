
### `const MySQLSchema = require("mysql-schema")`

Master class of the `mysql-schema` API.




### `MySQLSchema.getSchema(options:Object):Promise<schema:Object>`



**Asynchronous**.


**Description**:  Generates a schema representing the MySQL database pointing.


**Parameter**:  `options` - object with:

   - `user`:           `string` - user of the database.
       - **default:** `process.env.DB_USER` or `"root"`
   - `password`:       `string` - password of the database.
       - **default:** `process.env.DB_PASSWORD` or `""`
   - `host`:           `string` - host of the database.
       - **default:** `process.env.DB_HOST` or `"127.0.0.1"`
   - `port`:           `string` - port of the database.
       - **default:** `process.env.DB_PORT` or `3306`
   - `database`:       `string` - name of the database.
       - **default:** `process.env.DB_NAME` or `"test"`
   - `configurations`: `string` - configurations file for the database.
       - **default:** `process.env.DB_CONFIGURATIONS` or `false`
   - `extensions`:     `string` - extensions file for the generation.
       - **default:** `process.env.DB_EXTENSIONS` or `false`
   - `asJson`:         `boolean` - flag to output a `json` instead of a `js` file.
       - **default:** `false`
   - `output`:         `string` - destination of the file with the schema.
       - **default:** `process.env.DB_SCHEMA` or `false`.



