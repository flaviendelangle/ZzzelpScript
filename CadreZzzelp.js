function ZzzelpScriptCadre(zzzelp) {
	var cadre = this;

	this.version = zzzelp.version.str;

	this.menus = new Array(
		{ nom : 'Exports vers Zzzelp', id : 'exports' },
		{ nom : 'Personnaliser ZzzelpScript', id : 'parametres' },
		{ nom : 'Traceur personnel', id : 'traceur' },
		{ nom : 'Echanges C+', id : 'echanges' },
		{ nom : 'Statistiques', id : 'statistiques' }
	);

	this.exports = new Array(
		{ 
			nom : 'Constructions', 
			id : 'constructions', 
			valeur : zzzelp.compte.getUpdateConstruction()
		},{
			nom : 'Recherches',
			id : 'recherches',
			valeur : zzzelp.compte.getUpdateLaboratoire()
		},{
			nom : 'Ouvrières', 
			id : 'ouvrieres',
			valeur : zzzelp.compte.getUpdateReine()
		}
	);

	this.init = function() {
		cadre.createCadre();
		cadre.createSectionContenu();
		cadre.placeCadre();
		cadre.cadre_zzzelp.dataset.visible = "1";
		cadre.cadre_zzzelp.onmouseover = function onmouseover(event) {
			document.querySelector('#menuBoite').className = 'menuActif';
		};
		if(ZzzelpScript.auth() == '2') {
			if(localStorage['zzzelp_onglet_cadre_' + ze_serveur] && localStorage.getItem('zzzelp_onglet_cadre_' + ze_serveur) >= 0) {
				cadre.showSection(parseInt(localStorage.getItem('zzzelp_onglet_cadre_' + ze_serveur)));
			}
			else {
				localStorage['zzzelp_onglet_cadre_' + ze_serveur] = -1;
			}
		}
	};

	this.createCadre = function() {
		var cadre_zzzelp = document.createElement('div'),
			zone_contenu = document.createElement('div'),
			titre = document.createElement('div'),
			lien_titre = document.createElement('a');
		titre.className = 'titre_colonne_cliquable';
		titre.onclick = function onclick(event) {
			window.open(url_zzzelp);
			return false;
		};
		lien_titre.innerHTML = 'Zzzelp ' + cadre.version;
		lien_titre.href = '#';
		cadre_zzzelp.id = 'boiteComptePlus';
		cadre_zzzelp.className = 'boite_compte_plus cadre_zzzelp';
		cadre_zzzelp.dataset.affiche = '0';
		zone_contenu.className = 'contenu_boite_compte_plus';
		zone_contenu.id = 'zzzelp_contenu_cadre';
		document.body.appendChild(cadre_zzzelp);
		cadre_zzzelp.appendChild(titre);
		titre.appendChild(lien_titre);
		cadre_zzzelp.appendChild(zone_contenu);

		cadre.cadre_zzzelp = cadre_zzzelp;
		cadre.zone_contenu = zone_contenu;
	};

	this.createSectionContenu = function() {
		if(ZzzelpScript.auth() == '0') {
			cadre.createButtonAuthPlayer();
		}
		else {
			cadre.createCadreAuthenticated();
		}
	};

	this.createButtonAuthPlayer = function() {
		var lien_aide = document.createElement('button');
		lien_aide.className = 'zzzelp_lien_aide';
		lien_aide.innerHTML = 'Activer Zzzelp ' + ze_serveur;
		lien_aide.onclick = function onclick(event) {
			document.location.href = url_zzzelp + '/activation_pseudo?serveur=' + ze_serveur + '&pseudo=' + gpseudo + '&token=' + getToken();
		};
		cadre.zone_contenu.appendChild(lien_aide);
	};

	this.createCadreAuthenticated = function() {
		var	zone_onglets = document.createElement('div'),
			table_resume = document.createElement('table'),
			table_raccourcis = document.createElement('table');
		
		zone_onglets.id = 'zone_onglets_zzzelp';

		var ligne_retour = table_resume.insertRow(-1),
			cell_retour = ligne_retour.insertCell(0),
			span_retour = document.createElement('span');
		span_retour.innerHTML = 'Retour';
		span_retour.setAttribute('style', 'line-height: 2em;font-weight: bold;cursor: pointer;display:none');
		span_retour.id = 'zzzelp_retour_raccourcis';
		span_retour.onclick = function onclick(event) {
			cadre.showSection(-1);
		};
		cell_retour.appendChild(span_retour);

		var ligne_update = table_resume.insertRow(-1),
			cell_update = ligne_update.insertCell(0);
		cell_update.innerHTML = 'Synchroniser ZzzelpScript';
		cell_update.setAttribute('style', 'line-height: 2em;font-style:italic;cursor:pointer');
		cell_update.id = 'zzzelp_update';
		cell_update.onclick = function onclick(event) {
			zzzelp.getParameters(true, 1);
		};

		table_raccourcis.setAttribute('style', 'margin-top:8px');
		table_raccourcis.id = 'zzzelp_raccourcis';
		for(var i=0; i<cadre.menus.length; i++) {
			var ligne = table_raccourcis.insertRow(-1),
				cell = ligne.insertCell(0);
			cell.setAttribute('style', 'line-height: 2em;font-weight: bold;cursor: pointer;');
			cell.innerHTML = cadre.menus[i].nom;
			cell.dataset.onglet = i;
			cadre.addEventButtonSection(cell);

		}
		
		cadre.zone_contenu.appendChild(table_resume);
		cadre.zone_contenu.appendChild(table_raccourcis);
		cadre.zone_contenu.appendChild(zone_onglets);
	};

	this.addEventButtonSection = function(cell) {
		cell.onclick = function onclick(event) {
			cadre.showSection(this.dataset.onglet);
		};
	};

	this.placeCadre = function() {
		setInterval(function() {
			if(document.querySelector('#boutonBoite.boutonActif')) {
				document.querySelector('#boutonBoite').dataset.ex_affiche = +new Date();
			}
			if((coordonnees_souris.x < 230 || !isTouchDevice) && (+new Date() - parseInt(document.querySelector('#boutonBoite').dataset.ex_affiche) < 100)) {
				document.querySelector('.cadre_zzzelp').dataset.affiche =  1;
				document.querySelector('#menuBoite').className = 'menuActif';
				document.querySelector('#boutonBoite').className = 'boutonActif';
			}
			else {
				document.querySelector('.cadre_zzzelp').dataset.affiche =  0;
				document.querySelector('#menuBoite').className = '';
				document.querySelector('#boutonBoite').className = '';
			}
			var largeur = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			if(largeur < 1343) {
				document.querySelector('.cadre_zzzelp').style.marginTop = (document.querySelector('#boiteComptePlus .contenu_boite_compte_plus').offsetHeight + 60) + 'px';
				document.querySelector('.cadre_zzzelp').style.right = '';
				document.querySelector('#menuBoite').style.position = 'absolute';
			}
			else {
				document.querySelector('.cadre_zzzelp').style.marginTop = '0px';
				document.querySelector('.cadre_zzzelp').style.right = parseInt(((((largeur - document.querySelector('#centre').offsetWidth)/2)-220)/2) + 220) + 'px';
				document.querySelector('#menuBoite').style.position = 'fixed';
			}
		}, 25);
	};

	this.showSection = function(onglet) {
		localStorage['zzzelp_onglet_cadre_' + ze_serveur] = onglet;
		if(onglet >= 0) {
			document.querySelector('#zzzelp_raccourcis').style.display = 'none';
			document.querySelector('#zzzelp_retour_raccourcis').style.display = '';
			document.querySelector('#zzzelp_retour_raccourcis').dataset.affiche_zzzelp = '1';
			this.createSection[cadre.menus[onglet].id]();
		}
		else {
			document.querySelector('#zzzelp_raccourcis').style.display = '';
			document.querySelector('#zzzelp_retour_raccourcis').style.display = 'none';
			delete document.querySelector('#zzzelp_retour_raccourcis').dataset.affiche_zzzelp;
			document.querySelector('#zone_onglets_zzzelp').innerHTML = '';
		}
	};

	this.addLineExport = function(table, i) {
		var ligne = table.insertRow(-1),
			texte = ligne.insertCell(0),
			valeur = ligne.insertCell(1),
			synchro = ligne.insertCell(2),
			img = document.createElement('img'),
			dernier = document.createElement('span'),
			duree = document.createElement('span');
					
		ligne.setAttribute('style', 'line-height: 2em;');
		ligne.id = 'zzzelp_exports_' + cadre.exports[i].id;
		texte.innerHTML = cadre.exports[i].nom;
		dernier.innerHTML = cadre.exports[i].valeur;
		dernier.setAttribute('style', 'display:none');
		valeur.appendChild(dernier);
		valeur.appendChild(duree);
		img.src = url_zzzelp + '/Images/refresh.png';
		img.width = '20';
		img.setAttribute('style', 'cursor:pointer');
		img.dataset.type = cadre.exports[i].id;
		img.onclick = function onclick(event) {
			cadre.forceSynchroNiveaux(this.dataset.type);
		};
		synchro.appendChild(img);
	};

	this.addLineParameters = function(table, parametres, categorie, option) {
		var ligne = table.insertRow(-1),
			cell1 = ligne.insertCell(0),
			cell2 = ligne.insertCell(1),
			checkbox = document.createElement('input');
		cell1.innerHTML = parametres.parametres[categorie].parametres[option].nom + ' : ';
		cell1.setAttribute('style', 'text-align:left;line-height:2em;padding-left:5px');
		cell2.setAttribute('style', 'padding-right: 3px;');
		checkbox.type = 'checkbox';
		checkbox.dataset.nom = option;
		checkbox.dataset.categorie = categorie;
		checkbox.checked = (parametres.parametres[categorie].parametres[option].active == 1);
		checkbox.onchange = function onchange(event) {
			cadre.updateParameters(this.dataset.categorie, this.dataset.nom, (this.checked ? 1 : 0), 'active', 1);
		};
		cell2.appendChild(checkbox);
	};

	this.updateParameters = function(categorie, nom, valeur, type, mode) {
		var parametres = JSON.parse(localStorage['zzzelp_parametres_' + ze_serveur]);
		if(categorie == 'traceur') {
			parametres.traceur_perso = JSON.parse(valeur);
		}
		else {
			parametres.parametres[categorie].parametres[nom][type] = valeur;
		}
		localStorage.setItem('zzzelp_parametres_' + ze_serveur, JSON.stringify(parametres));
		var url_ajax = 'update_script?option=' + nom + '&categorie=' + categorie + '&valeur=' + valeur + '&';		
		new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : url_ajax, force : mode },
			{ authentication_issue : function() {
				cadre.updateParameters(categorie, nom, valeur, type, 2);
			}
		});		
	};


	this.createSection = {
		exports : function() {
			var	zone = document.querySelector('#zone_onglets_zzzelp'),
				table = document.createElement('table');
			table.setAttribute('style', 'margin-top:8px');
			for(var i=0; i<cadre.exports.length; i++) {
				cadre.addLineExport(table, i);
			}
			zone.appendChild(table);
			cadre.updateSynchroNiveaux();
		},
		parametres : function() {
			var parametres =  ZzzelpScript.parameters('*'),
				zone = document.querySelector('#zone_onglets_zzzelp'),
				zone_2 = document.createElement('div');
				table = document.createElement('table');
			zone_2.className = 'zzzzelp_parametres_script';
			for(var categorie in parametres.parametres) {
				var entete = table.insertRow(-1);
				entete.className = 'entete_option_zzzelp';
				entete.innerHTML = parametres.parametres[categorie].nom;
				entete.setAttribute('style', 'font-weight: bold;line-height:3em;text-align:center');
				entete.setAttribute('colspan', 2);
				for(var option in parametres.parametres[categorie].parametres) {
					cadre.addLineParameters(table, parametres, categorie, option);
				}
			}
			zone_2.appendChild(table);
			zone.appendChild(zone_2);			
		},
		traceur : function() {
			var donnees = ZzzelpScript.parameters('traceur_perso'),
				zone = document.querySelector('#zone_onglets_zzzelp'),
				zone2 = document.createElement('div'),
				table = document.createElement('table'),
				ligne = table.insertRow(-1),
				cell = ligne.insertCell(0);
			cell.setAttribute('colspan', '3');
			cell.id = 'zzzelp_synchro_traceur';
			cell.setAttribute('style', 'cursor:pointer;font-style:italic');
			cell.innerHTML = 'Synchroniser le traceur';
			cell.onclick = function onclick(event) {
				cadre.launchTraceur();
			};
			zone2.className = 'zzzelp_donnees_traceur';
			for(var type in donnees) {
				var entete = table.insertRow(-1);
				cell = entete.insertCell(0);
				cell.setAttribute('colspan', '3');
				cell.setAttribute('style', 'font-weight:bold;line-height:3em;');
				cell.innerHTML = ((type == 'joueurs') ? 'Joueurs' : 'Alliances') + ' à suivre';
				for(var i=0; i<donnees[type].length; i++) {
					ligne = table.insertRow(-1);
					cadre.validateLineTraceur(ligne, type, donnees[type][i], false);
				}
				ligne = table.insertRow(-1);
				ligne.dataset.type = type;
				cadre.editLineTraceur(ligne, true);
			}
			zone2.appendChild(table);
			zone.appendChild(zone2);
			ZzzelpScriptTraceur.updateDelay(true);			
		},
		echanges : function() {
			var ressources = new Array(
								{ nom : 'Nourriture', id : 'nourriture', icone : '/images/icone/icone_pomme.png' },
								{ nom : 'Materiaux', id : 'materiaux', icone : '/images/icone/icone_bois.png' },
								{ nom : 'Ouvrières', id : 'ouvriere', icone : '/images/icone/icone_ouvriere.gif' },
								{ nom : 'TDC', id : 'tdc', icone : '/images/icone/icone_tdc.gif' },
								{ nom : 'Echange possible', id : 'echange_possible', icone : '' }
								),
				zone = document.querySelector('#zone_onglets_zzzelp'),
				table = document.createElement('table');
			zone.appendChild(table);
			cadre.getTauxEchange(ressources);
		},
		statistiques : function() {
			if(force) {
				document.querySelector('#zone_onglets_zzzelp').innerHTML = '';
			}
			var zone = document.querySelector('#zone_onglets_zzzelp'),
				ligne;
			if(localStorage['zzzelp_statistiques_' + ze_serveur]) {
				var table = document.createElement('table'),
					statistiques = JSON.parse(localStorage['zzzelp_statistiques_' + ze_serveur]);
				for(var page in statistiques.pages) {
					ligne = table.insertRow(-1);
					var	cell1 = ligne.insertCell(0),
						cell2 = ligne.insertCell(1),
						a = document.createElement('a');
					ligne.dataset.statistiques = 'pages';
					ligne.class = 'ligne_statistiques';
					a.href = 'http://' + ze_serveur + '.fourmizzz.fr/' + page + '.php';
					a.innerHTML = page;
					a.setAttribute('style', 'float: left;padding-left: 10px;');
					a.target = '_BLANK';
					cell1.appendChild(a);
					cell2.innerHTML = ze_Nombre(statistiques.pages[page]);
				}
				zone.appendChild(table);
				
				var pages = table.querySelectorAll('tr[data-statistiques="pages"]');
				for (var i=0;i<pages.length;i++) {
					page = table.querySelectorAll('tr[data-statistiques="pages"]')[i];
					j = i;
					while (j > 0 && parseInt(page.cells[1].innerHTML.replace(/ /g,'')) > parseInt(table.querySelectorAll('tr[data-statistiques="pages"]')[j-1].cells[1].innerHTML.replace(/ /g,''))) {
						var sibling = table.querySelectorAll('tr[data-statistiques="pages"]')[j].previousElementSibling,
							anchor = table.querySelectorAll('tr[data-statistiques="pages"]')[j].nextElementSibling,
							parent = table.querySelectorAll('tr[data-statistiques="pages"]')[j].parentNode;
						parent.insertBefore(table.querySelectorAll('tr[data-statistiques="pages"]')[j], sibling);				
						j--;
					}
				}
			}
			else {
				ligne = document.createElement('div');
				ligne.innerHTML = 'Activer les statistiques';
				ligne.setAttribute('style', 'line-height: 2.5em;font-weight: bold;color: chartreuse;cursor:pointer;');
				ligne.onclick = function onclick(event) {
					cadre.launchStatictics();
				};
				zone.appendChild(ligne);
			}			
		}
	};

	this.updateSynchroNiveaux = function() {
		setInterval(function() {
			var lignes = document.querySelectorAll('tr[id*="zzzelp_exports_"]');
			if(lignes.length > 0) {
				for(var i=0; i<lignes.length; i++) {
					var ecart = ze_Secondes_date(time_fzzz() - parseInt(lignes[i].cells[1].querySelectorAll('span')[0].innerHTML));
					lignes[i].cells[1].querySelectorAll('span')[1].innerHTML = ecart;
				}
			}
		}, 1000);
	};

	this.forceSynchroNiveaux = function(type) {
		var url;
		if(type == 'constructions') {
			url = 'http://' + ze_serveur + '.fourmizzz.fr/construction.php?iz';
		}
		else if(type == 'recherches') {
			url = 'http://' + ze_serveur + '.fourmizzz.fr/laboratoire.php?iz';
		}
		else if(type == 'ouvrieres') {
			url = 'http://' + ze_serveur + '.fourmizzz.fr/Reine.php?iz';
		}
		document.location.href = url;
	};

	this.editLineTraceur = function(ligne, nouveau) {
		var TAG = nouveau ? '' : ligne.cells[0].querySelector('a').innerHTML;
		ligne.innerHTML = '';
		ligne.dataset.ex_valeur = nouveau ? 'defaut' : TAG;
		var cell1 = ligne.insertCell(0),
			cell2 = ligne.insertCell(1),
			input = document.createElement('input'),
			img = document.createElement('img');
		cell1.setAttribute('colspan', '2');
		input.type = 'text';
		input.setAttribute('style', 'width:130px');
		input.value = TAG;
		input.placeholder = (ligne.dataset.type == 'alliances') ? 'TAG' : 'Pseudo';
		img.setAttribute('width', '15px');
		img.src = url_zzzelp + '/Images/valider.png';
		img.setAttribute('style', 'cursor:pointer');
		img.onclick = function onclick(event) {
			var ligne = this.parentNode.parentNode;
			cadre.validateLineTraceur(ligne, ligne.dataset.type, ligne.querySelector('input').value, true);
		};
		cell1.appendChild(input);	
		cell2.appendChild(img);
	};

	this.validateLineTraceur = function(ligne, type, valeur, update) {
		ligne.innerHTML = '';
		var	cell1 = ligne.insertCell(0),
			cell2 = ligne.insertCell(1),
			cell3 = ligne.insertCell(2),
			img1 = document.createElement('img'),
			img2 = document.createElement('img');
		ligne.dataset.type = type;
		cell2.setAttribute('style', 'width:30px');
		cell3.setAttribute('style', 'width:30px');
		cell1.innerHTML = (type == 'alliances') ? ze_Lien_alliance(valeur) : ze_Lien_profil(valeur);
		img1.src = url_zzzelp + '/Images/edit.png';
		img2.src = 'http://www.icone-png.com/png/25/24717.png';
		img1.setAttribute('width', '15px');
		img2.setAttribute('width', '15px');
		img1.setAttribute('style', 'cursor:pointer');
		img2.setAttribute('style', 'cursor:pointer');
		img1.onclick = function onclick(event) {
			cadre.editLineTraceur(this.parentNode.parentNode, false);
		};
		img2.onclick = function onclick(event) {
			ze_Supprimer_element(this.parentNode.parentNode);
			cadre.updateTraceur();
		};
		cell2.appendChild(img1);
		cell3.appendChild(img2);
		if(update) {
			delete ligne.dataset.ex_valeur;
			cadre.updateTraceur();
			if(document.querySelectorAll('#zone_onglets_zzzelp tr[data-type="' + type + '"] input').length === 0) {
				var lignes = document.querySelectorAll('#zone_onglets_zzzelp tr[data-type="' + type + '"] a'),
					index = lignes[lignes.length - 1].parentNode.parentNode.rowIndex;
				ligne = document.querySelector('#zone_onglets_zzzelp table').insertRow(index+1);
				ligne.dataset.type = type;
				cadre.editLineTraceur(ligne, true);
			}
		}
	};

	this.updateTraceur = function() {
		var lignes_alliances = document.querySelectorAll('#zone_onglets_zzzelp tr[data-type="alliances"]'),
			lignes_joueurs = document.querySelectorAll('#zone_onglets_zzzelp tr[data-type="joueurs"]'),
			alliances = [],
			joueurs = [],
			i;
		for(i=0;i<lignes_alliances.length; i++) {
			if(typeof lignes_alliances[i].dataset.ex_valeur != "undefined") {
				if(lignes_alliances[i].querySelector('input').value !== '') {
					alliances.push(lignes_alliances[i].querySelector('input').value);
				}
			}
			else if(lignes_alliances[i].cells[0].innerHTML !== '' ) {
				alliances.push(lignes_alliances[i].cells[0].querySelector('a').innerHTML);
			}
		}
		for(i=0;i<lignes_joueurs.length; i++) {
			if(lignes_joueurs[i].dataset.ex_valeur) {
				if(lignes_joueurs[i].querySelector('input').value !== '') {
					joueurs.push(lignes_joueurs[i].querySelector('input').value);
				}
			}
			else if(lignes_joueurs[i].cells[0].innerHTML !== '' ) {
				joueurs.push(lignes_joueurs[i].cells[0].querySelector('a').innerHTML);
			}
		}
		cadre.updateParameters('traceur', '', JSON.stringify({ alliances : alliances, joueurs : joueurs }), '', 1);
	};

	this.launchTraceur = function() {
		var donnees = ZzzelpScript.parameters('traceur_perso');
		new ZzzelpScriptTraceur(donnees);
		document.querySelector('.zzzelp_donnees_traceur table').style.display = 'none';
		var zone = document.createElement('div');
		zone.innerHTML = 'Etat : Synchro en cours';
		zone.className = 'alerte_zzzelp_traceur';
		zone.setAttribute('style', 'margin: 35px 0;font-weight: bold;color: orange;line-height: 2.5em;');
		document.querySelector('.zzzelp_donnees_traceur').appendChild(zone);
	};
	
	this.getTauxEchange = function(ressources) {
		if(ressources.length > 0) {
			var ressource = ressources.pop(),
				suffix = (ressource.id == 'echange_possible') ? '' : ('?type_echange=' + ressource.id);
			new ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : 'echange.php' + suffix, addDOM : true },
				{ success : function(zone_page) {
					var ligne = document.querySelector('#zone_onglets_zzzelp table').insertRow(-1);
					if(ressource.id == 'echange_possible') {
						var temps_restant = document.querySelector('#tps_restant'),
							cell = ligne.insertCell(0);
						cell.setAttribute('colspan', '2');
						if(temps_restant !== null) {
							cell.setAttribute('style', 'color:red');
							var attente;
							if(document.querySelector('#tps_restant').innerHTML == parseInt(document.querySelector('#tps_restant').innerHTML)) {
								attente = ze_Secondes_date(document.querySelector('#tps_restant').innerHTML);
							}
							else {
								attente = document.querySelector('#tps_restant').innerHTML;
							}
							cell.innerHTML = 'Attente restante : ' + attente;
						}
						else {
							cell.setAttribute('style', 'color:green');
							cell.innerHTML = 'Echange possible';
						}
					}
					else {
						var nom = ligne.insertCell(0),
							valeur = ligne.insertCell(1);
						nom.innerHTML = ressource.nom + ' : ';
						valeur.innerHTML = zone_page.querySelectorAll('.intro strong')[(ComptePlus ? 2 : 1)].innerHTML + '&nbsp<img width="15px" src="' + ressource.icone + '">';
						valeur.setAttribute('style', 'text-align:right');
					}
					cadre.getTauxEchange(ressources);
				}
			});
		}
	};

	this.launchStatictics = function() {
		var statistiques = {
				pages : { Armee : 0, alliance : 0, AcquerirTerrain : 0, chat : 0, classementAlliance : 0, commerce : 0, construction : 0, 
						  ennemie : 0, laboratoire : 0, Membre : 0, messagerie : 0, Reine : 0, Ressources : 0 },
				actions : { 'Messages CA' : 0, 'Messages CG' : 0, 'MP envoyés' : 0, 'MP reçus' : 0 }
		};
		localStorage.setItem('zzzelp_statistiques_' + ze_serveur, JSON.stringify(statistiques));
		cadre.createSection.statistiques(true);
	};

	this.init();

}


