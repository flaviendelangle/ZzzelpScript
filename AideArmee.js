function ZzzelpScriptAideGhost(zzzelp) {

	var that = this;
	that.TAGs = ZzzelpScript.parameters('ghosts', ['ghosts_guerre']);
	that.alliances_interdites = ZzzelpScript.parameters('ghosts', ['ghosts_hors_guerre']);
	that.options = new Array(
		{
			nom : 'Date d\'envoi', 
			type : 'text',
			id : 'date_envoi_attaque_zzzelp',
			update : true,
			value : ze_Generation_date_v1(time_fzzz() - 3600 ,true)
		},{
			nom : 'Date de retour', 
			id : 'date_retour_attaque_zzzelp',
			type :'text',
			update : true,
			value :  ze_Generation_date_v1(time_fzzz(), true)
		},{
			nom : 'TDC d\'envoi', 
			id : 'TDC_envoi_attaque_zzzelp',
			type : 'text',
			update : true,
			value : ze_Nombre(gTDC)
		},{
			nom : 'Capacité de flood', 
			id : 'capa_flood_zzzelp',
			type : 'text',
			value : ze_Nombre(ZzzelpScriptArmee.getArmee(document, 0).getCapaFlood())
		},{
			nom : 'Autoriser ghost hors guerre', 
			id : 'ghost_externe_zzzelp',
			type : 'checkbox',
			update : true 
		},{
			nom : 'Mode de lancement', 
			id : 'mode_zzzelp',
			selected : 'Auto TDC',
			type : 'select',
			options : new Array('Zzzelpfloods', 'Auto TDC', 'Auto Dôme', 'Auto Loge', 'Manuel TDC', 'Manuel Dôme', 'Manuel Loge')
		}
	);

	this.init = function() {
		that.createSummary();
		that.update();
	};

	this.createSummary = function() {
		var tableau = document.createElement('table');
		tableau.setAttribute('style', 'margin-top:25px');
		tableau.setAttribute('class', 'simulateur');
		tableau.setAttribute('id', 'options_guerre');
		var input;
		for(var i=0; i<that.options.length; i++) {
			var param = that.options[i],
				ligne = tableau.insertRow(i),
				cell1 = ligne.insertCell(0),
				cell2 = ligne.insertCell(1);
			cell1.innerHTML = param.nom + ' :';
			if(param.type == 'select') {
				var select = document.createElement('select');
				for(var j=0; j<param.options.length; j++) {
					var option = document.createElement('option');
					option.innerHTML = param.options[j];
					if(param.selected == param.options[j]) {
						option.selected = true;
					}
					select.appendChild(option);
				}
				select.id = param.id;
				cell2.appendChild(select);
			}
			else {
				input = document.createElement('input');
				input.type = param.type;
				if(param.type == 'text') {
					input.value = param.value;
				}
				cell2.appendChild(input);
				input.id = param.id;
			}
			if(param.update) {
				param.onchange = that.update;
			}
			cell2.setAttribute('style', 'text-align:right');
		}
		var cell = tableau.insertRow(-1),
			center = document.createElement('center');
		input = document.createElement('input');
		cell.setAttribute('colspan', '2');
		input.onclick = function onclick(event) {
			that.update();
		};
		input.type = 'button';
		input.value = 'Actualiser';
		center.appendChild(input);
		cell.appendChild(center);
		document.querySelector('center').appendChild(tableau);		
	};

	this.update = function() {
		that.data = {};
		that.joueurs = {};
		that.pseudos = [];
		that.getData(1);
	};

	this.getData = function(n) {
		var contentType = 'application/x-www-form-urlencoded',
			data = 'etat=tous&terrain_max=' + (gTDC * 3) + '&fourmiliere_attaquable=true&terrain_min=' + (gTDC / 2) + '&page=' + n;
		new ZzzelpScriptAjax({ method : 'POST', domain : 'fourmizzz', url : 'ennemie.php', addDOM : true, contentType : contentType, data : data },
			{ success : function(zone_page) {
				if(zone_page.querySelectorAll('#tabEnnemie').length > 0) {
					var lignes = zone_page.querySelector('#tabEnnemie').rows;
					for(var i=1; i<lignes.length; i++) {
						that.data[lignes[i].cells[1].querySelector('a').innerHTML] = {
							alliance : ((lignes[i].cells[0].querySelectorAll('a').length > 0) ? lignes[i].cells[0].querySelector('a').innerHTML : ''),
							TDC : parseInt(lignes[i].cells[3].innerHTML.replace(/ /g, '')),
							distance : parseInt(lignes[i].cells[5].innerHTML),
							etat : lignes[i].cells[6].innerHTML
									};
					}
					that.getData(n+1);
				}
				else {
					that.prepareData();
				}
			}
		});
	};

	this.prepareData = function() {
		for(var pseudo in that.data) {
			if(that.canGhost(pseudo, that.data[pseudo].alliance)) {
				that.joueurs[pseudo] = that.data[pseudo];
				that.pseudos.push(pseudo);
			}
		}
		new ZzzelpScriptCoordonnees(that.pseudos, [], function(coordonnees) {
			that.coordonnees = coordonnees;
			var valeurs_2 = coordonnees[gpseudo],
				VA = zzzelp.compte.getVitesseAttaque();
			for(pseudo in that.joueurs) {
				var valeurs = coordonnees[pseudo],
					distance = ze_Calcul_distance(valeurs_2.x, valeurs_2.y, valeurs.x, valeurs.y);
				that.joueurs[pseudo].temps_trajet = ze_Calcul_temps_trajet(distance, VA);
				that.joueurs[pseudo].ID = valeurs.ID;
			}
			that.createInterface();
		});
	};

	this.canGhost = function(pseudo, TAG) {
		if(pseudo == gpseudo) {
			return false;
		}
		if(document.querySelector('#ghost_externe_zzzelp').checked) {
			return !in_array(TAG, that.alliances_interdites);
		}
		else {
			return in_array(TAG, that.TAGs);	
		}
	};

	this.createInterface = function() {
		var debut = ze_Date_to_timestamp_v1(document.querySelector('#date_envoi_attaque_zzzelp').value),
			fin = ze_Date_to_timestamp_v1(document.querySelector('#date_retour_attaque_zzzelp').value),
			pseudos = that.quickSort(that.pseudos, that.joueurs, debut, fin);
		pseudos = (pseudos.length > 20 ? pseudos.slice(0,19) : pseudos);
		var	table = document.createElement('table'),
			ligne = table.insertRow(0);
		table.setAttribute('style', 'margin-top:25px');
		table.setAttribute('class', 'simulateur zzzelp_tableau_distances');
		ligne.innerHTML = '<th>Pseudo</th><th>Alliance</th><th>Impact</th><th>Delta</th><th>Lancer</th>';
		for(var i=0; i<pseudos.length; i++) {
			that.createLine(debut, fin, table, pseudos, i);
		}

		if(document.querySelectorAll('.zzzelp_tableau_distances').length > 0) {
			ze_Supprimer_element(document.querySelector('.zzzelp_tableau_distances'));
		}
		document.querySelector('center').appendChild(table);
	};

	this.createLine = function(debut, fin, table, pseudos, i) {
		var	ecart = (debut + that.joueurs[pseudos[i]].temps_trajet - fin),
			ligne = table.insertRow(-1),
			cell = ligne.insertCell(-1),
			lien = document.createElement('a');
		lien.target = '_BLANK';
		lien.href = 'Membre.php?Pseudo=' + pseudos[i];
		lien.innerHTML = pseudos[i];
		cell.appendChild(lien);

		cell = ligne.insertCell(-1);
		lien = document.createElement('a');
		lien.target = '_BLANK';
		lien.href = 'classementAlliance.php?alliance=' + that.joueurs[pseudos[i]].alliance;
		lien.innerHTML = that.joueurs[pseudos[i]].alliance;
		cell.appendChild(lien);

		cell = ligne.insertCell(-1);
		cell.innerHTML = ze_Generation_date_v1(debut + that.joueurs[pseudos[i]].temps_trajet);
		
		cell = ligne.insertCell(-1);
		var span = document.createElement('span');
		span.setAttribute('style', 'float:right;margin-left:15px;color:' + (ecart > 0 ? 'green' : 'red'));
		span.innerHTML = (ecart < 0 ? '-' : '') + ze_Secondes_date(Math.abs(ecart), true);
		cell.appendChild(span);

		cell = ligne.insertCell(-1);
		var img = document.createElement('img');
		img.src= url_zzzelp + 'Images/icone_attaque.gif';
		img.setAttribute('style', 'display:block;margin:auto;cursor:pointer');
		img.onclick = function onclick(event) {
			that.send(pseudos[i]);
		};
		cell.appendChild(img);

	};

	this.quickSort = function(pseudos, joueurs, debut, fin) {
		if(pseudos.length < 2) {
			return pseudos;
		}
		var petit = [],
			grand = [];
		for(var k=1; k<pseudos.length; k++) {
			if(Math.abs(debut - fin + joueurs[pseudos[k]].temps_trajet) > Math.abs(debut - fin + joueurs[pseudos[0]].temps_trajet)) {
				grand.push(pseudos[k]);
			}
			else {
				petit.push(pseudos[k]);
			}
		}
		var res_1 = that.quickSort(petit, joueurs, debut, fin).concat([pseudos[0]], that.quickSort(grand, joueurs, debut, fin));
		return res_1;
	};


	this.send = function(pseudo) {
		var mode = document.querySelector('#mode_zzzelp').value;
		if(mode == 'Zzzelpfloods') {
			var joueurs = [{}],
				cadre = document.createElement('div');
			joueurs[0][gpseudo] = that.coordonnees[gpseudo];
			joueurs[0][pseudo] = that.coordonnees[pseudo];
			joueurs[0][gpseudo].TDC = gTDC;
			joueurs[0][pseudo].TDC = that.joueurs[pseudo].TDC;
			document.querySelector('center').appendChild(cadre);
			var donnees = {
				pseudo : gpseudo,
				serveur : ze_serveur,
				vitesse_attaque : zzzelp.compte.getVitesseAttaque(),
				nombre_unites : parseInt(document.querySelector('#capa_flood_zzzelp').value.replace(/ /g,'')),
				options : true,
				sondes : ZzzelpScript.parameters('sondes'),
				antisonde : ZzzelpScript.parameters('antisonde'),
				placer_antisonde : ZzzelpScript.parameters('parametres', ['zzzelpfloods', 'zzzelpfloods_antisonde']),
				lancement_zzzelp : ZzzelpScript.parameters('parametres', ['zzzelpfloods', 'zzzelpfloods_stockage']),
				aide_relance : ZzzelpScript.parameters('parametres', ['zzzelpfloods', 'zzzelpfloods_relance']),
				valeur_aide_relance : ZzzelpScript.parameters('zzzelpfloods_test', ['mode_relance']),
				anti_synchro : ZzzelpScript.parameters('parametres', ['zzzelpfloods', 'zzzelpfloods_antisynchro']),
				seconde_renvoi : ZzzelpScript.parameters('zzzelpfloods_test', ['seconde'])%60,
				stockage_parametres_zzzelp : true,
				prive : ZzzelpScript.parameters('droits'),
				coordonnees : joueurs,
			};
			Generation_floods(cadre, donnees);
		}
		else {
			var parametres = new RegExp('(.*) (.*)').exec(mode),
				lieux = new Array('TDC', 'Dôme', 'Loge'),
				url_lancement = 'http://' + ze_serveur + '.fourmizzz.fr/ennemie.php?Attaquer=' + that.joueurs[pseudo].ID;
			url_lancement += '&lieu=' + (lieux.indexOf(parametres[2]) + 1) + ((parametres[1] == 'Auto') ? '&zauto=true' : '');
			document.location.href = url_lancement;
		}
		ze_Supprimer_element(document.querySelector('#options_guerre'));
		ze_Supprimer_element(document.querySelector('.zzzelp_tableau_distances'));
	};

	this.init();
}