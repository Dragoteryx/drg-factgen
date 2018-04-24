const redis = require("redis").createClient(process.env.REDIS_URL);
const local = require("./database.json");
let redisOK = false;
redis.on("ready", () => {
	redisOK = true;
});
redis.on("end", () => {
	redisOK = false;
});
redis.on("error", err => {
	redisOK = false;
});

// FACTS RELATED FUNCTIONS
function checkDatabase(database, string) {
	for (let data of database) {
		for (let dstring of data.strings) {
			if (dstring.toLowerCase().includes(string.toLowerCase()))
				return true;
		}
	}
	return false;
}

async function genBulk(nb = 100) {
	let database = await fetchDatabase();
	let bulk = [];
  for (let i = 0; i < nb; i++) {
    bulk.push(await genFact(database));
  }
	return bulk;
}

async function genFact(database) {
	if (database === undefined) database = await fetchDatabase();
	let texte = "$begin";
	let constName = randTab(database[2].strings);
	for (let i = 0; i < 15; i++) {
		texte = texte.replace("$cname", constName);
		for (let data of database)
			texte = texte.replace("$" + data.alias, randTab(data.strings));
	}
	return firstCharUpper(texte);
}

async function findFact(strings) {
	let database = await fetchDatabase();
	for (let string of strings) {
		if (!checkDatabase(database, string)) {
			return {text: null, tries: 0, found: false};
			return;
		}
	}
	let done = false;
	let fact;
	let i = 1;
	for (i; i < 100000 && !done; i++) {
		fact = await genFact(database);
		done = stringContainsAllArray(fact, strings);
	}
	if (done)
		return {text: fact, tries: i, found: true};
	else
		return {text: null, tries: i, found: false};
}

// OTHER FUNCTIONS
function randTab(tab) {
	return tab[Math.floor(Math.random()*tab.length)];
}
function stringContainsAllArray(string, tab) {
	for (let str of tab)
		if (!string.toLowerCase().includes(str.toLowerCase())) return false;
	return true;
}
function firstCharUpper(string) {
	return string[0].toUpperCase() + string.slice(1);
}

function provide(name, database) {
	return redis.set(name, JSON.stringify(database));
}

function fetch(name) {
	return new Promise((resolve, reject) => {
		redis.get(name, (err, data) => {
			if (err) reject(err);
			else resolve(JSON.parse(data));
		});
	});
}

function provideDatabase(database) {
	return provide("database", database);
}

function fetchDatabase() {
	return redisOK ? fetch("database") : local;
}

function provideSaved(database) {
	return provide("saved", database);
}

function fetchSaved() {
	return redisOK ? fetch("saved") : local;
}

module.exports = {
  genFact: genFact,
  findFact: findFact,
	provideDatabase: provideDatabase,
	fetchDatabase: fetchDatabase,
	provideSaved: provideSaved,
	fetchSaved: fetchSaved,
	genBulk: genBulk,
	local: local
};
