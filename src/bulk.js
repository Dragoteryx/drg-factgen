const facts = require("./facts.js");

process.on("message", nb => {
  let array = [];
  for (let i = 0; i < nb; i++)
    array.push(facts.generate().text);
  process.send(array);
});

console.log("Bulk child ready!");
