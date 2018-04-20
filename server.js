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

app.get("/database/:alias", async (req, res) => {
  let database = await facts.fetchDatabase();
  let cat = database.reduce((acc, cat) => cat.alias == req.params.alias ? cat : acc, null);
  if (cat === null) {
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify({}));
  } else {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(cat.strings));
  }
});

app.put("/database/:alias", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    let database = await facts.fetchDatabase();
    if (!Array.isArray(req.body.strings))
      req.body.strings = [];
    let cat = database.reduce((acc, cat) => cat.alias == req.params.alias ? cat : acc, null);
    if (cat === null) {
      database.push({alias: req.params.alias, strings: req.body.strings});
      res.writeHead(201, {"Content-Type": "application/json"});
      res.end(JSON.stringify({authorized: true}));
    } else {
      cat.strings = req.body.strings;
      res.writeHead(200, {"Content-Type": "application/json"});
      res.end(JSON.stringify({authorized: true}));
    }
    facts.provideDatabase(database);
  } else {
    res.writeHead(401, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
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
    res.writeHead(401, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
  }
});

app.patch("/database/:alias", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    let database = await facts.fetchDatabase();
    for (let cat of database) {
      if (cat.alias == req.params.alias) {
        let response = {authorized: true, found: true};
        if (req.body.rename !== undefined && typeof req.body.rename == "string") {
          cat.alias = req.body.rename;
          facts.provideDatabase(database);
          response.renamed = true;
        }
        if (req.body.insert !== undefined && typeof req.body.insert == "string") {
          cat.strings.push(req.body.insert);
          facts.provideDatabase(database);
          response.inserted = true;
        }
        if (req.body.remove !== undefined && typeof req.body.remove == "string") {
          let nstrings = cat.strings.filter(str => !str.includes(req.body.remove));
          let nb = cat.strings.length - nstrings.length;
          cat.strings = nstrings;
          facts.provideDatabase(database);
          response.removed = nb;
        }
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(response));
        return;
      }
    }
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: true, found: false}));
  } else {
    res.writeHead(401, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
  }
});

app.put("/save", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    let database = await facts.fetchDatabase();
    facts.provideSaved(database);
    console.log("Database saved.");
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: true}));
  } else {
    res.writeHead(401, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
  }
});

app.put("/load", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    let database = await facts.fetchDatabase();
    let saved = await facts.fetchSaved();
    facts.provideDatabase(saved);
    console.log("Database restored.");
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: true}));
  } else {
    res.writeHead(401, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: false}));
  }
});

app.put("/reset", async (req, res) => {
  if (req.get("Authorization") == process.env.AUTHTOKEN) {
    facts.provideDatabase(facts.local);
    console.log("Database reset.");
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({authorized: true}));
  } else {
    res.writeHead(401, {"Content-Type": "application/json"});
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
