const facts = require("./facts.js");

process.on("message", (options = {}) => {
  if (options.nb === undefined) options.nb = 1;
  if (options.text === undefined) options.text = "§start";
  if (options.words === undefined) options.words = [];
  if (options.length === undefined) options.length = Infinity;
  options.nb = Number(options.nb);
  if (isNaN(options.nb) || options.nb < 0) options.nb = 0;
  options.length = Number(options.length);
  if (isNaN(options.length) || options.length < 0) options.length = Infinity;
  let array = [];
  for (let i = 0; i < options.nb; i++) {
    let fact = facts.generate(options);
    array.push(fact);
  }
  process.send({facts: array});
});

console.log("Child ready! (" + process.pid + ")");
