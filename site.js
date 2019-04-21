$(document).ready(function() {
	if (sessionStorage.getItem("ffxiv_data") != null) {
		ffxivData = JSON.parse(sessionStorage.getItem("ffxiv_data"));
		loadPage();
	} else {
		var loadMounts = new Promise((resolve, reject) => {
			loadEnumeration("Mount", 1, resolve, reject);
		});
		var loadMinions = new Promise((resolve, reject) => {
			loadEnumeration("Companion", 1, resolve, reject);
		});
		Promise.all([
			loadMounts,
			loadMinions
		]).then(values => {
			sessionStorage.setItem("ffxiv_data", JSON.stringify(ffxivData));
			loadPage();
		})
	}
})

function loadPage() {
	var guildTemplateSource   = document.getElementById("guild-template").innerHTML;
	var guildTemplate = Handlebars.compile(guildTemplateSource);
	var characterTemplateSource   = document.getElementById("character-template").innerHTML;
	var characterTemplate = Handlebars.compile(characterTemplateSource);
	var characterInfoTemplateSource   = document.getElementById("character-info-template").innerHTML;
	var characterInfoTemplate = Handlebars.compile(characterInfoTemplateSource);

	$.get("https://xivapi.com/freecompany/9230971861226067551?data=FCM", function( data ) {
		var guildTemplateData = { 
			"Guild-Header": data.FreeCompany.Name, 
			"Guild-Members-Count": data.FreeCompany.ActiveMemberCount, 
			"Guild-Slogan": data.FreeCompany.Slogan
		};
		$('#guild-section').html(guildTemplate(guildTemplateData));
		$.each(data.FreeCompanyMembers.data, function(i, key) {
			var characterTemplateData = { 
				"Character-Avatar": key.Avatar, 
				"Character-Name": key.Name, 
				"Character-ID":  key.ID,
				"Character-Guild-Rank": key.Rank
			};
			$('#character-accordion').append(characterTemplate(characterTemplateData));
		});
	});

	$('#guild-section').on('show.bs.collapse', function (i, e) {
		$.get("https://xivapi.com/character/" + $(i.target).data("id") + '?columns=Character.ClassJobs,Character.Tribe,Character.Race,Character.GrandCompany.NameID,Character.Gender,Character.Minions,Character.Mounts', function(data) {
			//Jobs
			var characterInfoTemplateData = { 
				"ClassJobs": [],
				"Minions": [],
				"Mounts": [],
				"Tribe": tribes[data.Character.Tribe], 
				"Race": races[data.Character.Race],
				"Gender": gender[data.Character.Gender],
				"GrandCompany": grandCompanies[data.Character.GrandCompany.NameID]
			};
			var jobs = {"d": [], "c": [], "t": [], "h": [], "g": []};
			for (var classJob in data.Character.ClassJobs) {
				var key = data.Character.ClassJobs[classJob];
				var currentClass = classes[key.JobID];
				if (key.Level == 70) {
					jobs[currentClass.Type].push({ "Icon": currentClass.Icon, "ExpLevel": "", "ExpLevelMax": 100, "Level": key.Level, "Name": currentClass.Name, "Width": 100 });
				} else if (key.Level != 0) {
					jobs[currentClass.Type].push({ "Icon": currentClass.Icon, "ExpLevel": key.ExpLevel, "ExpLevelMax": key.ExpLevelMax, "Level": key.Level, "Name": currentClass.Name, "Width": key.ExpLevel / key.ExpLevelMax * 100 });
				}
			};
			$.each(jobs.t, function(i, key) {
				characterInfoTemplateData.ClassJobs.push(key);
			});
			$.each(jobs.h, function(i, key) {
				characterInfoTemplateData.ClassJobs.push(key);
			});
			$.each(jobs.d, function(i, key) {
				characterInfoTemplateData.ClassJobs.push(key);
			});
			$.each(jobs.c, function(i, key) {
				characterInfoTemplateData.ClassJobs.push(key);
			});
			$.each(jobs.g, function(i, key) {
				characterInfoTemplateData.ClassJobs.push(key);
			});
			//Mounts
			var ownedMounts = {};
			$.each(data.Character.Mounts, function(i, key) {
				ownedMounts[key] = {};
				var mount = ffxivData["Mount"][key];
				mount.Owned = true;
				characterInfoTemplateData.Mounts.push(ffxivData["Mount"][key])
			});
			$.each(ffxivData["Mount"], function (i, key) {
				if (!(key.ID in ownedMounts)) {
					key.Owned = false
					characterInfoTemplateData.Mounts.push(key)
				}
			});
			//Minions
			var ownedMinions = {};
			$.each(data.Character.Minions, function(i, key) {
				ownedMinions[key] = {};
				var minion = ffxivData["Companion"][key];
				minion.Owned = true;
				characterInfoTemplateData.Minions.push(ffxivData["Companion"][key])
			});
			$.each(ffxivData["Companion"], function (i, key) {
				if (!(key.ID in ownedMinions)) {
					key.Owned = false;
					characterInfoTemplateData.Minions.push(key)
				}
			});
			$(i.target).html(characterInfoTemplate(characterInfoTemplateData));
		});
	});
}

