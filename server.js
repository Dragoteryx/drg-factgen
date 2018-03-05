"use strict";

require("dotenv").config();
const http = require("http");
const url = require("url");
const cp = require("child_process");
const facts = require("./facts.js");

http.createServer((req, res) => {
  res.writeHead(200, {"Content-Type": "application/json"});
	let q = url.parse(req.url, true).query;
	let now = Date.now();
	if (q.query === undefined)
  	res.end(JSON.stringify({fact: facts.genFact(), found: true, duration: (Date.now() - now), tries: 1}));
	else {
		let child = cp.fork("./child.js");
		child.on("message", fact => {
			res.end(JSON.stringify({fact: fact.text, found: fact.found, duration: (Date.now() - now), tries: fact.tries}));
			child.kill();
		});
		child.on("close", () => {
			console.log("Child killed");
		});
		child.send(q.query);
	}
}).listen(process.env.PORT);

console.log("Web server ready!");
