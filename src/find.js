const facts = require("./facts.js");

process.on("message", query => {
  query = query.split("_");
  let found = {text: null, steps: [], missing: query};
  let i = 0;
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
