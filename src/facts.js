const redis = require("redis").createClient(process.env.REDIS_URL);

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
	let texte = "$_begin";
	let constName = randTab(database[2].strings);
	for (let i = 0; i < 15; i++) {
		texte = texte.replace("$_cname", constName);
		for (let data of database)
			texte = texte.replace("$_" + data.alias, randTab(data.strings));
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

function provideDatabase(database) {
	return redis.set("database", JSON.stringify(database));
}

function fetchDatabase() {
	return new Promise((resolve, reject) => {
		redis.get("database", (err, data) => {
			if (err) reject(err);
			else resolve(JSON.parse(data));
		});
	})
}

// DATABASE
let saved = [
	{
		alias: "begin",
		strings: [
			"my Senpai told me that $_end.",
			"did you know that $_end?",
			"thanks to science, we now know that $_end.",
			"I wanted to tell you that $_end.",
			"you might not believe me, but $_end.",
			"I'm almost certain that $_end.",
			"I think $_end.",
			"listen: $_end.",
			"you are not forced to agree with me, but $_end.",
			"I'm pleased to tell you that $_end.",
			"I'm sorry to inform you that $_end.",
			"to be honest, I think $_end.",
			"according to Fox News, $_end.",
			"according to the police, $_end.",
			"some rumors say that $_end.",
			"an ancient prophecy tells that $_end.",
			"$_name, our lord and savior, told me that $_end.",
			"meanwhile, in a parallel universe, $_end.",
			"it is written that only $_end.",
			"just a daily reminder that $_end.",
			"I'm coming from the future to tell you that $_end.",
			"how come $_end?",
			"this is absolute truth: $_end.",
			"you can't deny that $_end.",
			"you can't disagree with me when I say that $_end.",
			"this is truth: $_end.",
			"somehow, $_end.",
			"some rumors at $_faction say that $_end.",
			"according to $_name, $_end.",
			"I bet you $_item that $_end.",
			"you thought it was $_name, but it was me, Dio!",
			"look up in the sky! It's a bird! It's a plane! It's $_name!",
			"I was told by $_name that $_end.",
			"it would be so cool if $_event didn't happen.",
			"I'm wondering how the world would be if $_event did not happen.",
			"$_end. Crazy, right?",
			"tell me that $_end, or I'll murder you.",
			"for some reason, $_end.",
			"it would be fun if $_end.",
			"would you rather $_action or $_action?",
			"$_name told me that $_end."
		]
	},
	{
		alias: "end",
		strings: [
			"$_name's favorite drink is $_drink",
			"$_name's favorite food is $_food",
			"$_cname is love, $_cname is life",
			"$_name works for $_faction",
			"$_faction headquarters are located $_loc",
			"$_name is $_name",
			"$_name is $_adj",
			"$_name is $_adj and $_adj",
			"$_name doesn't need to poop",
			"$_name is better than you",
			"$_name doesn't like you",
			"$_name hates you",
			"$_name loves you",
			"$_name would like to $_action",
			"$_faction would like to $_action",
			"$_name has no soul",
			"$_name needs healing",
			"$_name needs $_item",
			"$_name lives $_loc",
			"$_name and $_name live $_loc",
			"$_name is searching for $_item",
			"$_name's treasure is hidden $_loc",
			"$_name doesn't exist",
			"$_name wants to $_action",
			"$_name looks better than you",
			"$_name is your master",
			"$_name is not as dumb as $_name",
			"$_name is not as smart as $_name",
			"$_name is cooler than $_name",
			"$_name is faster than $_name",
			"$_name is better than $_name",
			"$_name killed $_name",
			"$_name ate $_name",
			"$_name ate $_food",
			"$_name ate $_item",
			"$_name kicked $_name",
			"$_name hates $_name",
			"$_name likes $_name",
			"$_name loves $_name",
			"$_name hates $_food",
			"$_name likes $_food",
			"$_name loves $_food",
			"$_name hates $_drink",
			"$_name likes $_drink",
			"$_name loves $_drink",
			"$_name is scared of $_name",
			"$_name hates $_group",
			"$_name likes $_group",
			"$_name loves $_group",
			"$_name is scared of $_group",
			"$_name slept with $_name",
			"$_name should be contained by the SCP Foundation",
			"$_name died for his country",
			"$_name has found $_item",
			"$_name has $_item",
			"$_name doesn't have $_item",
			"$_name gave $_item to $_name",
			"$_name gave $_item to $_name to $_action",
			"$_name is married with $_name",
			"$_name has stolen $_item",
			"$_item was created by $_name",
			"$_name and $_name allied themselves to $_action",
			"$_faction and $_faction allied themselves to $_action",
			"$_name and $_faction allied themselves to $_action",
			"$_name came into possession of $_item",
			"to $_action, you need to $_action first",
			"$_name can help you to $_action",
			"to $_action, you will need the help of $_name",
			"$_nb + $_nb = $_nb",
			"the easiest way to $_action is to $_action",
			"$_item is powered using $_item",
			"$_name caused $_event",
			"$_faction caused $_event",
			"there's a museum about $_name $_loc",
			"there's a museum about $_faction $_loc",
			"there's a museum about $_group $_loc",
			"there's a museum about $_food $_loc",
			"there's a museum about $_drink $_loc",
			"$_event happened $_loc",
			"$_name created $_item to $_action",
			"$_movie is $_name's favorite movie",
			"$_movie will predict the future",
			"$_movie is the best movie ever",
			"$_movie is the worst movie ever",
			"$_movie is my favorite movie",
			"$_end, and $_end",
			"$_name wants to $_action",
			"$_action once a day to $_action",
			"$_action twice a day to $_action",
			"$_action three times a day to $_action",
			"when $_cname is bored, $_cname likes to $_action",
			"$_name often tries to $_action"
		]
	},
	{
		alias: "name",
		strings: [
			"Dragoteryx",
			"Senpai",
			"Senpai's sister",
			"Donald Trump",
			"Shrek",
			"Gollum",
			"Obi-Wan Kenobi",
			"Dracula",
			"Darth Vader",
			"the Doctor",
			"Tracer",
			"Reaper",
			"Torbjörn",
			"Winston",
			"D.Va",
			"Bastion",
			"my penis",
			"the Internet",
			"Mecha Hitler",
			"Putin",
			"the Cookie Monster",
			"the Dovahkiin",
			"Alduin",
			"GLaDOS",
			"Chell",
			"Nicolas Cage",
			"Chuck Norris",
			"the Twitter bird",
			"Aristotle",
			"McCree",
			"Flowey",
			"Sans",
			"PAPYRUS",
			"Harry Potter",
			"Voldemort",
			"Genji",
			"Link",
			"Ganondorf",
			"a Warframe",
			"Stalin",
			"Lenin",
			"SpongeBob SquarePants",
			"John Cena",
			"Dio",
			"Sakamoto-senpai",
			"a ghoul",
			"a werewolf",
			"a horse",
			"a bird",
			"a shark",
			"a nazi",
			"a facter",
			"a bitch",
			"a bot",
			"a vampire",
			"a brony",
			"your father",
			"your mother",
			"your brother",
			"your sister",
			"SCP-173",
			"SCP-682",
			"SCP-096",
			"SCP-106",
			"a child",
			"a zombie",
			"Gaben",
			"Adolf Hitler",
			"the Furher",
			"Sylvester Stalin",
			"VLT",
			"Spyro",
			"Crash",
			"Gandalf",
			"Bilbo",
			"Frodo",
			"Dumbledore",
			"Sauron",
			"Batman",
			"Bruce Wayne",
			"Little King John",
			"Iron Man",
			"Tony Stark",
			"Superman",
			"Clark Kent",
			"Spider-Man",
			"Peter Parker",
			"Francescomania",
			"your waifu",
			"Terry Crews",
			"Jeff Kaplan",
			"Mario",
			"Luigi",
			"Rick",
			"Morty",
			"Aperture Science test subject n°$_nb$_nb$_nb$_nb",
			"D-$_nb$_nb$_nb$_nb",
			"a headcrab",
			"a xenomorph",
			"your shitty waifu",
			"Kung Fury",
			"Paarthurnax",
			"the President of the United States",
			"Artyom",
			"Bourbon",
			"Khan",
			"Ulman",
			"a nosalis",
			"Abradolf Lincler",
			"Twilight Sparkle",
			"Rarity",
			"Fluttershy",
			"Rainbow Dash",
			"Applejack",
			"Pinkie Pie",
			"someone"
		]
	},
	{
		alias: "adj",
		strings: [
			"dead",
			"ugly",
			"beautiful",
			"clever",
			"dumb",
			"evil",
			"not a bot, contrary to me",
			"the best waifu",
			"the best Warframe",
			"the best Overwatch hero",
			"a better Putin",
			"delicious",
			"out",
			"a lie",
			"gay"
		]
	},
	{
		alias: "food",
		strings: [
			"kebabs",
			"wieners",
			"bananas",
			"flowers",
			"cheese",
			"rotten fish",
			"fish",
			"potatoes",
			"tomatoes",
			"curry with rice",
			"chicken"
		]
	},
	{
		alias: "drink",
		strings: [
			"bleach",
			"Coca Cola",
			"Sprite",
			"Pepsi",
			"Orangina",
			"Mountain Dew",
			"vodka"
		]
	},
	{
		alias: "group",
		strings: [
			"black people",
			"ghouls",
			"vampires",
			"werewolves",
			"white people",
			"dead people",
			"zombies",
			"children",
			"dogs",
			"cats",
			"animals",
			"birds",
			"squirrels",
			"jews",
			"the employees of $_faction",
			"nazis",
			"the Dark Ones",
			"bronies",
			"furries"
		]
	},
	{
		alias: "faction",
		strings: [
			"Black Mesa",
			"the SCP Foundation",
			"Aperture Science",
			"the VLT Corporation",
			"the Internet",
			"the Third Reich",
			"Overwatch",
			"Twitter",
			"Valve",
			"the Illuminati",
			"the Team Benediction",
			"Wayne Enterprise",
			"the Ku Klux Klan",
			"the KKK",
			"the DrG Company",
			"Hanza",
			"the Red Line",
			"the Fourth Reich",
			"Polis",
			"the Sacred Fire Cult"
		]
	},
	{
		alias: "loc",
		strings: [
			"in a pineapple under the sea",
			"in my swamp",
			"in my ass",
			"in Hogwarts",
			"on Jupiter",
			"under your bed",
			"in the Wayne manor",
			"in $_faction headquarters",
			"inside my car battery",
			"on Mercury",
			"next to Trump's wall",
			"in the ISS",
			"behind you",
			"in $_pays",
			"in $_town",
			"in the metro"
		]
	},
	{
		alias: "item",
		strings: [
			"the One Ring to rule them all",
			"a flower",
			"a golden penis",
			"a nuke",
			"Meinkampf",
			"the cake",
			"a magic wand",
			"a Twitter account",
			"the Tardis",
			"a sock",
			"a pair of socks",
			"an apple",
			"a big black dick",
			"a cooler full of organs",
			"AIDS",
			"$_nb wishes",
			"infinite wishes",
			"potato knishes",
			"SCP-294",
			"a Ferrari",
			"a Lamborghini",
			"the worst car ever",
			"a german Panzer IV Ausf. H",
			"a soviet T-34",
			"a sword",
			"a bow",
			"a M416",
			"an AK-47",
			"a Barrett M98B",
			"a RPG-7",
			"the Holy Bible",
			"a nuclear reactor",
			"$_name's personal diary",
			"a Gravity Gun",
			"a Portal Gun",
			"the Aperture Science Handheld Portal Device",
			"the Zero Point Energy Field Manipulator",
			"the DeLorean",
			"$_name's penis",
			"$_game",
			"a cup of $_drink",
			"the Death Note",
			"Bourbon's Kalash",
			"the Elements of Harmony"
		]
	},
	{
		alias: "event",
		strings: [
			"the zombie apocalypse",
			"the end of the world",
			"Donald Trump becoming President of the United States",
			"the nuclear war between $_faction and $_faction",
			"the war between $_faction and $_faction",
			"the nuclear war between $_pays and $_pays",
			"the war between $_pays and $_pays",
			"the nuclear war between $_pays and $_faction",
			"the war between $_pays and $_faction",
			"World War 1",
			"World War 2",
			"World War 3",
			"the apocalypse",
			"the Steam Summer Sale",
			"the weekend",
			"the Sombra ARG",
			"the Emoji Movie"
		]
	},
	{
		alias: "pays",
		strings: [
			"France",
			"United Kingdom",
			"United States",
			"Germany",
			"MURICA",
			"Nazi Germany",
			"North Korea",
			"Japan",
			"China",
			"India",
			"Russia",
			"USRR",
			"Poland",
			"South Korea"
		]
	},
	{
		alias: "ville",
		strings: [
			"Paris",
			"London",
			"Tokyo",
			"New York",
			"San Francisco",
			"Dublin",
			"Berlin",
			"Auschwitz",
			"Moscow",
			"Ponyville",
			"Canterlot"
		]
	},
	{
		alias: "movie",
		strings: [
			"Cars 2",
			"Shrek",
			"Shrek 2",
			"the Emoji Movie",
			"Batman V Superman",
			"Suicide Squad",
			"the Avengers",
			"Dragonball Evolution",
			"House of the Dead",
			"Transformers 3",
			"Fast and Furious $_nb$_nb",
			"Tetris",
			"Kung Fury"
		]
	},
	{
		alias: "warcry",
		strings: [
			"SQUADALA! WE'RE OFF!",
			"THIS IS SPARTA!",
			"YOU SHALL NOT PASS!",
			"DEUS VULT!",
			"FUS RO DAH!",
			"LEEROY JENKINS!"
		]
	},
	{
		alias: "action",
		strings: [
			"kill $_name",
			"eat $_name",
			"marry $_name",
			"drink $_drink",
			"eat $_food",
			"steal $_item",
			"buy $_item",
			"fuck $_name",
			"join $_faction",
			"get fired from $_faction",
			"work for $_faction",
			"die",
			"sleep",
			"cook $_food",
			"meet $_name",
			"invade $_pays",
			"defeat $_name",
			"destroy $_item",
			"find $_item",
			"be as cool as me",
			"be as cool as $_name",
			"kill you",
			"eat you",
			"kill all $_group",
			"eat all $_group"
		]
	},
	{
		alias: "game",
		strings: [
			"Skyrim",
			"Warframe",
			"Overwatch",
			"Half-Life 3",
			"League of Legends",
			"Minecraft",
			"Starbound",
			"Undertale",
			"Portal 2",
			"Left 4 Dead 2",
			"Garry's Mod",
			"The Forest",
			"Besiege",
			"Interloper",
			"Spore"
		]
	},
	{
		alias: "nb",
		strings: [
			"0",
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9"
		]
	}
];

module.exports = {
  genFact: genFact,
  findFact: findFact,
	provideDatabase: provideDatabase,
	fetchDatabase: fetchDatabase,
	genBulk: genBulk,
	saved: saved
};
