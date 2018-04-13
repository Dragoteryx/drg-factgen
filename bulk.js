const facts = require("./facts.js");

process.on("message", async nb => {
  process.send(await facts.genBulk(nb));
})

console.log("Bulk child ready!");
