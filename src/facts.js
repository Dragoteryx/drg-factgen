const database = require("./database.json");

function generate(keywds = []) {
  let res = {text: null, steps: []};
  let showMissing = keywds.length > 0;
  keywds.sort(() => 0.5 > Math.random());
  let text = "§start";
  res.steps.push(text);
  while (text.includes("§")) {
    for (let each of database) {
      if (text.includes("§" + each.alias)) {
        text = text.replace("§" + each.alias, pick(each.strings, keywds));
        keywds = keywds.reduce((acc, val) => {
          if (!text.toLowerCase().includes(val.toLowerCase()))
            acc.push(val);
          return acc;
        }, []);
        res.steps.push(text);
      }
    }
  }
  res.text = upper(text);
  if (showMissing)
    res.missing = keywds;
  return res;
}

function pick(array, keywds) {
  for (let keywd of keywds) {
    for (let str of array) {
      if (str.toLowerCase().includes(keywd.toLowerCase()))
        return str;
    }
  }
  return array[Math.floor(Math.random()*array.length)];
}

function upper(string) {
	return string[0].toUpperCase() + string.slice(1);
}

module.exports = {
  generate: generate,
	database: database
};
