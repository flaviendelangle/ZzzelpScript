function ZzzelpScriptRC(pseudo) {

	var that = this;

	if(pseudo) {
		this.pseudo = pseudo;
	}
	else {
		pseudo = gpseudo;
	}

	this.lieux = new Array('Terrain de Chasse', 'fourmilière', 'Loge Impériale');

	this.lignes_combat = new Array(
		/*
			SPECIFIQUE ATT
		*/
		{
			role : 'att',
			regexp : '(([ 0-9]{2})\\/([ 0-9]{2})\\/([ 0-9]{2})( à | )([ 0-9]{2})(h|:)([ 0-9]{2})|)(([ 	]+)|)(<strong>|)Vous attaquez (la|le) ([^<:]+) de (<a href="Membre.php\\?Pseudo=(.*)">|)(.*)(<\\/a><\\/strong>|)',
			action : function(valeurs, ligne, regexp) {
				var resultats = new RegExp(regexp).exec(ligne);
				valeurs.defenseur.pseudo = (typeof resultats[15] != 'undefined') ? resultats[15] : resultats[16];
				valeurs.lieu = that.lieux.indexOf(resultats[13]);
				if(resultats[1] !== '') {
					valeurs.date = ze_Date_to_timestamp_v1(resultats[1]);
				}
				return valeurs;
			}
		},	
		/*
			SPECIFIQUE DEF
		*/
		{
			role : 'def',
			regexp : '(([ 0-9]{2})\\/([ 0-9]{2})\\/([ 0-9]{2})( à | )([ 0-9]{2})(h|:)([ 0-9]{2})|)(([ 	]+)|)(<strong><a href="Membre\\.php\\?Pseudo=([^ ]+)">|)([^ ]+)(<\\/a>|) attaque votre ([^<:]+)(<\\/strong>|)',
			action : function(valeurs, ligne, regexp) {
				var resultats = new RegExp(regexp).exec(ligne);
				console.log(resultats);
				valeurs.attaquant.pseudo = (typeof resultats[12] != 'undefined') ? resultats[12].trim() : resultats[13].trim();
				valeurs.lieu = that.lieux.indexOf(resultats[15].trim());
				if(resultats[1] !== '') {
					valeurs.date = ze_Date_to_timestamp_v1(resultats[1]);
				}
				return valeurs;
			}
		},

		/*
			COMMUN ATTAQUE / DEF
		*/
		{
			role : 'commun',
			regexp : 'Troupes en attaque( |):( |)([^.]+)',
			action : function(valeurs, ligne) {
				valeurs.attaquant.armee = ZzzelpScriptArmee.analyse(ligne);
				return valeurs;
			}
		}, 
		{
			role : 'commun',
			regexp : 'Troupes en défense( |):( |)([^.]+)',
			action : function(valeurs, ligne) {
				valeurs.defenseur.armee = ZzzelpScriptArmee.analyse(ligne);
				return valeurs;
			}
		}, 
		{
			role : 'commun',
			regexp : 'Vous infligez (<strong>|)([ 0-9]+)\\(\\+([ 0-9]+)\\)(<\\/strong>|) dégâts et tuez (<strong>|)([ 0-9]+)(<\\/strong>|) (ennemie|ennemies)',
			action : function(valeurs, ligne, regexp, offensif) {
				var resultats = new RegExp(regexp).exec(ligne);
				valeurs[offensif ? 'defenseur' : 'attaquant'].morts.push(parseInt(resultats[6].replace(/ /g,'')));
				valeurs[offensif ? 'defenseur' : 'attaquant'].total_morts += parseInt(resultats[6].replace(/ /g,''));
				valeurs[offensif ? 'attaquant' : 'defenseur'].degats.push({
					HB : parseInt(resultats[2].replace(/ /g,'')), 
					bonus : parseInt(resultats[3].replace(/ /g,''))
				});	
				return valeurs;					
			}
		}, 
		{
			role : 'commun',
			regexp : 'ennemie inflige (<strong>|)([ 0-9]+)\\(\\+([ 0-9]+)\\)(<\\/strong>|) dégâts à vos fourmis et en tue (<strong>|)([ 0-9]+)(<\\/strong>|)',
			action : function(valeurs, ligne, regexp, offensif) {
				var resultats = new RegExp(regexp).exec(ligne);
				valeurs[offensif ? 'attaquant' : 'defenseur'].morts.push(parseInt(resultats[6].replace(/ /g,'')));
				valeurs[offensif ? 'attaquant' : 'defenseur'].total_morts += parseInt(resultats[6].replace(/ /g,''));
				valeurs[offensif ? 'defenseur' : 'attaquant'].degats.push({
					HB : parseInt(resultats[2].replace(/ /g,'')),
					bonus : parseInt(resultats[3].replace(/ /g,''))
				});	
				return valeurs;			
			}
		}, 
		{
			role : 'commun',
			regexp : '- ([0-9 ]+) (.*) sont devenues des (<strong>|)(.*)(<\\/strong>|)',
			action : function(valeurs, ligne, regexp, offensif) {
				var resultats = new RegExp(regexp).exec(ligne),
					data = { nombre : parseInt(resultats[1].replace(/ /g, '')) }; 
				if(ZzzelpScriptArmee.noms_pluriel.indexOf(resultats[2]) >= 0) {
					data.avant = ZzzelpScriptArmee.noms_pluriel.indexOf(resultats[2]);
				}
				else {
					data.avant = ZzzelpScriptArmee.noms_singulier.indexOf(resultats[2]);
				} 
				if(ZzzelpScriptArmee.noms_pluriel.indexOf(resultats[4]) >= 0) {
					data.apres = ZzzelpScriptArmee.noms_pluriel.indexOf(resultats[4]);
				}
				else {
					data.apres = ZzzelpScriptArmee.noms_singulier.indexOf(resultats[4]);
				}
				valeurs[offensif ? 'attaquant' : 'defenseur'].unites_XP.push(data);	
				return valeurs;					
			}
		}
	);

	this.initValeursRC = function(pseudo, rebellion, offensif) {
		var pseudo_a = ((typeof(pseudo) == 'undefined') ? '' : pseudo),
			pseudo_b = (gpseudo ? gpseudo : '???');
		return {
			mode : 'RC',
			position : (offensif ? 'attaquant' : 'defenseur'),
			attaquant : {
				pseudo : (offensif ? pseudo_b : pseudo_a),
				morts : [],
				total_morts : 0,
				degats : [],
				unites_XP : []
			},
			defenseur : {
				pseudo : (offensif ? pseudo_a : pseudo_b),
				morts : [],
				total_morts : 0,
				degats : [],
				unites_XP : []
			},
			lieu : (rebellion ? 0 : -1),
			rebellion : rebellion
		};
	};

	this.parseCombat = function(lignes, rebellion, pseudo, offensif) {
		var valeurs = that.initValeursRC(pseudo, rebellion, offensif);

		for(var n=0; n<lignes.length ; n++) {
			var ligne = lignes[n];
			for(var i=0; i<that.lignes_combat.length; i++) {
				var l = that.lignes_combat[i];
				if(l.role == 'commun' || (l.role == 'att' && offensif) || (l.role == 'def' && !offensif)) {
					if(ligne.match(l.regexp)) {
						valeurs = l.action(valeurs, ligne, l.regexp, offensif);
					}
				}
			}
		}
		return valeurs;
	};

	this.floodOffensif = function(lignes, element) {
		var r = 'Vos fourmis ont <strong>conquis ([0-9 ]+) cm²<\\/strong> lors de leur dernière bataille\\. Ces terres appartenaient à <a href="Membre\\.php\\?Pseudo=(.*)">(.*)<\\/a>\\.',
			resultats = new RegExp(r).exec(lignes[0]);
		return {
			mode : 'flood',
			position : 'attaquant',
			valeur : parseInt(resultats[1].replace(/ /g, '')),
			pseudo : resultats[2],
			id : element.parentNode.id.replace('message_','')
		};
	};

	this.floodDefensif = function(lignes, element) {
		var r = '<a href="Membre\\.php\\?Pseudo=(.*)">(.*)<\\/a> vous a pris ([0-9 ]+) cm² lors de sa dernière attaque\\.',
			resultats = new RegExp(r).exec(lignes[0]);
		return {
			mode : 'flood',
			position : 'defenseur',
			valeur : parseInt(resultats[3].replace(/ /g, '')),
			pseudo : resultats[1],
			id : element.parentNode.id.replace('message_','')
		};
	};


	this.analyse = function(valeurs) {
		console.log(valeurs);

		// Niveaux attaquant
		valeurs.attaquant.armee.computeArmes(valeurs.attaquant.degats[0]);
		if(valeurs.attaquant.degats.length > 1 || !valeurs.attaquant.armee.isDead(valeurs.attaquant.total_morts)) {
			valeurs.attaquant.armee.computeNiveauxVie(valeurs.attaquant.morts[0], valeurs.defenseur.degats[0]);
		}

		// Niveaux défenseur
		valeurs.defenseur.armee.setLieu(valeurs.lieu);
		valeurs.defenseur.armee.computeArmes(valeurs.defenseur.degats[0]);
		if(valeurs.defenseur.degats.length > 1 || !valeurs.defenseur.armee.isDead(valeurs.defenseur.total_morts)) {
			valeurs.defenseur.armee.computeNiveauxVie(valeurs.defenseur.morts[0], valeurs.attaquant.degats[0]);
		}

		// Armées après le combat
		valeurs.attaquant.armee_apres = valeurs.attaquant.armee.armeePostCombat(valeurs.attaquant.total_morts);
		valeurs.attaquant.armee_XP = valeurs.attaquant.armee_apres.applyXP(valeurs.attaquant.unites_XP);
		valeurs.defenseur.armee_apres = valeurs.defenseur.armee.armeePostCombat(valeurs.defenseur.total_morts);
		valeurs.defenseur.armee_XP = valeurs.defenseur.armee_apres.applyXP(valeurs.defenseur.unites_XP);

		//Stockage des statistiques
		valeurs.attaquant.armee.logStatistiques();
		valeurs.attaquant.armee_apres.logStatistiques();
		valeurs.attaquant.armee_XP.logStatistiques();
		valeurs.defenseur.armee.logStatistiques();
		valeurs.defenseur.armee_apres.logStatistiques();
		valeurs.defenseur.armee_XP.logStatistiques();

		valeurs.attaquant.HOF = valeurs.attaquant.armee.statistiques.HOF - valeurs.attaquant.armee_apres.statistiques.HOF;
		valeurs.defenseur.HOF = valeurs.defenseur.armee.statistiques.HOF - valeurs.defenseur.armee_apres.statistiques.HOF;
		valeurs.HOF = valeurs.attaquant.HOF + valeurs.defenseur.HOF;

		return valeurs;
	};



	/*
		MESSAGERIE FOURMIZZZ
	*/

	this.messagerie = function(id, titre, RCs, dates) {
		var zones = that.initMessagerie(id);
		for(var i=0; i<RCs.length; i++) {
			var RC = RCs[i].innerHTML.split('<br>'),
				valeurs = that.parseRCMessagerie(RC, titre, RCs, i);
			if(valeurs && valeurs.mode == 'RC') {
				valeurs.date = ze_Date_to_timestamp_v1(dates[i].innerHTML);
				valeurs = that.analyse(valeurs);
				that.createZoneMessagerie(zones.zone, RC, valeurs);
				if(ZzzelpScript.parameters('parametres', ['synchronisation', 'synchro_RC'])) {
					ze_Envoi_RC_Zzzelp(RC, valeurs, 1, (i==RCs.length-1));
				}
			}
			else if(valeurs && valeurs.mode == 'flood' && ZzzelpScript.parameters('parametres', ['synchronisation', 'synchro_RC'])) {
				valeurs.date = ze_Date_to_timestamp_v1(dates[i].innerHTML);
				ze_Envoi_RC_Zzzelp(RC, valeurs, 1, (i==RCs.length-1));
			}
		}
		if(zones.zone.innerHTML.length === 0) {
			console.log('ZzzelpScript : Aucune analyse à faire');
			ze_Supprimer_element(zones.bouton);
		}
	};

	this.initMessagerie = function(id) {
		var table = document.querySelector('#table_liste_conversations'),
			zone = document.createElement('div'),
			entete = document.createElement('div'),
			bouton = document.createElement('div');
		bouton.setAttribute('class', 'bouton_analyse');
		bouton.innerHTML = 'Afficher les analyses';
		bouton.onclick = function onclick(event) {
			zone.style.display = (zone.style.display === '' ? 'none' : '');
		};
		entete.appendChild(bouton);
		var style = 'margin:50px 0;text-align:center;font-family:Consolas,Monaco,Lucida Console,';
		style += 'Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;font-size:0.9em;display:none';
		zone.setAttribute('style', style);
		table.rows[document.querySelector('#' + id).rowIndex + 2].querySelector('tr[id*="reactions_"] td').appendChild(entete);
		table.rows[document.querySelector('#' + id).rowIndex + 2].querySelector('tr[id*="reactions_"] td').appendChild(zone);
		return { zone : zone, bouton : bouton };
	};

	this.parseRCMessagerie = function(RC, titre, RCs, i) {
		var valeurs, pseudo;
		//RC
		if(~RC[0].indexOf('attaque votre')) {
			valeurs = this.parseCombat(RC, false, undefined, false);
		}
		else if(~RC[0].indexOf('attaquez')) {
			valeurs = this.parseCombat(RC, false, undefined, true);
		}
		//Rebellions
		else if(~RC[RC.length-1].indexOf('Il vous aura pillé')) {
			pseudo = new RegExp('Rebellion (échouée|réussie) contre ([^ ]+)').exec(titre)[2];
			valeurs = this.parseCombat(RC, true, pseudo, true);
		}
		else if(~RC[RC.length-1].indexOf('Elle vous a rapporté')) {
			if(~titre.indexOf('Colonie libérée')) {
				pseudo = new RegExp('Colonie libérée chez ([^ ]+)').exec(titre)[1];
			}
			else {
				pseudo = new RegExp('Indépendance de ([^ ]+)').exec(titre)[1];
				valeurs = this.parseCombat(RC, true, pseudo, false);
			}
		}
		//Floods
		else if(~RC[0].indexOf('lors de leur dernière bataille')) {
			valeurs = that.floodOffensif(RC, RCs[i]);
		}
		else if(~RC[0].indexOf('lors de sa dernière attaque')) {
			valeurs = that.floodDefensif(RC, RCs[i]);
		}
		return valeurs;
	};

	this.createZoneMessagerie = function(zone, RC, valeurs) {
		var lignes = new ZzzelpScriptAnalyseTextuelle('combat', valeurs, ze_serveur).getContent();
		
		var resultat_HTML = '',
			resultat_BBCode_FE = '',
			resultat_BBCode_FI = '';
			
		for(var n=0; n<lignes.length; n++) {
			resultat_HTML += '|' + lignes[n].HTML + '|<br>';
			resultat_BBCode_FE += lignes[n].BBCode_FE;
			resultat_BBCode_FI += '|' + lignes[n].BBCode_FI + '|\n';
		}

		var raccourci_FE = document.createElement('div'),
			raccourci_FI = document.createElement('div'),
			zone_RC = document.createElement('div'),
			contenu_FE = document.createElement('textarea'),
			contenu_FI = document.createElement('textarea');
			
		raccourci_FE.innerHTML = 'Copier sur un forum externe';
		raccourci_FI.innerHTML = 'Copier sur un forum Fourmizzz';
		contenu_FE.value = ze_HTML_to_BBcode(RC.join('\n')) + '\n\n[center][table]\n' + resultat_BBCode_FE + '[/table][/center]';
		contenu_FI.value = ze_HTML_to_BBcode(RC.join('\n')) + '\n\n\n[center][code]\n' + resultat_BBCode_FI + '\n[/code][/center]';
		raccourci_FE.setAttribute('style', 'text-align:center;font-weight:bold;margin:15px 0;cursor:pointer;');
		raccourci_FI.setAttribute('style', 'text-align:center;font-weight:bold;margin:15px 0;cursor:pointer;');
		contenu_FE.setAttribute('style', ' width: 80%;height: 150px;margin: 25px 0;display:none;');
		contenu_FI.setAttribute('style', ' width: 80%;height: 150px;margin: 25px 0;display:none;');
		zone_RC.setAttribute('style', 'margin-top:50px;');
		
		zone_RC.setAttribute('class', 'zzzelp_analyse_RC');
		zone_RC.innerHTML = resultat_HTML;
		
		raccourci_FE.onclick = function onclick(event) {
			contenu_FE.style.display = (contenu_FE.style.display === '' ? 'none' : '');
		};
		raccourci_FI.onclick = function onclick(event) {
			contenu_FI.style.display = (contenu_FI.style.display === '' ? 'none' : '');
		};
		
		zone.appendChild(zone_RC);
		zone.appendChild(raccourci_FE);
		zone.appendChild(contenu_FE);	
		zone.appendChild(raccourci_FI);
		zone.appendChild(contenu_FI);
	};








	/*
		ANALYSEUR DE GUERRE
	*/

	this.HOF = function(combats, guerre) {
		var RCs = that.splitRCs(combats),
			donnees = [], valeurs;
		for(var i=0; i<RCs.length; i++) {
			if(~RCs[i].join('\n').indexOf('attaque votre')) {
				valeurs = this.parseCombat(RCs[i], false, undefined, false);
			}
			else if(~RCs[i].join('\n').indexOf('attaquez')) {
				valeurs = this.parseCombat(RCs[i], false, undefined, true);
			}
			if(valeurs && valeurs.mode == 'RC') {
				valeurs = that.analyse(valeurs);
				donnees.push({
					zone : new ZzzelpScriptZoneHOF(RCs[i], valeurs, true, guerre).getZone(),
					valeurs : valeurs
				});
			}
		}
		return donnees;
	};

	that.splitRCs = function(combats) {
		console.log(combats);
		if(combats.match('([ 0-9]{2})\/([ 0-9]{2})\/([ 0-9]{2})\n([ 0-9]{2})(h|:)([ 0-9]{2})')) {
			combats = combats.replace(/([ 0-9]{2})\/([ 0-9]{2})\/([ 0-9]{2})\n([ 0-9]{2})(h|:)([ 0-9]{2})/i, '$2\/$3/$4 $5:$7');
		}
		var lignes_types = new Array(
			new RegExp('Vous attaquez (la|le) (.*) de (.*)'),
			new RegExp('(.*) attaque votre (.*) : '),
			new RegExp('Troupes en attaque( |):( |)([^.]+)'),
			new RegExp('Troupes en défense( |):( |)([^.]+)')
			),
			index = -1,
			RCs = new Array([]);
		combats = combats.replace(/<br>/g, '\n').split('\n');
		console.log(combats);
		for(var i=0; i<combats.length; i++) {
			for(var j=0; j<lignes_types.length; j++) {
				if(combats[i].match(lignes_types[j])) {
					if(j <= index) {
						RCs.push([]);
					}
					index = j;
					break;
				}
			}
			if(combats[i].trim() !== '' || (i > 0 && combats[i-1].trim() !== '')) {
				RCs[RCs.length-1].push(combats[i]);
			}
		}
		return RCs;
	};

	this.prepareZoneHOF = function(analyse, RC) {
		analyse.attaquant.armee = new ZzzelpScriptArmee(analyse.attaquant.armee.unites, analyse.attaquant.armee.niveaux);
		analyse.attaquant.armee_apres = new ZzzelpScriptArmee(analyse.attaquant.armee_apres.unites, analyse.attaquant.armee_apres.niveaux);
		analyse.attaquant.armee_XP = new ZzzelpScriptArmee(analyse.attaquant.armee_XP.unites, analyse.attaquant.armee_XP.niveaux);
		analyse.defenseur.armee = new ZzzelpScriptArmee(analyse.defenseur.armee.unites, analyse.defenseur.armee.niveaux);
		analyse.defenseur.armee_apres = new ZzzelpScriptArmee(analyse.defenseur.armee_apres.unites, analyse.defenseur.armee_apres.niveaux);
		analyse.defenseur.armee_XP = new ZzzelpScriptArmee(analyse.defenseur.armee_XP.unites, analyse.defenseur.armee_XP.niveaux);

		return new ZzzelpScriptZoneHOF(RC.split('<br>'), analyse, false, true, document).getZone();
	};

}