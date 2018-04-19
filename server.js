"use strict";

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cp = require("child_process");
const ip = require("client-ip");
const fs = require("fs");
const facts = require("./src/facts.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", async (req, res) => {
  res.writeHead(301, {Location: "/generate"});
  res.end();
});

app.get("/favicon.ico", async (req, res) => {
  fs.readFile("./favicon.ico", (err, data) => {
    res.writeHead(200, {"Content-type": "image/x-icon"});
    res.end(data);
  });
});

app.get("/generate", async (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json"});
  let now = Date.now();
  res.end(JSON.stringify({fact: await facts.genFact(), found: true, duration: (Date.now() - now), tries: 1}));
});

app.get("/generate/:includes", async (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json"});
  let now = Date.now();
  let child = cp.fork("./src/find.js");
  child.on("message", fact => {
    res.end(JSON.stringify({fact: fact.text, found: fact.found, duration: (Date.now() - now), tries: fact.tries}));
    child.kill();
  });
  child.on("close", () => {
    console.log("Find child killed");
  });
  child.send(req.params.includes);
});

function bulk(nb, res) {
  let child = cp.fork("./src/bulk.js");
  child.on("message", bulk => {
    res.end(JSON.stringify(bulk));
    child.kill();
  });
  child.on("close", () => {
    console.log("Bulk child killed");
  });
  child.send(nb);
}

app.get("/bulk", async (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json"});
  bulk(100, res);
});

app.get("/bulk/:nb", async (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json"});
  bulk(req.params.nb, res);
});

app.get("/database", async (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(await facts.fetchDatabase()));
});

app.post("/database", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    let database = await facts.fetchDatabase();
    if (req.body.alias !== undefined) {
      database.push({alias: req.body.alias, strings: []});
      facts.provideDatabase(database);
      res.writeHead(201, {"Content-Type": "application/json"});
      res.end(JSON.stringify({authorized: false, inserted: true}));
    } else {
      res.writeHead(204, {"Content-Type": "application/json"});
      res.end(JSON.stringify({authorized: false, inserted: false}));
    }
  } else {
    res.writeHead(403, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
  }
});

app.put("/database", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    res.writeHead(200, {"Content-Type": "application/json"});
    switch (req.body.operation) {
      case "save":
        console.log("Database saved.");
        let database = await facts.fetchDatabase();
        facts.provideSaved(database);
        break;
      case "load":
        console.log("Database restored.");
        let saved = await facts.fetchSaved();
        facts.provideDatabase(saved);
        break;
      case "reset":
        console.log("Database reset.");
        facts.provideDatabase(facts.local);
    }
    res.end(JSON.stringify({authorized: true}));
  } else {
    res.writeHead(403, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
  }
});

app.get("/database/:alias", async (req, res) => {
  let database = await facts.fetchDatabase();
  let cat = database.reduce((acc, cat) => cat.alias == req.params.alias ? cat : acc, null);
  if (cat === null) {
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify({}));
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(cat));
  }
});

app.delete("/database/:alias", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    let database = await facts.fetchDatabase();
    let ndatabase = database.filter(cat => cat.alias != req.params.alias);
    if (database.length != ndatabase) {
      facts.provideDatabase(ndatabase);
      res.writeHead(200, {"Content-Type": "application/json"});
      res.end(JSON.stringify({authorized: true, deleted: true}));
    } else {
      res.writeHead(404, {"Content-Type": "application/json"});
      res.end(JSON.stringify({authorized: true, deleted: false}));
    }
  } else {
    res.writeHead(403, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
  }
});

app.patch("/database/:alias", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    let database = await facts.fetchDatabase();
    for (let cat of database) {
      if (cat.alias == req.params.alias) {
        if (req.body.operation == "insert" && req.body.string !== undefined) {
          cat.strings.push(req.body.string);
          facts.provideDatabase(database);
          res.writeHead(200, {"Content-Type": "application/json"});
          res.end(JSON.stringify({authorized: true, found: true, inserted: true}));
          return;
        }
        if (req.body.operation == "remove" && req.body.string !== undefined) {
          let nstrings = cat.strings.filter(str => !str.includes(req.body.string));
          let nb = cat.strings.length - nstrings.length;
          cat.strings = nstrings;
          facts.provideDatabase(database);
          res.writeHead(200, {"Content-Type": "application/json"});
          res.end(JSON.stringify({authorized: true, found: true, removed: nb}));
          return;
        }
        if (req.body.operation == "rename" && req.body.alias !== undefined) {
          cat.alias = req.body.alias;
          facts.provideDatabase(database);
          res.writeHead(200, {"Content-Type": "application/json"});
          res.end(JSON.stringify({authorized: true, found: true, renamed: true}));
          return;
        }
        if (req.body.operation == "replace" && req.body.before !== undefined && req.body.after !== undefined) {
          let strings = JSON.stringify(cat.strings);
          let nb = 0;
          while (strings.includes(req.body.before)) {
            nb++;
            strings = strings.replace(req.body.before, req.body.after);
          }
          cat.strings = JSON.parse(strings);
          facts.provideDatabase(database);
          res.writeHead(200, {"Content-Type": "application/json"});
          res.end(JSON.stringify({authorized: true, found: true, replaced: nb}));
          return;
        }
        res.writeHead(204, {"Content-Type": "application/json"});
        res.end(JSON.stringify({authorized: true, found: true}));
        return;
      }
    }
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: true, found: false}));
  } else {
    res.writeHead(403, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
  }
});

app.use(async (req, res) => {
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify({}));
});

app.listen(process.env.PORT, () => {
  console.log("Web server listening on port " + process.env.PORT + ".");
});
