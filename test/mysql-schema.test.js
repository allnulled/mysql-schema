require("dotenv").config({ path: __dirname + "/.env.test" });
const MySQLSchema = require(__dirname + "/../src/mysql-schema.js");

describe("MySQLSchema class", function() {

	it("can generate a schema from .env file credentials", async function() {
		try {
			const data = await MySQLSchema.getSchema({ output: __dirname + "/schema.database.1.js" });
			console.log(data);
		} catch(error) {
			console.log(error);
			throw error;
		}
	});

});