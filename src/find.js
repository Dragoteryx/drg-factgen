const facts = require("./facts.js");

process.on("message", async query => {
  console.log(query)
  let fact = await facts.findFact(query.split("_"));
  process.send(fact);
})

console.log("Find child ready!");
