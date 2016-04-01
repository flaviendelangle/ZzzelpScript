/* Importe les rangs depuis Zzzelp */
function ze_Importation_rang(lieu, mode) {
	var date_maj = localStorage.getItem('zzzelp_MAJ_rangs_' + ze_serveur),
		rangs = localStorage.getItem('zzzelp_rangs_' + ze_serveur);
	if ((time_fzzz() - date_maj) < 1800  && date_maj && rangs && mode === 0) {
		rangs = JSON.parse(rangs);
		ze_Affichage_rangs(rangs, lieu, (lieu === 0) ? galliance : ze_Analyser_URL('alliance'), document);
	}
	else {
		localStorage.setItem('zzzelp_MAJ_rangs_' + ze_serveur, time_fzzz());
		new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'rangs_script?alliance=' + galliance + '&', force : mode },
			{ success : function(valeurs) {
				localStorage.setItem('zzzelp_rangs_' + ze_serveur, JSON.stringify(valeurs));
				ze_Affichage_rangs(valeurs, lieu, (lieu === 0) ? galliance : ze_Analyser_URL('alliance'), document);
				if(mode == 1) {
					ze_Inserer_message("Actualisation des rangs réussie", 3000);
				}
			}, authentication_issue : function() {
				ze_Importation_rang(lieu, 2);
			}
		});
	}
}

/* Affiche les rangs importés depuis Zzzelp */
function ze_Affichage_rangs(rangs, lieu, alliance, zone) {
	if(zone.querySelector('#tabMembresAlliance') === null) {
		setTimeout(function(){
			ze_Affichage_rangs(rangs, lieu, alliance, zone);
		},50);
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
				for(n=0; n<rangs.length; n++) {
					if(rangs[n].alliances === null || ~rangs[n].alliances.indexOf(alliance)) {
						if(rangs[n].mode === '0' && in_array(pseudo, rangs[n].regle)) {
							ze_Application_rang(lignes[i], rangs[n].rang_affiche, rangs[n].couleur, rangs[n].role, l);
						}
					}
				}
				for(n=0; n<rangs.length; n++) {
					if(rangs[n].alliances === null || ~rangs[n].alliances.indexOf(alliance)) {
						if(rangs[n].mode == '1' && in_array(alliance, rangs[n].regle)) {
							ze_Application_rang(lignes[i], rangs[n].rang_affiche, rangs[n].couleur, rangs[n].role, l);
						}
					}
				}
				for(n=0; n<rangs.length; n++) {
					if(rangs[n].alliances === null || ~rangs[n].alliances.indexOf(alliance)) {
						if(rangs[n].mode == '2' && rang.match(rangs[n].regle)) {
							var rep = new RegExp(rangs[n].regle).exec(rang);
							var resultat = rangs[n].rang_affiche;
							for(t=1;t<rep.length; t++) {
								resultat = resultat.replace('$' + (t), rep[t]);
							}
							ze_Application_rang(lignes[i], resultat, rangs[n].couleur, rangs[n].role, l);					
						}
					}
				}
				for(n=0; n<rangs.length; n++) {
					if(rangs[n].alliances === null || ~rangs[n].alliances.indexOf(alliance)) {
						if(rangs[n].mode == '3' && ~rang.indexOf(rangs[n].regle)) {
							ze_Application_rang(lignes[i], rangs[n].rang_affiche, rangs[n].couleur, rangs[n].role, l);
						}
					}
				}
			}
		}
		if(lieu === 0) {
			ze_Affichages_limites_membres(true);
		}
	}
}

/* Récupère les rôles de chaque joueur pour analyser la chaine */
function ze_Recuperer_chaine(zone) {
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
}

/* Applique le rang (couleur et/ou rang) */
function ze_Application_rang(ligne, valeur, couleur, role, l) {
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
}

/* Ajoute les checkbox pour afficher ou non certains groupes de joueurs ainsi que le tableau des totaux */
function ze_Affichages_limites_membres(mode) {
	if(document.querySelector('img[src*="1rondvert.gif"]') === null) {
		setTimeout(function(){
			ze_Affichages_limites_membres(mode);
		},25);
	}
	else if(document.querySelectorAll('[data-rang_zzzelp="1"]').length === 0) {
		setTimeout(function(){
			ze_Affichages_limites_membres(mode);
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
		if(mode) {
			if(document.querySelectorAll('#affichage_hors_chaine').length === 0) {
				setTimeout(function(){
					ze_Affichages_limites_membres(true);
				},25);
			}
			else {
				ze_MAJ_affichage_rangs(roles);
			}
		}
		else {
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
				input.checked = ze_Affichage_role_rang(role);
				input.onclick = function onclick(event) {
					ze_MAJ_affichage_rangs(roles);
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
		}
	}
}

/* Initialisation de l'affichage des différents groupes de joueurs (Page Membre) */
function ze_Affichage_role_rang(role) {
	if(!localStorage['zzzelp_affichage_roles_' + ze_serveur]) {
		localStorage['zzzelp_affichage_roles_' + ze_serveur] = JSON.stringify({grenier : true,passeur : true,chasseur : true, allie : true,hors_chaine : true});
	}
	var affichages_roles = JSON.parse(localStorage['zzzelp_affichage_roles_' + ze_serveur]);
	return affichages_roles[role];
}

/* Applique une modification d'affichage sur une des checkbox gérant les différents groupes (Page Membre) */
function ze_MAJ_affichage_rangs(roles) {
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
}