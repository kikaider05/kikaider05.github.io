var navTemplate,
	memberTemplate,
	characterJobsTemplate,
	characterCollectibleTemplate,
	characterInfoTemplate,
	characterDataContainerTemplate,
	noCharacterDataTemplate

$(document).ready(function() {
	var navTemplateSource = document.getElementById("nav-template").innerHTML;
	var memberTemplateSource = document.getElementById("member-template").innerHTML;
	var characterJobsTemplateSource = document.getElementById("character-jobs-template").innerHTML;
	var characterCollectibleTemplateSource = document.getElementById("character-collectible-template").innerHTML;
	var characterInfoTemplateSource = document.getElementById("character-info-template").innerHTML;
	var characterDataContainerTemplateSource = document.getElementById("character-data-container-template").innerHTML;
	var noCharacterDataTemplateSource = document.getElementById("no-character-data-template").innerHTML;
	
	navTemplate = Handlebars.compile(navTemplateSource);
	memberTemplate = Handlebars.compile(memberTemplateSource);
	characterJobsTemplate = Handlebars.compile(characterJobsTemplateSource);
	characterCollectibleTemplate = Handlebars.compile(characterCollectibleTemplateSource);
	characterInfoTemplate = Handlebars.compile(characterInfoTemplateSource);
	characterDataContainerTemplate = Handlebars.compile(characterDataContainerTemplateSource);
	noCharacterDataTemplate = Handlebars.compile(noCharacterDataTemplateSource);

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
		var loadRaces = new Promise((resolve, reject) => {
			loadEnumeration("Race", 1, resolve, reject);
		});
		Promise.all([
			loadMounts,
			loadMinions,
			loadRaces
		]).then(values => {
			sessionStorage.setItem("ffxiv_data", JSON.stringify(ffxivData));
			loadPage();
		})
	}
})

$(document).on('click', '#my-character-btn', function(i, e) {
	Cookies.set('main_character', $(i.target).data("id"));
	$(i.target).hide();
});

$(document).on('keyup', '#member-search', function() {
	var $noMatches = $('#member-section').find('li').filter(function(i, key) {
		return $(this).data('name').toLowerCase().indexOf($('#member-search').val().toLowerCase()) == -1;
	});
	$noMatches.hide();
	$('#member-section').find('li').not($noMatches).show();
});

function loadPage() {
	if (Cookies.get("main_character")) {
		displayCharacterPage(Cookies.get("main_character"));
	} else {
		$('.intro-alert').show();
	}
	$.get("https://xivapi.com/freecompany/9230971861226067551?data=FCM", function( data ) {
		$('#nav-section').html(navTemplate(data.FreeCompany));
		var memberTemplateData = {
			"Members": data.FreeCompanyMembers.data
		};
		$('#member-section').html(memberTemplate(memberTemplateData));
	});
	$('body').on('click', '.member-item', function (i, e) {
		displayCharacterPage($(i.target).data("id"));
	});
}

function displayCharacterPage(id) {
	$('.intro-section').hide();
	$('#jobs-section').html(characterDataContainerTemplate({ DataType: "Jobs"}));
	$('#collectible-section').html(characterDataContainerTemplate({ DataType: "Collectibles"}));
	$('#info-section').hide();
	$.get("https://xivapi.com/character/" + id + '?columns=Character.Name,Character.ClassJobs,Character.Tribe,Character.Race,Character.GrandCompany.NameID,Character.Gender,Character.Minions,Character.Mounts,Info.Character.State', function(data) {
		if (data.Info.Character.State == 1 || data.Info.Character.State == 0) {
			$("#jobs-section .dynamic-data-section").html(noCharacterDataTemplate({ DataType: "job" }));
			$('#collectible-section .dynamic-data-section').html(noCharacterDataTemplate({ DataType: "collectible" }));
		} else {
			displayCharacterInfo(data.Character, id);
			displayJobs(data);
			displayMounts(data);
		}
		window.scroll({top: 0, left: 0, behavior: 'smooth' });
	});
}

function displayCharacterInfo(data, id) {
	var mainCharacterID = Cookies.get("main_character");
	var characterInfoTemplateData = {
		ID: id,
		Name: data.Name,
		Gender: gender[data.Gender],
		Race: ffxivData["Race"][data.Race].Name,
		GrandCompany: grandCompanies[data.GrandCompany.NameID],
		ShowButton: mainCharacterID && mainCharacterID == id.toString() ? false : true
	};
	$('#info-section').html(characterInfoTemplate(characterInfoTemplateData)).show();
}

