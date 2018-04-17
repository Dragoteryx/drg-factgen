"use strict";

require("dotenv").config();
const express = require("express");
const url = require("url");
const cp = require("child_process");
const facts = require("./src/facts.js");

const app = express();

app.get("/", async (req, res) => {
  res.status(301).setHeader("Location", "/generate");
  res.end();
});

app.get("/generate", async (req, res) => {
  let now = Date.now();
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({fact: await facts.genFact(), found: true, duration: (Date.now() - now), tries: 1}));
});

app.get("/generate/:includes", async (req, res) => {
  let now = Date.now();
  res.setHeader("Content-Type", "application/json");
  let child = cp.fork("./src/find.js");
  child.on("message", fact => {
    res.send(JSON.stringify({fact: fact.text, found: fact.found, duration: (Date.now() - now), tries: fact.tries}));
    child.kill();
  });
  child.on("close", () => {
    console.log("Find child killed");
  });
  child.send(req.params.includes);
});

app.get("/database", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(await facts.fetchDatabase()));
});

function bulk(nb, res) {
  let child = cp.fork("./src/bulk.js");
  child.on("message", bulk => {
    res.send(JSON.stringify(bulk));
    child.kill();
  });
  child.on("close", () => {
    console.log("Bulk child killed");
  });
  child.send(nb);
}

app.get("/bulk", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  bulk(100, res);
});

app.get("/bulk/:nb", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  bulk(req.params.nb, res);
});

app.get("/insert/:alias/:string", async (req, res) => {
  res.writeHead(302, {Location: "/database"});
  let database = await facts.fetchDatabase();
  let query = {
    alias: req.params.alias,
    string: req.params.string
  };
  while (query.string.includes("_"))
    query.string = query.string.replace("_", " ");
  if (!database.some(cat => cat.alias == query.alias))
    database.push({alias: query.alias, strings: []});
  database.forEach(cat => {
    if (cat.alias == query.alias) {
      cat.strings.push(query.string);
      console.log("Inserted '" + query.string + "' into '" + cat.alias + "'");
    }
  });
  facts.provideDatabase(database);
  res.end();
});

app.get("/remove/:alias/:string", async (req, res) => {
  res.writeHead(302, {Location: "/database"});
  let database = await facts.fetchDatabase();
  let query = {
    alias: req.params.alias,
    string: req.params.string
  };
  while (query.string.includes("_"))
    query.string = query.string.replace("_", " ");
  database.forEach(cat => {
    if (cat.alias == query.alias) {
      cat.strings = cat.strings.filter(str => str != query.string);
      console.log("Removed '" + query.string + "' from '" + cat.alias + "'");
    }
  });
  facts.provideDatabase(database);
  res.end();
});

app.get("/replace/:before/:after", async (req, res) => {
  res.writeHead(302, {Location: "/database"});
  let database = await facts.fetchDatabase();
  let query = {
    before: req.params.before,
    after: req.params.after
  };
  while (query.before.includes("_"))
    query.before = query.before.replace("_", " ");
  while (query.after.includes("_"))
    query.after = query.after.replace("_", " ");
  let str = JSON.stringify(database);
  while (str.includes(query.before))
    str = str.replace(query.before, query.after);
  facts.provideDatabase(JSON.parse(str));
  res.end();
});

app.get("/reset", async (req, res) => {
  res.writeHead(302, {Location: "/database"});
  console.log("Database reset.");
  facts.provideDatabase(facts.saved);
  res.end();
});

app.get("/delete/:cat", async (req, res) => {
  res.writeHead(302, {Location: "/database"});
  let database = await facts.fetchDatabase();
  database = database.filter(cat => cat.alias != req.params.cat);
  console.log("Deleted category '" + req.params.cat + "' from database.");
  facts.provideDatabase(database);
  res.end();
});

app.use(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).send(JSON.stringify({}));
});

app.listen(process.env.PORT);

console.log("Web server ready!");
