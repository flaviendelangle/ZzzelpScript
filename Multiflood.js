function ZzzelpScriptMultiflood() {
	var MF = this;

	this.init = function() {
		MF.addAnimation();
		MF.getDataExplicit();
		MF.getDataImplicit();
		new ZzzelpScriptTraceur({ alliances : MF.alliances, joueurs : MF.joueurs }, MF.sendMF);
	};

	this.getDataExplicit = function() {
		if(ze_Analyser_URL('alliances') == '[]') {
			MF.alliances = [];
		}
		else {
			MF.alliances = ze_Analyser_URL('alliances').substr(1,ze_Analyser_URL('alliances').length-2).replace(/ /g, '').split(',');	
		} 
		if(ze_Analyser_URL('joueurs') == '[]') {
			MF.joueurs = [];
		}
		else {
			MF.joueurs = ze_Analyser_URL('joueurs').substr(1,ze_Analyser_URL('joueurs').length-2).replace(/ /g, '').split(',');	
		}		
	};

	this.getDataImplicit = function() {
		var prio_traceur = ZzzelpScript.parameters('donnees_traceur'),
			a_importer = [],
			traceur = [],
			i;
		if(prio_traceur.alliances.length > 0 && prio_traceur.nombre > 0) {
			for(i=0; i<prio_traceur.alliances.length; i++) {
				if(!(prio_traceur.alliances[i] in MF.alliances)) {
					a_importer.push({
						nom : prio_traceur.alliances[i], 
						mode : 'alliance'
					});
				}
			}
		}
		if(prio_traceur.joueurs.length > 0 && prio_traceur.nombre > 0) {
			for(i=0; i<prio_traceur.joueurs.length; i++) {
				if(!(prio_traceur.joueurs[i] in MF.joueurs)) {
					a_importer.push({
						nom : prio_traceur.joueurs[i], 
						mode : 'joueur'
					});
				}
			}
		}
		for(i=0; i<prio_traceur.nombre; i++) {
			if(a_importer.length > 0) {
				var index = parseInt(a_importer.length * Math.random()),
					choisi = a_importer.splice(index, 1)[0];
				if(choisi.mode == 'alliance') {
					MF.alliances.push(choisi.nom);
				}
				else {
					MF.joueurs.push(choisi.nom);
				}
			}
		}
		if(!(gpseudo in MF.joueurs) && !(galliance in MF.alliances)) {
			MF.joueurs.push(gpseudo);
		}
	};

	this.addAnimation = function() {
		var txt = '<div style="font-weight:bold;color:red;font-size:1.1em;">Chargement du Multiflood en cours</div><div class="loading">';
		txt += '<span class="loader"></span><span class="loader"></span><span class="loader"></span><span class="loader"></span></div>';
		document.querySelector('center').innerHTML = txt + document.querySelector('center').innerHTML;
	};

	this.sendMF = function(data) {
		var hash = SHA256(gpseudo + ze_serveur + time());
		MF.capa_flood = ZzzelpScriptArmee.getArmee(document, 0).getCapaFlood();
		MF.getDataExplicit();
		data.a_afficher = { 
			alliances : MF.alliances,
			joueurs : MF.joueurs
		};
		var form = document.createElement('form'),
			input = document.createElement('input');
		form.setAttribute('method', 'POST');
		form.setAttribute('action', url_zzzelp + '/MF/tableau?serveur=' + ze_serveur + '&cf=' + MF.capa_flood + '&hash=' + hash + '&mode=auto');
		input.setAttribute('name', 'donnees_alliance');
		input.type = 'hidden';
		input.value = encodeURIComponent(JSON.stringify(data));
		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	};

	this.init();
}

/* Lance la récupération des coordonnées pour Zzzelpfloods et lance la fonction de préparation pour le Profil (Page Profil) */
function ze_Initialisation_Zzzelpfloods_profil(armee) {
	var capa_flood = armee.getCapaFlood(),
		pseudo = ze_Analyser_URL('Pseudo');
	ze_Lancement_Zzzelpfloods_profil(capa_flood, 1, pseudo);
}

/* Préparation de Zzzelpfloods pour le Profil (Page Profil) */
function ze_Lancement_Zzzelpfloods_profil(capa_flood, n, pseudo, TDC_cible, mode_opti, lancement_auto) {
	new ZzzelpScriptCoordonnees([pseudo], [], function(coordonnees) {
		var TDC_cible = parseInt(document.querySelector('.tableau_score').rows[1].cells[1].innerHTML.replace(/ /g, ''));
		if(n === 0 || (pseudo != gpseudo && gTDC <= 2*TDC_cible && TDC_cible <= gTDC*3)) {
			var joueurs = [{}],
				cadre = document.createElement('div');
			joueurs[0][gpseudo] = coordonnees[gpseudo];
			joueurs[0][pseudo] = coordonnees[pseudo];
			joueurs[0][gpseudo].TDC = gTDC;
			joueurs[0][pseudo].TDC = (typeof TDC_cible == 'undefined') ? parseInt(document.querySelector('.tableau_score').rows[1].cells[1].innerHTML.replace(/ /g, '')) : TDC_cible;
			cadre.setAttribute('class', 'boite_membre');
			if(n === 0) {
				document.querySelector('#centre').appendChild(cadre);
			}
			else {
				document.querySelector('#centre center').insertBefore(cadre, document.querySelectorAll('.boite_membre')[2]);
			}
			var donnees = {
				pseudo : gpseudo,
				serveur : ze_serveur,
				vitesse_attaque : zzzelp.compte.getVitesseAttaque(),
				nombre_unites : capa_flood,
				coordonnees : joueurs,
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
				lancement_auto : lancement_auto
					};
			if(typeof mode_opti != 'undefined') {
				donnees.mode = mode_opti;
			}
			console.log(donnees);
			Generation_floods(cadre, donnees);
		}
	});
}