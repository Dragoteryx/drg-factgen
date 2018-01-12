"use strict";

const http = require("http");
const url = require("url");
require("dotenv").config();

// SHITPOSTING RELATED FUNCTIONS
function genShitpost() {
	let texte = "$begin";
	let constName = randTab(database[2].strings);
	for (let i = 0; i < 15; i++) {
		texte = texte
		.replace("$cname", constName);
		for (let data of database)
			texte = texte.replace("$" + data.name, randTab(data.strings));
	}
	return firstCharUpper(texte);
}
function findShitpost(strings) {
	let done = false;
	let shitpost;
	for (let i = 0; i < 50000 && !done; i++) {
		shitpost = genShitpost();
		console.log("Shitpost " + i + ": " + shitpost);
		done = stringContainsAllArray(shitpost, strings);
	} if (done)
		return Promise.resolve(shitpost);
	return Promise.reject("shitpostNotFound");
}

// OTHER FUNCTIONS
function randTab(tab) {
	return tab[Math.floor(Math.random()*tab.length)];
}
function stringContainsAllArray(string, tab) {
	for (let i = 0; i < tab.length; i++)
		if (!string.toLowerCase().includes(tab[i].toLowerCase())) return false;
	return true;
}
function firstCharUpper(string) {
	return string[0].toUpperCase() + string.slice(1);
}

// WEBSERVER
http.createServer((req, res) => {
  res.writeHead(200, {"Content-Type": "text/plain"});
	let q = url.parse(req.url, true).query;
	console.log("Connexion");
	if (q.query === undefined) {
		console.log("Requesting random shitpost");
		let shitpost = genShitpost();
		console.log("Shitpost: " + shitpost);
  	res.end(shitpost);
	} else {
		console.log("Requesting shitpost corresponding to: " + q.query);
		findShitpost(q.query.split("_")).then(shitpost => {
			res.end(shitpost);
		}).catch(err => {
			console.log("Shitpost not found");
			res.end("shitpostGenerationError");
		})

	}
}).listen(process.env.PORT);