function displayJobs(data) {
	var jobs = {"Damage": [], "Hand": [], "Tank": [], "Healer": []};
	for (var classJob in data.Character.ClassJobs) {
		var key = data.Character.ClassJobs[classJob];
		var currentClass = classes[key.JobID];
		if (key.Level == 70) {
			jobs[currentClass.Type].push({ "Icon": currentClass.Icon, "ExpLevel": "", "ExpLevelMax": 100, "Level": key.Level, "Name": currentClass.Name, "Width": 100 });
		} else if (key.Level != 0) {
			jobs[currentClass.Type].push({ "Icon": currentClass.Icon, "ExpLevel": key.ExpLevel, "ExpLevelMax": key.ExpLevelMax, "Level": key.Level, "Name": currentClass.Name, "Width": key.ExpLevel / key.ExpLevelMax * 100 });
		}
	};
	characterJobsTemplateData = { 
		ClassTypes: [
			{ Name: "Tank", Classes: jobs.Tank },
			{ Name: "Damage", Classes: jobs.Damage }, 
			{ Name: "Healer", Classes: jobs.Healer }, 
			{ Name: "Hand & Land", "Classes": jobs.Hand }]
	}
	$('#jobs-section .dynamic-data-section').html(characterJobsTemplate(characterJobsTemplateData));
}

