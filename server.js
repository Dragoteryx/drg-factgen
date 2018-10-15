"use strict";

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cp = require("child_process");
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

app.get("/generate", async (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
  res.end(JSON.stringify(facts.generate()));
});

app.get("/generate/:includes", async (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
  let child = cp.fork("./src/find.js");
  child.on("message", found => {
    res.end(JSON.stringify(found));
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

app.get("/bulk", (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
  bulk(100, res);
});

app.get("/bulk/:nb", (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
  let nb = Number(req.params.nb);
  if (isNaN(nb) || nb < 0) nb = 0;
  bulk(nb, res);
});

app.get("/database", (req, res) => {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(facts.database));
});

app.use((req, res) => {
  res.writeHead(404, {"Content-Type": "application/json"});
  res.end(JSON.stringify({}));
});

app.listen(process.env.PORT, () => {
  console.log("Web server listening on port " + process.env.PORT + ".");
});
