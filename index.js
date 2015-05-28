var redis = require("redis");
var async = require("async");
var argv = require("minimist")(process.argv.slice(2));

var host = argv.h || argv.host;
var port = argv.p || argv.port;
var db = argv.d || argv.db || 0;
var key = argv.k || argv.key;

if (!host || !port || !key) {
	console.log("Usage: node index");
	console.log("\t -d <number> or --db <number>");
	console.log("\t -h <string> or --host <string>");
	console.log("\t -p <number> or --port <number>");
	console.log("\t -k <string> or --key <string>");
	console.log("host, port, and key arguments are required");
	process.exit(0);
}

var client = redis.createClient(port, host);

var tasks = {
	"select": client.select.bind(client, db),
	"keys": [ "select", getKeys ],
	"delKeys": [ "keys", delAll ]
};

async.auto(tasks, postprocess);

function getKeys (cb) { client.keys(key, cb); }

function delAll (cb, result) { client.del(result.keys, cb); }

function postprocess (error, result) {
	if (error) {
		console.log("Error: %j", error);
		process.exit(-1);
	}

	console.log("Deleted %d keys", result.keys.length);
	process.exit(0);
}
