function ZzzelpScriptChaine(zone_page) {


	var that = this;

	this.roles = new Array(
		{ role : 'grenier', regexp : '(convoyeur|grenier|gr)(\\s|)(.*)', place : 3 },
		{ role : 'passeur', regexp : '(passeur|inter|p|finisseur)(\s|)(.*)', place : 3 },
		{ role : 'chasseur', regexp : '(chasseur)', place : 0 }	
	);

	this.init = function(zone_page) {
		if(typeof zone_page == 'undefined') {
			this.zone_page = document;
		}
		else {
			this.zone_page = zone_page;
		}
	};

	this.retrieve = function(lieu, mode) {
		var date_maj = localStorage.getItem('zzzelp_MAJ_rangs_' + ze_serveur),
			rangs = localStorage.getItem('zzzelp_rangs_' + ze_serveur);
		if ((time_fzzz() - date_maj) < 1800  && date_maj && rangs && mode === 0) {
			rangs = JSON.parse(rangs);
			var alliance = (lieu === 0) ? galliance : ze_Analyser_URL('alliance');
			that.show(rangs, lieu, alliance, that.zone_page);
		}
		else {
			localStorage.setItem('zzzelp_MAJ_rangs_' + ze_serveur, time_fzzz());
			new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'rangs_script?alliance=' + galliance + '&', force : mode },
				{ success : function(valeurs) {
					localStorage.setItem('zzzelp_rangs_' + ze_serveur, JSON.stringify(valeurs));
					var alliance =  (lieu === 0) ? galliance : ze_Analyser_URL('alliance');
					that.show(valeurs, lieu, alliance, that.zone_page);
					if(mode == 1) {
						ze_Inserer_message("Actualisation des rangs réussie", 3000);
					}
				}, authentication_issue : function() {
					that.retrieve(lieu, 2);
				}
			});
		}
	};

	this.show = function(rangs, lieu, alliance, zone) {
		if(zone.querySelector('#tabMembresAlliance') === null) {
			setTimeout(function(){
				that.show(rangs, lieu, alliance, zone);
			}, 50);
		}
		else {
			var i, n, t;
			if (ZzzelpScript.parameters('parametres', ['alliance', 'ally_rangs']) || ZzzelpScript.parameters('parametres', ['alliance', 'ally_couleurs'])) {
				console.log('ZzzelpScript : Début placement rangs');
				var l = (lieu === 0) ? [2,3] : [1,2],
					tableau = zone.querySelector('#tabMembresAlliance'),
					lignes = tableau.rows,
					rangs_actuels = {},
					tooltips = '';
				for(i=0; i<rangs.length; i++) {
					rangs[i].alliances = (rangs[i].alliances == "*") ? null : rangs[i].alliances.replace(/ /g, '').split(',');
					if(rangs[i].mode < 2) {
						rangs[i].regle = rangs[i].regle.replace(/ /g, '').split(',');
					}
				}
				for(i=1; i<lignes.length; i++) {
					lignes[i].dataset.rang_zzzelp = 0;
					var pseudo = lignes[i].cells[l[1]].querySelector('a').innerHTML,
						rang = lignes[i].cells[l[0]].innerHTML;
					lignes[i].cells[l[0]].dataset.rangFzzz = rang;
					that.applyRankUsername(rangs, rang, alliance, lignes[i], l, pseudo);
					that.applyRankAlliance(rangs, rang, alliance, lignes[i], l);
					that.applyRankRegExp(rangs, rang, alliance, lignes[i], l);
					that.applyRankContent(rangs, rang, alliance, lignes[i], l);
				}
			}
			if(lieu === 0) {
				that.rankLimitationInterface(true);
			}
		}
	};

	this.applyRankUsername = function(rangs, rang, alliance, ligne, l, pseudo) {
		for(n=0; n<rangs.length; n++) {
			if(rangs[n].alliances === null || ~rangs[n].alliances.indexOf(alliance)) {
				if(rangs[n].mode === '0' && in_array(pseudo, rangs[n].regle)) {
					that.applyRank(ligne, rangs[n].rang_affiche, rangs[n].couleur, rangs[n].role, l);
				}
			}
		}
	};

	this.applyRankAlliance = function(rangs, rang, alliance, ligne, l) {
		for(n=0; n<rangs.length; n++) {
			if(rangs[n].alliances === null || ~rangs[n].alliances.indexOf(alliance)) {
				if(rangs[n].mode == '1' && in_array(alliance, rangs[n].regle)) {
					that.applyRank(ligne, rangs[n].rang_affiche, rangs[n].couleur, rangs[n].role, l);
				}
			}
		}		
	};

	this.applyRankRegExp = function(rangs, rang, alliance, ligne, l) {
		for(n=0; n<rangs.length; n++) {
			if(rangs[n].alliances === null || ~rangs[n].alliances.indexOf(alliance)) {
				if(rangs[n].mode == '2' && rang.match(rangs[n].regle)) {
					var rep = new RegExp(rangs[n].regle).exec(rang);
					var resultat = rangs[n].rang_affiche;
					for(t=1;t<rep.length; t++) {
						resultat = resultat.replace('$' + (t), rep[t]);
					}
					that.applyRank(ligne, resultat, rangs[n].couleur, rangs[n].role, l);					
				}
			}
		}		
	};

	this.applyRankContent = function(rangs, rang, alliance, ligne, l) {
		for(n=0; n<rangs.length; n++) {
			if(rangs[n].alliances === null || ~rangs[n].alliances.indexOf(alliance)) {
				if(rangs[n].mode == '3' && ~rang.indexOf(rangs[n].regle)) {
					that.applyRank(ligne, rangs[n].rang_affiche, rangs[n].couleur, rangs[n].role, l);
				}
			}
		}		
	};

	this.applyRank = function(ligne, valeur, couleur, role, l) {
		if(ligne.dataset.rang_zzzelp != 1) {
			ligne.dataset.role = role;
			if(ZzzelpScript.parameters('parametres', ['alliance', 'ally_rangs'])) {
				ligne.cells[l[0]].innerHTML = valeur;
				ligne.cells[l[0]].setAttribute('title', ligne.cells[l[0]].dataset.rangFzzz);
			}
			if(ZzzelpScript.parameters('parametres', ['alliance', 'ally_couleurs'])) {
				ligne.style.background = '#' + couleur;
			}
		}
		ligne.dataset.rang_zzzelp = 1;
	};

	this.getChaine = function(zone) {
		var roles = {
			grenier : [],
			passeur : [],
			chasseur : []
		};
		for(var role in roles) {
			var joueurs = zone.querySelectorAll('tr[data-role*="' + role + '"]');
			for(var i=0; i<joueurs.length; i++) {
				roles[role].push({
					pseudo : joueurs[i].cells[2].querySelector('a').innerHTML,
					rang : joueurs[i].cells[1].innerHTML,
					TDC : parseInt(joueurs[i].cells[4].innerHTML.replace(/ /g, ''))
				});
			}
		}
		return roles;
	};


	/*
		Gère l'interface permettant d'afficher ou non certains rôles de la chaîne
	*/

	this.rankLimitationInterface = function() {
		if(document.querySelector('img[src*="1rondvert.gif"]') === null) {
			setTimeout(function(){
				that.rankLimitationInterface();
			},25);
		}
		else if(document.querySelectorAll('[data-rang_zzzelp="1"]').length === 0) {
			setTimeout(function(){
				that.rankLimitationInterface();
			},100);
		}
		else {
			var roles = {
					grenier : 'Greniers',
					passeur : 'Passeurs',
					chasseur : 'Chasseurs', 
					allie : 'Alliés',
					hors_chaine : 'Hors Chaines'
				},
				tableau = document.querySelector('img[src*="1rondvert.gif"]').parentNode.parentNode.parentNode,
				n = 0;
			var ligne;
			for(var role in roles) {
				if(n%2 === 0) {
					ligne = document.createElement('tr');
					tableau.appendChild(ligne);
				}
				var cell1 = ligne.insertCell(-1),
					cell2 = ligne.insertCell(-1),
					input = document.createElement('input');
				input.type = 'checkbox';
				input.id = 'affichage_' + role;
				input.checked = that.isRoleChecked(role);
				input.onclick = function onclick(event) {
					that.hideUselessRanks(roles);
				};
				cell1.appendChild(input);
				cell2.innerHTML = roles[role];
				n++;
			}
			ze_Supprimer_element(document.querySelector('#alliance .simulateur h2'));
			ligne = document.querySelector('#alliance .simulateur').insertRow(0);
			var	cell = ligne.insertCell(0);
			cell.setAttribute('colspan', '10');
			cell.setAttribute('style', 'margin-top:20px;text-align:center;cursor:pointer;font-weight:bold;font-style:italic');
			cell.innerHTML = 'Actualiser les rangs';
			cell.onclick = function onclick(event) {
				ze_Importation_rang(0,true);
			};
			
			var zone = document.createElement('div'),
				table = document.createElement('table');
			ligne = table.insertRow(0);
			table.setAttribute('style', 'margin:20px auto');
			table.setAttribute('class', 'simulateur');
			ligne.insertCell(0).innerHTML = '<strong>Rôle</strong>';
			ligne.insertCell(1).innerHTML = '<strong>Membres</strong>';
			ligne.insertCell(2).innerHTML = '<strong>TDC</strong>';
			ligne.insertCell(3).innerHTML = '<strong>%</strong>';
			ligne.setAttribute('style', 'text-align:center');
			
			roles.total = 'Total';
			for(role in roles) {
				ligne = table.insertRow(-1);
				var entete = ligne.insertCell(0),
					membre = ligne.insertCell(1),
					TDC = ligne.insertCell(2),
					pourcentage = ligne.insertCell(3);
				entete.innerHTML = roles[role] + ' : ';
				TDC.innerHTML = 0;
				membre.innerHTML = 0;
				pourcentage.innerHTML = '0%';
				TDC.id = 'TDC_' + role;
				membre.id = 'membre_' + role;
				pourcentage.id = 'pourcentage_' + role;
				TDC.setAttribute('style', 'text-align:right');
				membre.setAttribute('style', 'text-align:right;padding-right:10px;');
				pourcentage.setAttribute('style', 'text-align:right');
			}
			document.querySelector('#alliance').appendChild(zone);
			document.querySelector('#alliance .simulateur').rows[1].cells[0].appendChild(table);
			that.hideUselessRanks(roles);
		}
	};

	this.isRoleChecked = function(role) {
		if(!localStorage['zzzelp_affichage_roles_' + ze_serveur]) {
			localStorage['zzzelp_affichage_roles_' + ze_serveur] = JSON.stringify({grenier : true,passeur : true,chasseur : true, allie : true,hors_chaine : true});
		}
		var affichages_roles = JSON.parse(localStorage['zzzelp_affichage_roles_' + ze_serveur]);
		return affichages_roles[role];
	};

	this.hideUselessRanks = function(roles) {
		var affichages_roles = {},
			stats = {},
			joueurs = document.querySelector('#tabMembresAlliance').rows,
			n = 1;
		for(var role in roles) {
			if(role != 'total') {
				affichages_roles[role] = document.querySelector('#affichage_' + role).checked;
				stats[role] = { TDC : 0, membre : 0 };
			}
		}
		localStorage.setItem('zzzelp_affichage_roles_' + ze_serveur, JSON.stringify(affichages_roles));
		var total = { membre : 0, TDC : 0 };
		for(var i=1; i<joueurs.length; i++) {
			role = (joueurs[i].dataset.role === undefined) ? 'hors_chaine' : ((joueurs[i].dataset.role == 'inconnu') ? 'hors_chaine' : joueurs[i].dataset.role);
			if(affichages_roles[role]) {
				joueurs[i].style.display = '';
				joueurs[i].cells[1].innerHTML = n;
				n += 1;
				stats[role].TDC += parseInt(joueurs[i].cells[5].innerHTML.replace(/ /g, ''));
				stats[role].membre += 1;
				total.TDC += parseInt(joueurs[i].cells[5].innerHTML.replace(/ /g, ''));
				total.membre += 1;
			}
			else {
				joueurs[i].style.display = 'none';
			}
		}
		for (role in stats) {
			document.querySelector('#TDC_' + role).innerHTML = ze_Nombre(stats[role].TDC);
			document.querySelector('#membre_' + role).innerHTML = ze_Nombre(stats[role].membre);
			document.querySelector('#pourcentage_' + role).innerHTML = ze_Nombre(parseInt((stats[role].TDC/total.TDC)*1000)/10) + '%';
			if(document.querySelector('#TDC_' + role).innerHTML === '0' && document.querySelector('#membre_' + role).innerHTML === '0') {
				document.querySelector('#membre_' + role).parentNode.style.display = 'none';
			}
			else {
				document.querySelector('#membre_' + role).parentNode.style.display = '';
			}
		}
		document.querySelector('#TDC_total').innerHTML = ze_Nombre(total.TDC);
		document.querySelector('#membre_total').innerHTML = ze_Nombre(total.membre);
		document.querySelector('#pourcentage_total').innerHTML = '100%';
	};





	/*
		Analyse d'une chaine en fonction de ces rangs
	*/

	this.analyse = function(rangs) {
		if(typeof rangs == 'undefined') {
			rangs = this.getChaine(that.zone_page);	
		}
		var chaine = that.getRoles(rangs);
		chaine = that.getRank(chaine);
		var organisation = that.splitRoles(chaine);
		organisation = that.orderRoles(organisation);

		return that.sortRoles(organisation);
	};


	this.getRoles = function(rangs) {
		var chaine = [];
		for(var i=0; i<that.roles.length; i++) {
			var role = that.roles[i];
			for(var j=0; j<rangs[role.role].length; j++) {
				var rang = rangs[role.role][j].rang.toLowerCase(),
					pseudo = rangs[role.role][j].pseudo,
					TDC = rangs[role.role][j].TDC;
				if(rang.match(new RegExp(role.regexp))) {
					var valeurs = new RegExp(role.regexp).exec(rang);
					chaine.push({ 
						pseudo : pseudo, 
						TDC : TDC, 
						role : role.role,
						titre : valeurs[1],
						place : ((role.place > 0) ? valeurs[role.place] : undefined), 
						rang : rangs[role.role][j].rang 
					});
				}
			}
		}
		return chaine;
	};

	this.getRank = function(chaine) {
		for(n=0; n<chaine.length; n++) {
			if(chaine[n].place) {
				if(chaine[n].role == 'chasseur') {
					chaine[n].TDC = -1;
					chaine[n].mode = 3;
				}
				if(chaine[n].place.match(new RegExp('([0-9\.]+)(t|g|m|k)'))) {
					chaine[n].TDC = ze_Nombre_complet(chaine[n].place);
					chaine[n].mode = 0; //Rang défini par un niveau de TDC
				}
				else if(chaine[n].place.match(new RegExp('([0-9]+)'))) {
					chaine[n].emplacement = parseInt(new RegExp('([0-9]+)').exec(chaine[n].place)[1]);
					chaine[n].mode = 1; //Rang défini par un numero
				}
				else if(chaine[n].place.match(new RegExp('([a-z]+)'))) {
					chaine[n].emplacement = parseInt(new RegExp('([a-z]+)').exec(chaine[n].place)[1]);
					chaine[n].mode = 2; //Rang défini par une lettre
				}
			}
		}
		return chaine;
	};

	this.splitRoles = function(chaine) {
		var organisation = [];
		for(n=0; n<chaine.length; n++) {
			var trouve = false;
			for(i=0; i<organisation.length; i++) {
				if(organisation[i].role == chaine[n].role && organisation[i].mode == chaine[n].mode && organisation[i].titre == chaine[n].titre) {
					organisation[i].joueurs.push(chaine[n]);
					trouve = true;
				}
			}
			if(!trouve) {
				organisation.push({ 
					role : chaine[n].role, 
					mode : chaine[n].mode,
					titre : chaine[n].titre,
					joueurs : new Array(chaine[n]) 
				});
			}
		}
		return organisation;
	};

	this.orderRoles = function(organisation) {
		for(n=0; n<organisation.length; n++) {
			var card = organisation[n].joueurs.length,
				moyenne = 0;
			for(i=0; i<card; i++) {
				moyenne += organisation[n].joueurs[i].TDC / card;
			}
			organisation[n].TDC_moyen = parseInt(moyenne);
			if(in_array(organisation[n].mode, [1,2])) {
				if(card == 1) {
					asc = true;
				}
				else {
					asc = that.getOrderRole(card, organisation[n]);
				}
			}
			else {
				asc = true;
			}
			var variable = in_array(organisation[n].mode, [1,2]) ? 'emplacement' : 'TDC';
			organisation[n].joueurs = that.quicksort(organisation[n].joueurs, asc, variable);
		}
		return organisation;
	};

	this.getOrderRole = function(card, chaine) {
		var TDC_bas, TDC_haut;
		if(card < 4) {
			TDC_bas = (chaine.joueurs[0].emplacement > chaine.joueurs[card-1].emplacement) ? chaine.joueurs[card-1].TDC : chaine.joueurs[0].TDC;
			TDC_haut = (chaine.joueurs[0].emplacement > chaine.joueurs[card-1].emplacement) ? chaine.joueurs[0].TDC : chaine.joueurs[card-1].TDC;	
		}
		else {
			var hauts = [],
				bas = [];
			for(i=0; i<card; i++) {
				if(hauts.length < 2) {
					hauts.push(i);
				}
				else if(chaine.joueurs[i].emplacement > chaine.joueurs[hauts[0]].emplacement && chaine.joueurs[hauts[0]].emplacement < chaine.joueurs[hauts[1]].emplacement) {
					hauts[0] = i;
				}
				else if(chaine.joueurs[i].emplacement > chaine.joueurs[hauts[1]].emplacement) {
					hauts[1] = i;
				}
				if(bas.length < 2) {
					bas.push(i);
				}
				else if(chaine.joueurs[i].emplacement < chaine.joueurs[bas[0]].emplacement && chaine.joueurs[bas[0]].emplacement >chaine.joueurs[bas[1]].emplacement) {
					bas[0] = i;
				}
				else if(chaine.joueurs[i].emplacement < chaine.joueurs[bas[1]].emplacement) {
					bas[1] = i;
				}
			}
			TDC_haut = chaine.joueurs[hauts[0]].TDC + chaine.joueurs[hauts[1]].TDC;
			TDC_bas = chaine.joueurs[bas[0]].TDC + chaine.joueurs[bas[1]].TDC;
		}
		return (TDC_haut > TDC_bas);		
	};

	this.sortRoles = function(organisation) {
		organisation.sort(function(a, b){
			if (a.TDC_moyen < b.TDC_moyen) 
				return 1;
			if (a.TDC_moyen > b.TDC_moyen)
				return -1;
			return 0;
			});
		
		var finale = [];
		n = 1;
		for(i=0; i<organisation.length; i++) {
			for(j=0; j<organisation[i].joueurs.length; j++) {
				finale[organisation[i].joueurs[j].pseudo] = { 
					role : organisation[i].joueurs[j].role, 
					rang : organisation[i].joueurs[j].rang, 
					numero : n 
				};
				n+=1;
			}
		}
		return finale;
	};

	this.quicksort = function(joueurs, asc, variable) {
		if(joueurs.length < 2) {
			return joueurs;
		}
		var petit = [],
			grand = [];
		for(var k=1; k<joueurs.length; k++) {
			if((asc && joueurs[k][variable] > joueurs[0][variable]) || (!asc && joueurs[k][variable] < joueurs[0][variable])) {
				petit.push(joueurs[k]);
			}
			else {
				grand.push(joueurs[k]);
			}
		}
		var res_1 = that.quicksort(petit, asc, variable).concat([joueurs[0]], that.quicksort(grand, asc, variable));
		return res_1;
	};

	this.init();
}