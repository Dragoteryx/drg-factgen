"use strict";

require("dotenv").config();
const http = require("http");
const url = require("url");
const cp = require("child_process");
const facts = require("./src/facts.js");

http.createServer(async (req, res) => {
  let parsed = url.parse(req.url, true);
	let query = parsed.query;
  let authorized = query.auth == process.env.AUTHTOKEN;
	let now = Date.now();
  if (parsed.path != "/favicon.ico")
    console.log(parsed.path + (authorized ? " (authorized)" : ""));
  if (parsed.pathname == "/") {
    res.writeHead(301, {Location: "/generate"});
    res.end();
  } else if (parsed.pathname == "/generate") {
    res.writeHead(200, {"Content-Type": "application/json"});
    if (query.includes === undefined)
    	res.end(JSON.stringify({fact: await facts.genFact(), found: true, duration: (Date.now() - now), tries: 1}));
  	else {
  		let child = cp.fork("./find.js");
  		child.on("message", fact => {
  			res.end(JSON.stringify({fact: fact.text, found: fact.found, duration: (Date.now() - now), tries: fact.tries}));
  			child.kill();
  		});
  		child.on("close", () => {
  			console.log("Find child killed");
  		});
  		child.send(query.includes);
  	}
  } else if (parsed.pathname == "/database") {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(await facts.fetchDatabase()));
  } else if (parsed.pathname == "/bulk") {
    console.log("/bulk");
    res.writeHead(200, {"Content-Type": "application/json"});
    if (query.nb === undefined) query.nb = 100;
    let child = cp.fork("./bulk.js");
    child.on("message", bulk => {
      res.end(JSON.stringify(bulk));
      child.kill();
    });
    child.on("close", () => {
      console.log("Bulk child killed");
    });
    child.send(query.nb);
  } else if (parsed.pathname == "/insert") {
    if (authorized && query.alias !== undefined && query.string !== undefined) {
      let database = await facts.fetchDatabase();
      while (query.string.includes("_"))
        query.string = query.string.replace("_", " ");
      database.forEach(cat => {
        if (cat.alias == query.alias) {
          cat.strings.push(query.string);
          console.log("Inserted '" + query.string + "' into '" + cat.alias + "'");
        }
      });
      facts.provideDatabase(database);
    }
    res.writeHead(302, {Location: "/database"});
    res.end();
  } else if (parsed.pathname == "/remove") {
    if (authorized && query.alias !== undefined && query.string !== undefined) {
      let database = await facts.fetchDatabase();
      while (query.string.includes("_"))
        query.string = query.string.replace("_", " ");
      database.forEach(cat => {
        if (cat.alias == query.alias) {
          cat.strings = cat.strings.filter(str => str != query.string);
          console.log("Removed '" + query.string + "' from '" + cat.alias + "'");
        }
      });
      facts.provideDatabase(database);
    }
    res.writeHead(302, {Location: "/database"});
    res.end();
  } else if (parsed.pathname == "/replace") {
    if (authorized && query.before !== undefined && query.after !== undefined) {
      let database = await facts.fetchDatabase();
      while (query.before.includes("_"))
        query.before = query.before.replace("_", " ");
      while (query.after.includes("_"))
        query.after = query.after.replace("_", " ");
      let str = JSON.stringify(database);
      while (str.includes(query.before))
        str = str.replace(query.before, query.after);
      facts.provideDatabase(JSON.parse(str));
    }
    res.writeHead(302, {Location: "/database"});
    res.end();
  } else if (parsed.pathname == "/reset") {
    if (authorized) {
      console.log("Database reset.");
      facts.provideDatabase(facts.saved);
    }
    res.writeHead(302, {Location: "/database"});
    res.end();
  } else if (parsed.pathname == "/delete") {
    if (authorized && query.alias) {
      let database = await facts.fetchDatabase();
      database = database.filter(cat => cat.alias != query.alias);
      console.log("Deleted alias '" + query.alias + "' from database.");
      facts.provideDatabase(database);
    }
    res.writeHead(302, {Location: "/database"});
    res.end();
  }
}).listen(process.env.PORT);

console.log("Web server ready!");