// DATABASE
let database = [
	{
		name: "begin",
		strings: [
			"My Senpai told me that $end.",
			"Did you know that $end?",
			"Thanks to science, we now know that $end.",
			"I wanted to tell you that $end.",
			"You might not believe me, but $end.",
			"I'm almost certain that $end.",
			"I think $end.",
			"Listen : $end.",
			"You are not forced to agree with me, but $end.",
			"I'm pleased to tell you that $end.",
			"I'm sorry to inform you that $end.",
			"To be honest, I think $end.",
			"According to Fox News, $end.",
			"According to the police, $end.",
			"Some rumors say that $end.",
			"An ancient prophecy tells that $end.",
			"Someone told me that $end.",
			"Gaben, our lord and savior, told me that $end.",
			"Meanwhile, in a parallel universe, $end.",
			"It is written that only $end.",
			"Just a daily reminder that $end.",
			"I'm coming from the future to tell you that $end.",
			"How come $end?",
			"This is absolute truth : $end.",
			"You can't deny that $end.",
			"You can't disagree with me when I say that $end.",
			"This is truth : $end.",
			"Somehow, $end.",
			"Some rumors at $entr say that $end.",
			"According to $name, $end.",
			"I bet you $item that $end.",
			"You thought it was $name, but it was me, Dio !",
			"Look up in the sky ! It's a bird ! It's a plane ! It's $name !",
			"I was told by $name that $end.",
			"It would be so cool if $event didn't happen.",
			"I'm wondering how the world would be if $event did not happen.",
			"$end. Crazy, right?",
			"Tell me that $end, or I'll murder you.",
			"For some reason, $end.",
			"It would be fun if $end.",
			"Would you rather $action or $action?"
		]
	},
	{
		name: "end",
		strings: [
			"$name's favorite drink is $drink",
			"$name's favorite food is $food",
			"$cname is love, $cname is life",
			"$name works for $entr",
			"$entr headquarters are located $loc",
			"$name is $name",
			"$name is $adj",
			"$name is $adj and $adj",
			"$name doesn't need to poop",
			"$name is better than you",
			"$name doesn't like you",
			"$name hates you",
			"$name loves you",
			"$name would like $goal",
			"$entr would like $goal",
			"$name has no soul",
			"$name needs healing",
			"$name needs $item",
			"$name lives $loc",
			"$name and $name live $loc",
			"$name is searching for $item",
			"$name's treasure is hidden $loc",
			"$name doesn't exist",
			"$name wants $goal",
			"$name looks better than you",
			"$name is your master",
			"$name is not as dumb as $name",
			"$name is not as smart as $name",
			"$name is cooler than $name",
			"$name is faster than $name",
			"$name is better than $name",
			"$name killed $name",
			"$name ate $name",
			"$name ate $food",
			"$name ate $item",
			"$name kicked $name",
			"$name hates $name",
			"$name likes $name",
			"$name loves $name",
			"$name hates $food",
			"$name likes $food",
			"$name loves $food",
			"$name hates $drink",
			"$name likes $drink",
			"$name loves $drink",
			"$name is scared of $name",
			"$name hates $group",
			"$name likes $group",
			"$name loves $group",
			"$name is scared of $group",
			"$name slept with $name",
			"$name should be contained by the SCP Foundation",
			"$name died for his country",
			"$name has found $item",
			"$name has $item",
			"$name doesn't have $item",
			"$name gave $item to $name",
			"$name gave $item to $name $goal",
			"$name is married with $name",
			"$name has stolen $item",
			"$item was created by $name",
			"$name and $name allied themselves $goal",
			"$entr and $entr allied themselves $goal",
			"$name and $entr allied themselves $goal",
			"$name came into possession of $item",
			"$goal, you need $goal first",
			"$name can help you $goal",
			"$goal, you will need the help of $name",
			"$nb + $nb = $nb",
			"the easiest way $goal is $goal",
			"$item is powered using $item",
			"$name caused $event",
			"$entr caused $event",
			"there's a museum about $name $loc",
			"there's a museum about $entr $loc",
			"there's a museum about $group $loc",
			"there's a museum about $food $loc",
			"there's a museum about $drink $loc",
			"$event happenned $loc",
			"$name created $item $goal",
			"$movie is $name's favorite movie",
			"$movie will predict the future",
			"$movie is the best movie ever",
			"$movie is the worst movie ever",
			"$movie is my favorite movie",
			"1 $cname + 1 $cname = 2 $cnames",
			"$end, and $end"
		]
	},
	{
		name: "name",
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
			"a shitposter",
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
			"Aperture Science test subject n°$nb$nb$nb$nb",
			"D-$nb$nb$nb$nb",
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
			"a Nosalis"
		]
	},
	{
		name: "adj",
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
			"not true",
			"gay",
			"true"
		]
	},
	{
		name: "food",
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
		name: "drink",
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
		name: "group",
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
			"the employees of $entr",
			"nazis",
			"the Dark Ones"
		]
	},
	{
		name: "entr",
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
			"Hansa",
			"the Red Line",
			"the Fourth Reich",
			"Polis"
		]
	},
	{
		name: "loc",
		strings: [
			"in a pineapple under the sea",
			"in my swamp",
			"in my ass",
			"in Hogwarts",
			"on Jupiter",
			"under your bed",
			"in the Wayne manor",
			"in $entr headquarters",
			"inside my car battery",
			"on Mercury",
			"next to Trump's wall",
			"in the ISS",
			"behind you",
			"in $pays",
			"in $ville",
			"in the metro"
		]
	},
	{
		name: "item",
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
			"$nb wishes",
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
			"$name's personal diary",
			"a Gravity Gun",
			"a Portal Gun",
			"the Aperture Science Handheld Portal Device",
			"the Zero Point Energy Field Manipulator",
			"the DeLorean",
			"$name's penis",
			"$game",
			"a cup of $drink",
			"the Death Note",
			"Bourbon's Kalash"
		]
	},
	{
		name: "goal",
		strings: [
			"to destroy $item",
			"to find $item",
			"to be as cool as me",
			"to be as cool as $name",
			"to kill you",
			"to eat you",
			"to kill $name",
			"to eat $name",
			"to kill all $group",
			"to eat all $group",
			"to defeat $name"
		]
	},
	{
		name: "event",
		strings: [
			"the zombie apocalypse",
			"the end of the world",
			"Donald Trump becoming President of the United States",
			"the nuclear war between $entr and $entr",
			"the war between $entr and $entr",
			"the nuclear war between $pays and $pays",
			"the war between $pays and $pays",
			"the nuclear war between $pays and $entr",
			"the war between $pays and $entr",
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
		name: "pays",
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
			"USRR"
		]
	},
	{
		name: "ville",
		strings: [
			"Paris",
			"London",
			"Tokyo",
			"New York",
			"San Francisco",
			"Dublin",
			"Berlin",
			"Auschwitz",
			"Moscow"
		]
	},
	{
		name: "movie",
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
			"Fast and Furious $nb$nb",
			"Tetris",
			"Kung Fury"
		]
	},
	{
		name: "warcry",
		strings: [
			"SQUADALA! WE'RE OFF!",
			"THIS IS SPARTA!",
			"..."
		]
	},
	{
		name: "action",
		strings: [
			"kill $name",
			"eat $name",
			"marry $name",
			"drink $drink",
			"eat $food",
			"steal $item",
			"buy $item",
			"fuck $name",
			"join $entr",
			"get fired from $entr",
			"work for $entr",
			"die",
			"sleep",
			"cook $food",
			"meet $name"
		]
	},
	{
		name: "game",
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
		name: "nb",
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
]

console.log("OK => " + genShitpost());