function loadEnumeration(enumerationType, page, resolve, reject) {
	if (!(enumerationType in ffxivData)) {
		ffxivData[enumerationType] = {};
	}
	$.get("https://xivapi.com/" + enumerationType + "?page=" + page, function(data) {
		$.each(data.Results, function(i, key) {
			if (key.Name != "") {
				ffxivData[enumerationType][key.ID] = key;
			}
		});
		if (data.Pagination.PageTotal > data.Pagination.Page) {
			loadEnumeration(enumerationType, page + 1, resolve, reject);
		} else {
			resolve();
		}
	});
}

var ffxivData = {};

//Static Enumerations
var classes = {};
classes[1] = { "ID": 1, "Icon": "https://xivapi.com/cj/1/gladiator.png", "Name": "gladiator", "Type": "d"}
classes[2] = { "ID": 2, "Icon": "https://xivapi.com/cj/1/pugilist.png", "Name": "pugilist", "Type": "d"}
classes[3] = { "ID": 3, "Icon": "https://xivapi.com/cj/1/marauder.png", "Name": "marauder", "Type": "d"}
classes[4] = { "ID": 4, "Icon": "https://xivapi.com/cj/1/lancer.png", "Name": "lancer", "Type": "d"}
classes[5] = { "ID": 5, "Icon": "https://xivapi.com/cj/1/archer.png", "Name": "archer", "Type": "d"}
classes[6] = { "ID": 6, "Icon": "https://xivapi.com/cj/1/conjurer.png", "Name": "conjurer", "Type": "d"}
classes[7] = { "ID": 7, "Icon": "https://xivapi.com/cj/1/thaumaturge.png", "Name": "thaumaturge", "Type": "d"}
classes[8] = { "ID": 8, "Icon": "https://xivapi.com/cj/1/carpenter.png", "Name": "carpenter", "Type": "c"}
classes[9] = { "ID": 9, "Icon": "https://xivapi.com/cj/1/blacksmith.png", "Name": "blacksmith", "Type": "c"}
classes[10] = { "ID": 10, "Icon": "https://xivapi.com/cj/1/armorer.png", "Name": "armorer", "Type": "c"}
classes[11] = { "ID": 11, "Icon": "https://xivapi.com/cj/1/goldsmith.png", "Name": "goldsmith", "Type": "c"}
classes[12] = { "ID": 12, "Icon": "https://xivapi.com/cj/1/leatherworker.png", "Name": "leatherworker", "Type": "c"}
classes[13] = { "ID": 13, "Icon": "https://xivapi.com/cj/1/weaver.png", "Name": "weaver", "Type": "c"}
classes[14] = { "ID": 14, "Icon": "https://xivapi.com/cj/1/alchemist.png", "Name": "alchemist", "Type": "c"}
classes[15] = { "ID": 15, "Icon": "https://xivapi.com/cj/1/culinarian.png", "Name": "culinarian", "Type": "c"}
classes[16] = { "ID": 16, "Icon": "https://xivapi.com/cj/1/miner.png", "Name": "miner", "Type": "g"}
classes[17] = { "ID": 17, "Icon": "https://xivapi.com/cj/1/botanist.png", "Name": "botanist", "Type": "g"}
classes[18] = { "ID": 18, "Icon": "https://xivapi.com/cj/1/fisher.png", "Name": "fisher", "Type": "g"}
classes[19] = { "ID": 19, "Icon": "https://xivapi.com/cj/1/paladin.png", "Name": "paladin", "Type": "t"}
classes[20] = { "ID": 20, "Icon": "https://xivapi.com/cj/1/monk.png", "Name": "monk", "Type": "d"}
classes[21] = { "ID": 21, "Icon": "https://xivapi.com/cj/1/warrior.png", "Name": "warrior", "Type": "t"}
classes[22] = { "ID": 22, "Icon": "https://xivapi.com/cj/1/dragoon.png", "Name": "dragoon", "Type": "d"}
classes[23] = { "ID": 23, "Icon": "https://xivapi.com/cj/1/bard.png", "Name": "bard", "Type": "d"}
classes[24] = { "ID": 24, "Icon": "https://xivapi.com/cj/1/whitemage.png", "Name": "white mage", "Type": "h"}
classes[25] = { "ID": 25, "Icon": "https://xivapi.com/cj/1/blackmage.png", "Name": "black mage", "Type": "d"}
classes[26] = { "ID": 26, "Icon": "https://xivapi.com/cj/1/arcanist.png", "Name": "arcanist", "Type": "d"}
classes[27] = { "ID": 27, "Icon": "https://xivapi.com/cj/1/summoner.png", "Name": "summoner", "Type": "d"}
classes[28] = { "ID": 28, "Icon": "https://xivapi.com/cj/1/scholar.png", "Name": "scholar", "Type": "h"}
classes[29] = { "ID": 29, "Icon": "https://xivapi.com/cj/1/rogue.png", "Name": "rogue", "Type": "d"}
classes[30] = { "ID": 30, "Icon": "https://xivapi.com/cj/1/ninja.png", "Name": "ninja", "Type": "d"}
classes[31] = { "ID": 31, "Icon": "https://xivapi.com/cj/1/machinist.png", "Name": "machinist", "Type": "d"}
classes[32] = { "ID": 32, "Icon": "https://xivapi.com/cj/1/darkknight.png", "Name": "dark knight", "Type": "t"}
classes[33] = { "ID": 33, "Icon": "https://xivapi.com/cj/1/astrologian.png", "Name": "astrologian", "Type": "h"}
classes[34] = { "ID": 34, "Icon": "https://xivapi.com/cj/1/samurai.png", "Name": "samurai", "Type": "d"}
classes[35] = { "ID": 35, "Icon": "https://xivapi.com/cj/1/redmage.png", "Name": "red mage", "Type": "d"}
classes[36] = { "ID": 36, "Icon": "https://xivapi.com/cj/1/bluemage.png", "Name": "blue mage", "Type": "d"}

var grandCompanies = {};
grandCompanies[1] = "Maelstrom";
grandCompanies[2] = "Order of the Twin Adder";
grandCompanies[3] = "Immortal Flames";

var gender = {};
gender[1] = "Male";
gender[2] = "Female";

var races = {};
races[1] = "Hyur";
races[2] = "Elezen";
races[3] = "Lalafell";
races[4] = "Miqo'te";
races[5] = "Roegadyn";
races[6] = "Au Ra";

var tribes = {};
tribes[1] = "Midlander";
tribes[2] = "Highlander";
tribes[3] = "Wildwood";
tribes[4] = "Duskwight";
tribes[5] = "Plainsfolk";
tribes[6] = "Dunesfolk";
tribes[7] = "Seeker of the Sun";
tribes[8] = "Keeper of the Moon";
tribes[9] = "Sea Wolf";
tribes[10] = "Hellsguard";
tribes[11] = "Raen";
tribes[12] = "Xaela";