function displayMounts(data) {
	characterCollectibleTemplateData = {
		OwnedMountCount: data.Character.Mounts.length,
		MountCount: Object.keys(ffxivData["Mount"]).length,
		Mounts: [],
		OwnedMinionCount: data.Character.Minions.length,
		MinionCount: Object.keys(ffxivData["Companion"]).length,
		Minions: []
	}
	var ownedMounts = {};
	$.each(data.Character.Mounts, function(i, key) {
		ownedMounts[key] = {};
		var mount = ffxivData["Mount"][key];
		mount.Owned = true;
		characterCollectibleTemplateData.Mounts.push(ffxivData["Mount"][key])
	});
	$.each(ffxivData["Mount"], function (i, key) {
		if (!(key.ID in ownedMounts)) {
			key.Owned = false
			characterCollectibleTemplateData.Mounts.push(key)
		}
	});
	var ownedMinions = {};
	$.each(data.Character.Minions, function(i, key) {
		ownedMinions[key] = {};
		var minion = ffxivData["Companion"][key];
		minion.Owned = true;
		characterCollectibleTemplateData.Minions.push(ffxivData["Companion"][key])
	});
	$.each(ffxivData["Companion"], function (i, key) {
		if (!(key.ID in ownedMinions)) {
			key.Owned = false;
			characterCollectibleTemplateData.Minions.push(key)
		}
	});
	$('#collectible-section .dynamic-data-section').html(characterCollectibleTemplate(characterCollectibleTemplateData));
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
classes[1] = { "ID": 1, "Icon": "https://xivapi.com/cj/1/gladiator.png", "Name": "gladiator", "Type": "Damage"}
classes[2] = { "ID": 2, "Icon": "https://xivapi.com/cj/1/pugilist.png", "Name": "pugilist", "Type": "Damage"}
classes[3] = { "ID": 3, "Icon": "https://xivapi.com/cj/1/marauder.png", "Name": "marauder", "Type": "Damage"}
classes[4] = { "ID": 4, "Icon": "https://xivapi.com/cj/1/lancer.png", "Name": "lancer", "Type": "Damage"}
classes[5] = { "ID": 5, "Icon": "https://xivapi.com/cj/1/archer.png", "Name": "archer", "Type": "Damage"}
classes[6] = { "ID": 6, "Icon": "https://xivapi.com/cj/1/conjurer.png", "Name": "conjurer", "Type": "Damage"}
classes[7] = { "ID": 7, "Icon": "https://xivapi.com/cj/1/thaumaturge.png", "Name": "thaumaturge", "Type": "Damage"}
classes[8] = { "ID": 8, "Icon": "https://xivapi.com/cj/1/carpenter.png", "Name": "carpenter", "Type": "Hand"}
classes[9] = { "ID": 9, "Icon": "https://xivapi.com/cj/1/blacksmith.png", "Name": "blacksmith", "Type": "Hand"}
classes[10] = { "ID": 10, "Icon": "https://xivapi.com/cj/1/armorer.png", "Name": "armorer", "Type": "Hand"}
classes[11] = { "ID": 11, "Icon": "https://xivapi.com/cj/1/goldsmith.png", "Name": "goldsmith", "Type": "Hand"}
classes[12] = { "ID": 12, "Icon": "https://xivapi.com/cj/1/leatherworker.png", "Name": "leatherworker", "Type": "Hand"}
classes[13] = { "ID": 13, "Icon": "https://xivapi.com/cj/1/weaver.png", "Name": "weaver", "Type": "Hand"}
classes[14] = { "ID": 14, "Icon": "https://xivapi.com/cj/1/alchemist.png", "Name": "alchemist", "Type": "Hand"}
classes[15] = { "ID": 15, "Icon": "https://xivapi.com/cj/1/culinarian.png", "Name": "culinarian", "Type": "Hand"}
classes[16] = { "ID": 16, "Icon": "https://xivapi.com/cj/1/miner.png", "Name": "miner", "Type": "Hand"}
classes[17] = { "ID": 17, "Icon": "https://xivapi.com/cj/1/botanist.png", "Name": "botanist", "Type": "Hand"}
classes[18] = { "ID": 18, "Icon": "https://xivapi.com/cj/1/fisher.png", "Name": "fisher", "Type": "Hand"}
classes[19] = { "ID": 19, "Icon": "https://xivapi.com/cj/1/paladin.png", "Name": "paladin", "Type": "Tank"}
classes[20] = { "ID": 20, "Icon": "https://xivapi.com/cj/1/monk.png", "Name": "monk", "Type": "Damage"}
classes[21] = { "ID": 21, "Icon": "https://xivapi.com/cj/1/warrior.png", "Name": "warrior", "Type": "Tank"}
classes[22] = { "ID": 22, "Icon": "https://xivapi.com/cj/1/dragoon.png", "Name": "dragoon", "Type": "Damage"}
classes[23] = { "ID": 23, "Icon": "https://xivapi.com/cj/1/bard.png", "Name": "bard", "Type": "Damage"}
classes[24] = { "ID": 24, "Icon": "https://xivapi.com/cj/1/whitemage.png", "Name": "white mage", "Type": "Healer"}
classes[25] = { "ID": 25, "Icon": "https://xivapi.com/cj/1/blackmage.png", "Name": "black mage", "Type": "Damage"}
classes[26] = { "ID": 26, "Icon": "https://xivapi.com/cj/1/arcanist.png", "Name": "arcanist", "Type": "Damage"}
classes[27] = { "ID": 27, "Icon": "https://xivapi.com/cj/1/summoner.png", "Name": "summoner", "Type": "Damage"}
classes[28] = { "ID": 28, "Icon": "https://xivapi.com/cj/1/scholar.png", "Name": "scholar", "Type": "Healer"}
classes[29] = { "ID": 29, "Icon": "https://xivapi.com/cj/1/rogue.png", "Name": "rogue", "Type": "Damage"}
classes[30] = { "ID": 30, "Icon": "https://xivapi.com/cj/1/ninja.png", "Name": "ninja", "Type": "Damage"}
classes[31] = { "ID": 31, "Icon": "https://xivapi.com/cj/1/machinist.png", "Name": "machinist", "Type": "Damage"}
classes[32] = { "ID": 32, "Icon": "https://xivapi.com/cj/1/darkknight.png", "Name": "dark knight", "Type": "Tank"}
classes[33] = { "ID": 33, "Icon": "https://xivapi.com/cj/1/astrologian.png", "Name": "astrologian", "Type": "Healer"}
classes[34] = { "ID": 34, "Icon": "https://xivapi.com/cj/1/samurai.png", "Name": "samurai", "Type": "Damage"}
classes[35] = { "ID": 35, "Icon": "https://xivapi.com/cj/1/redmage.png", "Name": "red mage", "Type": "Damage"}
classes[36] = { "ID": 36, "Icon": "https://xivapi.com/cj/1/bluemage.png", "Name": "blue mage", "Type": "Damage"}

var grandCompanies = {};
grandCompanies[1] = "Maelstrom";
grandCompanies[2] = "Order of the Twin Adder";
grandCompanies[3] = "Immortal Flames";

var gender = {};
gender[1] = "Male";
gender[2] = "Female";

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
