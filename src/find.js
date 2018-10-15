const facts = require("./facts.js");

process.on("message", query => {
  query = query.split("_");
  let i = 0;
  let found = facts.generate(query);
  while (found.missing.length > 0) {
    let fact = facts.generate(query);
    if (fact.missing.length < found.missing.length)
      found = fact;
    i++;
    if (i == 10000) break;
  }
  process.send(found);
});

console.log("Find child ready!");
