$(document).ready(function() {
	var guildTemplateSource   = document.getElementById("guild-template").innerHTML;
	var guildTemplate = Handlebars.compile(guildTemplateSource);
	var characterTemplateSource   = document.getElementById("character-template").innerHTML;
	var characterTemplate = Handlebars.compile(characterTemplateSource);
	var characterInfoTemplateSource   = document.getElementById("character-info-template").innerHTML;
	var characterInfoTemplate = Handlebars.compile(characterInfoTemplateSource);
	var classes = {};
	classes[1] = { "ID": 1, "Icon": "https://xivapi.com/cj/1/gladiator.png", "Name": "gladiator"}
	classes[2] = { "ID": 2, "Icon": "https://xivapi.com/cj/1/pugilist.png", "Name": "pugilist"}
	classes[3] = { "ID": 3, "Icon": "https://xivapi.com/cj/1/marauder.png", "Name": "marauder"}
	classes[4] = { "ID": 4, "Icon": "https://xivapi.com/cj/1/lancer.png", "Name": "lancer"}
	classes[5] = { "ID": 5, "Icon": "https://xivapi.com/cj/1/archer.png", "Name": "archer"}
	classes[6] = { "ID": 6, "Icon": "https://xivapi.com/cj/1/conjurer.png", "Name": "conjurer"}
	classes[7] = { "ID": 7, "Icon": "https://xivapi.com/cj/1/thaumaturge.png", "Name": "thaumaturge"}
	classes[8] = { "ID": 8, "Icon": "https://xivapi.com/cj/1/carpenter.png", "Name": "carpenter"}
	classes[9] = { "ID": 9, "Icon": "https://xivapi.com/cj/1/blacksmith.png", "Name": "blacksmith"}
	classes[10] = { "ID": 10, "Icon": "https://xivapi.com/cj/1/armorer.png", "Name": "armorer"}
	classes[11] = { "ID": 11, "Icon": "https://xivapi.com/cj/1/goldsmith.png", "Name": "goldsmith"}
	classes[12] = { "ID": 12, "Icon": "https://xivapi.com/cj/1/leatherworker.png", "Name": "leatherworker"}
	classes[13] = { "ID": 13, "Icon": "https://xivapi.com/cj/1/weaver.png", "Name": "weaver"}
	classes[14] = { "ID": 14, "Icon": "https://xivapi.com/cj/1/alchemist.png", "Name": "alchemist"}
	classes[15] = { "ID": 15, "Icon": "https://xivapi.com/cj/1/culinarian.png", "Name": "culinarian"}
	classes[16] = { "ID": 16, "Icon": "https://xivapi.com/cj/1/miner.png", "Name": "miner"}
	classes[17] = { "ID": 17, "Icon": "https://xivapi.com/cj/1/botany.png", "Name": "botanist"}
	classes[18] = { "ID": 18, "Icon": "https://xivapi.com/cj/1/fisher.png", "Name": "fisher"}
	classes[19] = { "ID": 19, "Icon": "https://xivapi.com/cj/1/paladin.png", "Name": "paladin"}
	classes[20] = { "ID": 20, "Icon": "https://xivapi.com/cj/1/monk.png", "Name": "monk"}
	classes[21] = { "ID": 21, "Icon": "https://xivapi.com/cj/1/warrior.png", "Name": "warrior"}
	classes[22] = { "ID": 22, "Icon": "https://xivapi.com/cj/1/dragoon.png", "Name": "dragoon"}
	classes[23] = { "ID": 23, "Icon": "https://xivapi.com/cj/1/bard.png", "Name": "bard"}
	classes[24] = { "ID": 24, "Icon": "https://xivapi.com/cj/1/whitemage.png", "Name": "white mage"}
	classes[25] = { "ID": 25, "Icon": "https://xivapi.com/cj/1/blackmage.png", "Name": "black mage"}
	classes[26] = { "ID": 26, "Icon": "https://xivapi.com/cj/1/arcanist.png", "Name": "arcanist"}
	classes[27] = { "ID": 27, "Icon": "https://xivapi.com/cj/1/summoner.png", "Name": "summoner"}
	classes[28] = { "ID": 28, "Icon": "https://xivapi.com/cj/1/scholar.png", "Name": "scholar"}
	classes[29] = { "ID": 29, "Icon": "https://xivapi.com/cj/1/rogue.png", "Name": "rogue"}
	classes[30] = { "ID": 30, "Icon": "https://xivapi.com/cj/1/ninja.png", "Name": "ninja"}
	classes[31] = { "ID": 31, "Icon": "https://xivapi.com/cj/1/machinist.png", "Name": "machinist"}
	classes[32] = { "ID": 32, "Icon": "https://xivapi.com/cj/1/darkknight.png", "Name": "dark knight"}
	classes[33] = { "ID": 33, "Icon": "https://xivapi.com/cj/1/astrologian.png", "Name": "astrologian"}
	classes[34] = { "ID": 34, "Icon": "https://xivapi.com/cj/1/samurai.png", "Name": "samurai"}
	classes[35] = { "ID": 35, "Icon": "https://xivapi.com/cj/1/redmage.png", "Name": "red mage"}


	$.get("https://xivapi.com/freecompany/9230971861226067551?data=FCM", function( data ) {
		var guildTemplateData = { "Guild-Header": data.FreeCompany.Name };
		$('#guild-section').html(guildTemplate(guildTemplateData));
		$.each(data.FreeCompanyMembers, function(i, key) {
			var characterTemplateData = { "Character-Avatar": key.Avatar, "Character-Name": key.Name, "Character-ID":  key.ID};
			$('#character-accordion').append(characterTemplate(characterTemplateData));
		});
	});

	$('#guild-section').on('show.bs.collapse', function (i, e) {
		/*$.get("https://xivapi.com/ClassJob?columns=ID,Icon,Name", function(data) {
			$.each(data.Results, function(i, key) {
				console.log('classes[' + key.ID + '] = { "ID": ' + key.ID + ', "Icon": "https://xivapi.com' + key.Icon + '", "Name": "' + key.Name + '"}');
			});
			
		});*/
		$.get("https://xivapi.com/character/" + $(i.target).data("id") + '?columns=Character.ClassJobs', function(data) {
			 var characterInfoTemplateData = [];
			 console.log(data);
			 $.each(data.Character.ClassJobs, function (i, key) {
				  if (key.Level == 70) {
						characterInfoTemplateData.push({ "Icon": classes[key.JobID].Icon, "ExpLevel": "", "ExpLevelMax": 100, "Level": key.Level, "Name": classes[key.JobID].Name, "Width": 100 });
					} else if (key.Level != 0) {
						characterInfoTemplateData.push({ "Icon": classes[key.JobID].Icon, "ExpLevel": key.ExpLevel, "ExpLevelMax": key.ExpLevelMax, "Level": key.Level, "Name": classes[key.JobID].Name, "Width": key.ExpLevel / key.ExpLevelMax * 100 });
					}
			 });
			 console.log(characterInfoTemplateData);
			 $(i.target).html(characterInfoTemplate(characterInfoTemplateData));
		});
	})
})