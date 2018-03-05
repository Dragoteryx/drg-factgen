const facts = require("./facts.js");

process.on("message", query => {
  facts.findFact(query.split("_")).then(fact => {
    process.send(fact);
  });
})

console.log("Child process ready!");
