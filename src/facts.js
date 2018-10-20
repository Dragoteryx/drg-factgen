const database = require("./database2.json");
const proofReading = [];
for (let each of database) {
  proofReading.length = 0;
  for (let val of each.values) {
    if (proofReading.includes(val))
      console.log("[PROOFREAD] " + val + " is included more than once in §" + each.handle + "!");
    else proofReading.push(val);
  }
}

function generate(options = {}) {
  if (options.text === undefined) options.text = "§start";
  if (options.words === undefined) options.words = [];
  if (options.length === undefined) options.length = Infinity;
  let regAlias = new RegExp("§[a-z]+[(][a-z]+[)]", "gi");
  let regNormal = new RegExp("§[a-z]+", "gi");
  let picked = {text: null, steps: [], missing: options.words};
  let nb = 0;

  while (true) {
    nb++;

    let text = options.text;
    let steps = [text];
    let words = options.words.map(val => val);
    let vars = {};

    while (text.includes("§")) {
      let aliases = text.match(regAlias);
      if (aliases) {
        for (let val of aliases) {
          let parts = val.split("(");
          let varName = parts[1].replace(")", "");
          let handle = parts[0].replace("§", "");
          if (vars[varName] === undefined)
            vars[varName] = pick(database.find(each => each.handle == handle).values, words);
          while (text.includes(val)) {
            text = text.replace(val, vars[varName]);
            steps.push(text);
            words = words.reduce((acc, val) => {
              if (!text.toLowerCase().includes(val.toLowerCase()))
                acc.push(val);
              return acc;
            }, []);
          }
        }
      }
      let normals = text.match(regNormal);
      if (normals) {
        for (let val of normals) {
          let handle = val.replace("§", "");
          let each = database.find(each => each.handle == handle);
          while (text.includes(val)) {
            text = text.replace(val, pick(each.values, words));
            steps.push(text);
            words = words.reduce((acc, val) => {
              if (!text.toLowerCase().includes(val.toLowerCase()))
                acc.push(val);
              return acc;
            }, []);
          }
        }
      }
    }

    // remove excess ands
    let parts = text.split(".");
    let partsNew = [];
    for (let part of parts) {
      while (part.includes(", and ")) {
        if ((part.match(/, and /g) || []).length > 1)
          part = part.replace(", and ", ", ");
        else break;
      }
      partsNew.push(upper(part));
    }
    text = partsNew.join(".");

    // fixes
    while (text.includes(";"))
      text = text.replace(";", ".");
    while (text.includes("'s a "))
      text = text.replace("'s a ", "'s ");
    while (text.includes("'s an "))
      text = text.replace("'s an ", "'s ");
    while (text.includes("'s the "))
      text = text.replace("'s the ", "'s ");
    while (text.includes("s's"))
      text = text.replace("s's", "s'");
    while (text.includes("S's"))
      text = text.replace("S's", "S'");

    // compare
    let fact = {text: text, steps: steps, missing: words};
    if ((picked.text === null || fact.missing.length < picked.missing.length) && fact.text.length <= options.length)
      picked = fact;

    // exit
    if ((fact.missing.length == 0 && picked.text !== null) || nb == 10000) break;
  }

  if (options.words.length == 0)
    delete picked.missing;
  return picked;

}

function pick(values, words) {
  let choices = values.filter(val => {
    for (let word of words) {
      if (val.toLowerCase().includes(word.toLowerCase()))
        return true;
    }
    return false;
  });
  return randomArray(choices.length == 0 ? values : choices);
}

function upper(string) {
  try {
    return string[0].toUpperCase() + string.slice(1);
  } catch(err) {
    return string;
  }
}

function randomArray(array) {
  return array[Math.floor(Math.random()*array.length)];
}

module.exports = {
  generate: generate,
	database: database
};
