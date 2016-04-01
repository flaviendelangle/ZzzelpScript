function ZzzelpScriptAnalyseTextuelle(mode, valeurs, serveur) {

	var that = this;

	this.content = [];
	this.valeurs = valeurs;
	this.serveur = serveur;
	this.mode = mode;
	this.lieux_court = new Array('TDC', 'Dôme', 'Loge');

	this.main = function() {
		if(that.mode == 'combat') {
			that.mainCombat();
		}
		else if(that.mode == 'chasse') {
			that.mainChasse();
		}
	};

	/*
		Chasse
	*/

	this.mainChasse = function() {
		that.createEnteteChasse();
		that.createArmeeChasse();
		that.createStatistiquesChasse();
		that.createDetailsChasse();
	};

	this.createEnteteChasse = function() {
		that.separationLigne();
		that.createLigne(['<strong>TDC chassé</strong>', '<strong>:</strong>', '<strong>' + ze_Nombre(that.valeurs.TDC_chasse) + '</strong>']);
		that.createLigne(['<strong>Nourriture récoltée</strong>', '<strong>:</strong>', '<strong>' + ze_Nombre(that.valeurs.nourriture) + '</strong>']);
		that.createLigne(['<strong>Unités perdues</strong>', '<strong>:</strong>', '<strong>' + ze_Nombre(that.valeurs.attaquant.total_morts) + '</strong>']);
		that.separationLigne();
		that.createLigne(['<strong>Avant</strong>', '<strong>Après</strong>']);
		that.separationLigne();
	};

	this.createArmeeChasse = function() {
		that.createLigne(['<strong>Armées</strong>']);
		that.separationLigne();
		var ecart;
		for(var i=0;i<14;i++) {
			var nom = ZzzelpScriptArmee.noms_pluriel[i],
				valeur_avant = that.valeurs.attaquant.armee.getUnite(i),
				valeur_apres = that.valeurs.attaquant.armee_XP.getUnite(i);
			if(~[0,1,3,4,5,7,10,12].indexOf(i) && valeur_avant > 0) {
				ecart = '<strong>' + ze_Affichage_pourcentage(1+that.valeurs.attaquant.unites_XP[i]/valeur_avant, 3).toString().replace('+', '') + '% XP</strong>';
			}
			else {
				ecart = '';
			}

			that.createLigne([ze_Nombre(valeur_avant), nom, ze_Nombre(valeur_apres), ecart]);
		}
		that.separationLigne();		
	};

	this.createStatistiquesChasse = function() {
		that.createLigne(['<strong>Statistiques</strong>']);
		that.separationLigne();

		var attaque_avant = that.valeurs.attaquant.armee.getAttaqueAB(),
			attaque_apres = that.valeurs.attaquant.armee_XP.getAttaqueAB(),
			ecart_attaque = '<strong>(' + ze_Nombre_raccourci(attaque_apres-attaque_avant, 3) + ')</strong>';
		that.createLigne([ze_Nombre(attaque_avant), 'Attaque', ze_Nombre(attaque_apres), ecart_attaque]);

		var defense_avant = that.valeurs.attaquant.armee.getDefenseAB(),
			defense_apres = that.valeurs.attaquant.armee_XP.getDefenseAB(),
			ecart_defense = '<strong>(' + ze_Nombre_raccourci(defense_apres-defense_avant, 3) + ')</strong>';
		that.createLigne([ze_Nombre(defense_avant), 'Défense', ze_Nombre(defense_apres), ecart_defense]);

		var vie_avant = that.valeurs.attaquant.armee.getVieAB(),
			vie_apres = that.valeurs.attaquant.armee_XP.getVieAB(),
			ecart_vie = '<strong>(' + ze_Nombre_raccourci(vie_apres-vie_avant, 3) + ')</strong>';
		that.createLigne([ze_Nombre(vie_avant), 'Vie', ze_Nombre(vie_apres), ecart_vie]);

		var capa_flood_avant = that.valeurs.attaquant.armee.getCapaFlood(),
			capa_flood_apres = that.valeurs.attaquant.armee_XP.getCapaFlood(),
			ecart_capa_flood = '<strong>(' + ze_Nombre_raccourci(capa_flood_apres-capa_flood_avant, 3) + ')</strong>';
		that.createLigne([ze_Nombre(capa_flood_avant), 'Vie', ze_Nombre(capa_flood_apres), ecart_capa_flood]);

		that.separationLigne();
	};

	this.createDetailsChasse = function() {
		that.createLigne(['<strong>Détail des chasses</strong>']);
		that.separationLigne();
		that.createLigne(['<strong>TDC chassé</strong>', '<strong>Nourriture</strong>', '<strong>Morts</strong>', '<strong>Répl</strong>']);
		that.emptyLigne();
		for(var i=0; i<that.valeurs.details.length; i++) {
			var chasse = that.valeurs.details[i],
				TDC_chasse = ze_Nombre(chasse.valeurs.TDC_chasse),
				nourriture =  ze_Nombre(chasse.valeurs.nourriture),
				morts = ze_Nombre(chasse.valeurs.attaquant.total_morts),
				replique = (chasse.valeurs.replique*100);
			replique = (replique > 10) ? ('<strong>' + replique + '</strong>%') : (replique + '%');

			that.createLigne([TDC_chasse, nourriture, morts, replique]);
		}
		that.separationLigne();
	};


	/*
		Combat
	*/

	this.mainCombat = function() {
		that.createEnteteRC();
		that.createArmeeRC();
		that.createStatistiquesRC();
		that.createNiveauxRC();
		that.createXP();
	};

	this.getContent = function() {
		return that.content;
	};

	this.createEnteteRC = function() {
		var attaquant = (typeof this.serveur == 'undefined') ? that.valeurs.attaquant.pseudo : ze_Lien_profil(that.valeurs.attaquant.pseudo, serveur),
			defenseur = (typeof this.serveur == 'undefined') ? that.valeurs.defenseur.pseudo : ze_Lien_profil(that.valeurs.defenseur.pseudo, serveur);
		if(typeof valeurs.date != 'undefined') {
			that.separationLigne();
			that.createLigne([ze_Generation_date_v1(valeurs.date)]);
		}
		that.separationLigne();
		that.createLigne(['<strong>' + attaquant + '</strong>',  '<strong>' + defenseur + '</strong>']);
		that.separationLigne();
	};

	this.createArmeeRC = function() {
		that.createLigne(['<strong>Armée</strong>']);
		that.separationLigne();
		for(var i=0;i<14;i++) {
			var nom = ZzzelpScriptArmee.noms_pluriel[i],
				valeur_att = ze_Nombre(that.valeurs.attaquant.armee.getUnite(i)),
				valeur_def = ze_Nombre(that.valeurs.defenseur.armee.getUnite(i));
			that.createLigne([valeur_att, nom, valeur_def]);
		}
		that.separationLigne();
	};

	this.createStatistiquesRC = function() {
		var att_avant = that.valeurs.attaquant.armee.getStatistiquesAB(),
			att_apres = that.valeurs.attaquant.armee_XP.getStatistiquesAB(),
			def_avant = that.valeurs.defenseur.armee.getStatistiquesAB(),
			def_apres = that.valeurs.defenseur.armee_XP.getStatistiquesAB();

		var att_attaque = ' (' + ze_Affichage_pourcentage(att_apres.attaque/att_avant.attaque) + '%)',
			def_attaque = '(' + ze_Affichage_pourcentage(def_apres.attaque/def_avant.attaque) + '%) ',
			att_defense = ' (' + ze_Affichage_pourcentage(att_apres.defense/att_avant.defense) + '%)',
			def_defense = '(' + ze_Affichage_pourcentage(def_apres.defense/def_avant.defense) + '%) ',
			att_vie = ' (' + ze_Affichage_pourcentage(att_apres.vie/att_avant.vie) + '%)',
			def_vie = '(' + ze_Affichage_pourcentage(def_apres.vie/def_avant.vie) + '%) ';

		var pertes_att = att_avant.HOF - that.valeurs.attaquant.armee_apres.getHOF(),
			pertes_def = def_avant.HOF - that.valeurs.defenseur.armee_apres.getHOF();

		that.createLigne(['<strong>Statistiques</strong>']);
		that.separationLigne();
		that.createLigne([ze_Nombre(that.valeurs.attaquant.total_morts),'Morts',ze_Nombre(that.valeurs.defenseur.total_morts)]);
		that.separationLigne();
		that.createLigne([ze_Nombre(att_avant.attaque), 'Attaque (avant)', ze_Nombre(def_avant.attaque)]);
		that.createLigne([ze_Nombre(att_avant.defense), 'Défense (avant)', ze_Nombre(def_avant.defense)]);
		that.createLigne([ze_Nombre(att_avant.vie), 'Vie (avant)', ze_Nombre(def_avant.vie)]);
		that.separationLigne();
		that.createLigne([ze_Nombre(att_apres.attaque) + att_attaque, 'Attaque (après)', def_attaque + ze_Nombre(def_apres.attaque)]);
		that.createLigne([ze_Nombre(att_apres.defense) + att_defense, 'Défense (après)', def_defense + ze_Nombre(def_apres.defense)]);
		that.createLigne([ze_Nombre(att_apres.vie) + att_vie, 'Vie (après)', def_vie + ze_Nombre(def_apres.vie)]);
		that.separationLigne();
		
		that.createLigne(['<strong>Hall of Fame</strong>']);
		that.separationLigne();
		that.createLigne([ze_Secondes_date(pertes_att),'',ze_Secondes_date(pertes_def)]);
		that.createLigne([ze_Secondes_date(pertes_att + pertes_def)]);
		that.separationLigne();
	};

	this.createNiveauxRC = function() {
		that.createLigne(['<strong>Niveaux</strong>']);
		that.separationLigne();
		that.createLigne([that.valeurs.attaquant.armee.getArmes(), 'Armes', that.valeurs.defenseur.armee.getArmes()]);
		that.createLigne([that.valeurs.attaquant.armee.getBouclier(), 'Bouclier', that.valeurs.defenseur.armee.getBouclier()]);
		that.createLigne([that.valeurs.attaquant.armee.getNiveauLieu(), that.lieux_court[that.valeurs.lieu], that.valeurs.defenseur.armee.getNiveauLieu()]);
		that.separationLigne();
	};

	this.createXP = function() {
		if(that.valeurs.attaquant.unites_XP.length > 0 || that.valeurs.defenseur.unites_XP.length > 0) {
			that.createLigne(['<font color="#088A4B"><strong>XP prise en compte</strong></font>']);
		}
		else {
			that.createLigne(['<font color="#FF0000"><strong>XP non prise en compte</strong></font>']);
		}
		that.separationLigne();
	};

	this.separationLigne = function() {
		that.pushLine({ HTML : str_repeat('-', 94), BBCode_FE : '[tr][td colspan="4"][hr][/td][/tr]', BBCode_FI : str_repeat('-', 94) });
	};

	this.emptyLigne = function() {
		that.pushLine({ HTML : str_repeat('&nbsp', 94), BBCode_FE : '', BBCode_FI : str_repeat(' ', 94) });
	};

	this.pushLine = function(line) {
		that.content.push(line);
	};

	this.createLigne = function(d) {
		var functions = new Array(that.createLigneOne, that.createLigneTwo, that.createLigneThree, that.createLigneFour),
			data = functions[d.length-1](d);
		data.HTML = '&nbsp&nbsp' + data.HTML + '&nbsp&nbsp';
		data.BBCode_FI = '  ' + data.BBCode_FI + '  ';
		data.BBCode_FE = '[tr]' + data.BBCode_FE + '[/tr]';
		that.pushLine(data);
	};

	this.createLigneOne = function(d) {
		var n1 = ze_Nettoyage_HTML(d[0]),
			s1 = Math.floor((90-n1.length))/2,
			s2 = Math.ceil((90-n1.length)/2);
		return {
			HTML : str_repeat('&nbsp', s1) + d[0] + str_repeat('&nbsp', s2),
			BBCode_FI : str_repeat(' ', s1) + ze_HTML_to_BBcode(d[0]) + str_repeat(' ', s2),
			BBCode_FE : '[td colspan="4"][center]' + ze_HTML_to_BBcode(d[0], false) + '[/center][/td]'
		};

	};

	this.createLigneTwo = function(d) {
		var n1 = ze_Nettoyage_HTML(d[0]),
			n2 = ze_Nettoyage_HTML(d[1]),
			s1 = Math.ceil((45-n1.length)/2),
			s2 = Math.floor((45 - n1.length)/2) + Math.floor((45 - n2.length)/2),
			s3 = Math.ceil((45-n2.length)/2);
		var BBCode_FE = '[td][center]' + ze_HTML_to_BBcode(d[0], false) + '[/center][/td][td][/td]';
		BBCode_FE += '[td colspan="2"][center]' + ze_HTML_to_BBcode(d[1], false) + '[/center][/td]';

		return {
			HTML : str_repeat('&nbsp', s1) + d[0] + str_repeat('&nbsp', s2) + d[1] + str_repeat('&nbsp', s3),
			BBCode_FI : str_repeat(' ', s1) + ze_HTML_to_BBcode(d[0]) + str_repeat(' ', s2) + ze_HTML_to_BBcode(d[1]) + str_repeat(' ', s3),
			BBCode_FE : BBCode_FE
		};
	};		

	this.createLigneThree = function(d) {
		var n1 = ze_Nettoyage_HTML(d[0]),
			n2 = ze_Nettoyage_HTML(d[1]),
			n3 = ze_Nettoyage_HTML(d[2]),
			s1 = Math.ceil((30-n1.length)/2) + Math.floor((30-n1.length)/2) + Math.floor((30-n2.length)/2),
			s2 = Math.ceil((30-n2.length)/2) + Math.floor((30-n3.length)/2) + Math.ceil((30-n3.length)/2);
		
		var BBCode_FE = '[td][left]' + ze_HTML_to_BBcode(d[0], false) + '[/left][/td][td][center]';
		BBCode_FE += ze_HTML_to_BBcode(d[1], false) + '[/center][/td][td colspan="2"][right]' + ze_HTML_to_BBcode(d[2], false) + '[/right][/td]';

		return {
			HTML : d[0] + str_repeat('&nbsp', s1) + d[1] + str_repeat('&nbsp', s2) + d[2],
			BBCode_FI : ze_HTML_to_BBcode(d[0]) + str_repeat(' ', s1) + ze_HTML_to_BBcode(d[1]) + str_repeat(' ', s2) + ze_HTML_to_BBcode(d[2]),
			BBCode_FE : BBCode_FE
		};
	};

	this.createLigneFour = function(d) {
		var n1 = ze_Nettoyage_HTML(d[0]),
			n2 = ze_Nettoyage_HTML(d[1]),
			n3 = ze_Nettoyage_HTML(d[2]),
			n4 = ze_Nettoyage_HTML(d[3]),
			s1 = Math.ceil((26-n1.length)/2) + Math.floor((26-n1.length)/2) + Math.floor((26-n2.length)/2),
			s2 = Math.ceil((26-n2.length)/2) + Math.floor((26-n3.length)/2) + Math.ceil((26-n3.length)/2),
			s3 = 10-n4.length;

		var BBCode_FI = ze_HTML_to_BBcode(d[0]) + str_repeat(' ', s1) + ze_HTML_to_BBcode(d[1]) + str_repeat(' ', s2);
		BBCode_FI += ze_HTML_to_BBcode(d[2]) + str_repeat(' ', s3) + ze_HTML_to_BBcode(d[3]) + str_repeat(' ', 2);

		var BBCode_FE = '[td][left]' + ze_HTML_to_BBcode(d[0], false) + '[/left][/td][td][center]' + ze_HTML_to_BBcode(d[1], false);
		BBCode_FE += '[/center][/td][td][right]' + ze_HTML_to_BBcode(d[2], false) + '[/right][/td][td]' + ze_HTML_to_BBcode(d[3]) + '[/td]';

		return {
			HTML : d[0] + str_repeat('&nbsp', s1) + d[1] + str_repeat('&nbsp', s2) + d[2] + str_repeat('&nbsp', s3) + d[3] + str_repeat('&nbsp', 2),
			BBCode_FI : BBCode_FI,
			BBCode_FE : BBCode_FE
		};
	};

	this.main();
}
