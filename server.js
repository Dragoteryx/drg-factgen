"use strict";

require("dotenv").config();
const express = require("express");
const cp = require("child_process");
const fs = require("fs");
const facts = require("./src/facts.js");
let nbChilds = 0;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.writeHead(301, {Location: "/generate"});
  res.end();
});

app.get("/favicon.ico", async (req, res) => {
  fs.readFile("./favicon.ico", (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(404, {"Content-type": "image/x-icon"});
      res.end();
    } else {
      res.writeHead(200, {"Content-type": "image/x-icon"});
      res.end(data);
    }
  });
});

function generate(res, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      let child = cp.fork("./src/generate.js");
      nbChilds++;
      child.on("message", found => {
        resolve(found);
        child.kill();
      });
      child.on("close", () => {
        console.log("Child killed. (" + child.pid + ")\n");
        nbChilds--;
      });
      child.on("error", reject);
      child.send(options);
    } catch(err) {
      reject(err);
    }
  });
}

app.get("/generate", async (req, res) => {
  try {
    console.log("\nCreate basic Generate child.");
    let options = {
      nb: req.query.nb,
      words: req.query.words ? req.query.words.split("_") : [],
      length: req.query.length
    };
    console.log(options);
    let facts = await generate(res, options);
    res.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
    res.end(JSON.stringify(facts));
  } catch(err) {
    console.error(err);
    res.writeHead(500, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
    res.end("{}");
  }
});

app.get("/database", (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(facts.database));
});

app.use((req, res) => {
  res.writeHead(404, {"Content-Type": "application/json"});
  res.end("{}");
});

app.listen(process.env.PORT, () => {
  console.log("Web server listening on port " + process.env.PORT + ".");
});
