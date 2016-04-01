/* Calcul l'heure de départ d'un joueur en fonction de ces pontes et de son tdp */
function ze_MAJ_heure_retour_parser(secondes, tdp, zone_tdp) {
	var duree = parseInt(Math.pow(0.9, tdp) * secondes);
	zone_tdp.querySelector('.temps_zzzelp').innerHTML = ze_Secondes_date(duree, true);
}

/* Initialise l'analyse des chasses */
function ze_Analyser_chasses(id) {
	if(document.querySelector('#table_liste_conversations').rows[document.querySelector('#' + id).rowIndex + 2].querySelectorAll('.lien_voir_precedent').length > 0) {
		document.querySelector('#table_liste_conversations').rows[document.querySelector('#' + id).rowIndex + 2].querySelector('.lien_voir_precedent').click();
		setTimeout(function(){
			ze_Analyser_chasses(id);
		},1);
	}
	else {
		var zone = ze_Initialisation_affichage_RC(id),
			chasses = document.querySelector('#table_liste_conversations').rows[document.querySelector('#' + id).rowIndex + 2].querySelectorAll('tr[id*=message_] .message'),
			dates = document.querySelector('#table_liste_conversations').rows[document.querySelector('#' + id).rowIndex + 2].querySelectorAll('tr[id*=message_] .expe span span'),
			donnees = { detail : [], total : {} };
		for(var i=0; i<chasses.length; i++) {
			var valeurs = ze_Analyse_chasse(chasses[i].innerHTML.split('<br>'));
			valeurs.date = ze_Date_to_timestamp_v1(dates[i].innerHTML);
			donnees.detail.push(ze_Analyse_valeurs_chasses(valeurs));
		}
		donnees.total = ze_Fusion_donnees_chasse(donnees.detail);
		ze_Mise_en_page_chasses(zone, donnees);
	}
}

/* Analyse un rapport de chasse */
function ze_Analyse_chasse(lignes) {
	var valeurs = {
			mode : 'chasse',
			TDC_chasse : 0,
			nourriture : 0,
			attaquant : {
					morts : [],
					total_morts : 0,
					degats : [],
					unites_XP : []
						},
			defenseur : {
					morts : [],
					total_morts : 0,
					degats : []
						}
				};
	for(var i=0; i<lignes.length; i++) {
		var ligne = lignes[i], variables;
		if(ligne.match(new RegExp('Troupes en attaque( |):( |)([^.]+)'))) {
			valeurs.attaquant.armee = ze_Analyse_armee(new RegExp('Troupes en attaque( |):( |)([^.]+)').exec(ligne)[3]);
		}
		else if(ligne.match(new RegExp('Troupes en défense( |):( |)([^.]+)'))) {
			valeurs.defenseur.armee = ze_Analyse_armee(new RegExp('Troupes en défense( |):( |)([^.]+)').exec(ligne)[3], 'chasse');
		}
		else if(ligne.match(new RegExp('Vous infligez <strong>([ 0-9]+)\\(\\+([ 0-9]+)\\)<\\/strong> dégâts et tuez <strong>([ 0-9]+)<\\/strong> ennemie|ennemies'))) {
			variables = new RegExp('Vous infligez <strong>([ 0-9]+)\\(\\+([ 0-9]+)\\)<\\/strong> dégâts et tuez <strong>([ 0-9]+)<\\/strong> ennemie|ennemies').exec(ligne);
			valeurs.defenseur.morts.push(parseInt(variables[3].replace(/ /g, '')));
			valeurs.defenseur.total_morts += parseInt(variables[3].replace(/ /g, ''));
			valeurs.attaquant.degats.push({ HB : parseInt(variables[1].replace(/ /g, '')), bonus : parseInt(variables[2].replace(/ /g, ''))});
		}
		else if(ligne.match(new RegExp('ennemie inflige <strong>([ 0-9]+)\\(\\+([ 0-9]+)\\)<\\/strong> dégâts à vos fourmis et en tue <strong>([ 0-9]+)<\\/strong>'))) {
			variables = new RegExp('ennemie inflige <strong>([ 0-9]+)\\(\\+([ 0-9]+)\\)<\\/strong> dégâts à vos fourmis et en tue <strong>([ 0-9]+)<\\/strong>').exec(ligne);
			valeurs.attaquant.morts.push(parseInt(variables[3].replace(/ /g, '')));
			valeurs.attaquant.total_morts += parseInt(variables[3].replace(/ /g, ''));
			valeurs.defenseur.degats.push({ HB : parseInt(variables[1].replace(/ /g, '')), bonus : parseInt(variables[2].replace(/ /g, ''))});
		}
		else if(ligne.match(new RegExp('- ([0-9 ]+) ([^\/]+) sont devenues des <strong>([^\/]+)<\\/strong>'))) {
			variables = new RegExp('- ([0-9 ]+) ([^\/]+) sont devenues des <strong>([^\/]+)<\\/strong>').exec(ligne);
			valeurs.attaquant.unites_XP.push({ 
				nombre : parseInt(variables[1].replace(/ /g, '')), 
				avant : ((ZzzelpScriptArmee.noms_pluriel.indexOf(variables[2]) >= 0)?ZzzelpScriptArmee.noms_pluriel.indexOf(variables[2]):ZzzelpScriptArmee.noms_singulier.indexOf(variables[2])), 
				apres : ((ZzzelpScriptArmee.noms_pluriel.indexOf(variables[3]) >= 0)?ZzzelpScriptArmee.noms_pluriel.indexOf(variables[3]):ZzzelpScriptArmee.noms_singulier.indexOf(variables[3]))});
		}
		else if(ligne.match(new RegExp('Vos chasseuses ont conquis <strong>([0-9 ]+) cm(²|2)<\\/strong>, les carcasses des prédateurs vous rapportent <strong>([0-9 ]+)<\\/strong>'))) {
			variables = new RegExp('Vos chasseuses ont conquis <strong>([0-9 ]+) cm(²|2)<\\/strong>, les carcasses des prédateurs vous rapportent <strong>([0-9 ]+)<\\/strong>').exec(ligne);
			valeurs.TDC_chasse = parseInt(variables[1].replace(/ /g, ''));
			valeurs.nourriture = parseInt(variables[3].replace(/ /g, ''));
		}
	}
	return valeurs;
}

/* Calcul les données possibles avec les rapports de chasses */
function ze_Analyse_valeurs_chasses(valeurs) {
	valeurs.attaquant.armee_apres = ze_Extraction_armee(valeurs.attaquant.armee, ze_Calcul_capa_flood(valeurs.attaquant.armee) - valeurs.attaquant.total_morts);
	valeurs.attaquant.HOF_avant = ze_Calcul_annees_HOF(valeurs.attaquant.armee);
	valeurs.attaquant.armes = ze_Calcul_armes(valeurs.attaquant.degats[0]);
	valeurs.attaquant.armee_XP = ze_Application_XP(valeurs.attaquant.armee_apres, valeurs.attaquant.unites_XP);
	valeurs.attaquant.niveaux_vie = ze_Recherche_niveaux_vie_RC(valeurs.attaquant.morts[0], valeurs.attaquant.armee, valeurs.defenseur.degats[0], 0);
	valeurs.attaquant.HOF_apres = ze_Calcul_annees_HOF(valeurs.attaquant.armee_apres);
	valeurs.attaquant.HOF_pertes =  valeurs.attaquant.HOF_avant - valeurs.attaquant.HOF_apres;
	
	valeurs.defenseur.armee_apres = ze_Extraction_armee(valeurs.defenseur.armee, ze_Calcul_capa_flood(valeurs.defenseur.armee) - valeurs.defenseur.total_morts);
	valeurs.defenseur.HOF_avant = ze_Calcul_annees_HOF(valeurs.defenseur.armee);
	valeurs.defenseur.HOF_apres = ze_Calcul_annees_HOF(valeurs.defenseur.armee_apres);
	valeurs.defenseur.HOF_pertes =  valeurs.defenseur.HOF_avant - valeurs.defenseur.HOF_apres;	
	
	return valeurs;
}

/* Calcul les valeurs totales (TDC | nourriture etc...) */
function ze_Fusion_donnees_chasse(chasses) {
	valeurs = {
		TDC_chasse : 0,
		nourriture : 0,
		date : 0,
		attaquant : {
			armee : new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0),
			armee_apres : new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0),
			armee_XP : new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0),
			HOF_avant : 0,
			HOF_apres : 0,
			HOF_pertes : 0,
			armes : 0,
			niveaux_vie :[]
		},
		defenseur : {
			armee : new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),
			armee_apres : new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),
			HOF_avant : 0,
			HOF_apres : 0,
			HOF_pertes : 0
		}
	};
	for(var i=0; i<chasses.length; i++) {
		valeurs.TDC_chasse += chasses[i].TDC_chasse;
		valeurs.nourriture += chasses[i].nourriture;
		if(i === 0) {
			valeurs.attaquant.armes = chasses[i].attaquant.armes;
			valeurs.attaquant.niveaux_vie = chasses[i].attaquant.niveaux_vie;
			valeurs.date = chasses[i].date;
		}
		for(var j=0; j<14; j++) {
			valeurs.attaquant.armee[j] += chasses[i].attaquant.armee[j];
			valeurs.attaquant.armee_apres[j] += chasses[i].attaquant.armee_apres[j];
			valeurs.attaquant.armee_XP[j] += chasses[i].attaquant.armee_XP[j];
		}
		for(j=0; j<17; j++) {
			valeurs.defenseur.armee[j] += chasses[i].defenseur.armee[j];
			valeurs.defenseur.armee_apres[j] += chasses[i].defenseur.armee_apres[j];
		}
		valeurs.attaquant.HOF_avant += chasses[i].attaquant.HOF_avant;
		valeurs.attaquant.HOF_apres += chasses[i].attaquant.HOF_apres;
		valeurs.attaquant.HOF_pertes += chasses[i].attaquant.HOF_pertes;
		valeurs.defenseur.HOF_avant += chasses[i].defenseur.HOF_avant;
		valeurs.defenseur.HOF_apres += chasses[i].defenseur.HOF_apres;
		valeurs.defenseur.HOF_pertes += chasses[i].defenseur.HOF_pertes;
	}
	return valeurs;
}

/* Fonction de mise en page de l'analyse du RC et des boutons pour l'utiliser */
function ze_Mise_en_page_chasses(zone, valeurs) {
	zone.bouton.scrollIntoView(true);
	var lignes = ze_Mise_en_page_contenu_chasses(zone, valeurs);
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
	contenu_FE.value = '[center][table]\n' + resultat_BBCode_FE + '[/table][/center]';
	contenu_FI.value = '[center]\n[code]\n' + resultat_BBCode_FI + '\n[/code]\n[/center]';
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
	
	zone.zone.appendChild(zone_RC);
	zone.zone.appendChild(raccourci_FE);
	zone.zone.appendChild(contenu_FE);	
	zone.zone.appendChild(raccourci_FI);
	zone.zone.appendChild(contenu_FI);
}


/* Génère une mise en page HTML, BBCode FI et BBCode FE d'un RC */
function ze_Mise_en_page_contenu_chasses(zone, valeurs) {
	var lignes = [];
	
	// ENTETES
	lignes.push(ze_Separation_Parser());
	lignes.push(ze_Generation_ligne([ze_Generation_date_v1(valeurs.total.date)]));
	lignes.push(ze_Separation_Parser());
	
	// GENERAL
	lignes.push(ze_Generation_ligne(['<strong>Bilan de la chasse</strong>']));
	lignes.push(ze_Separation_Parser());
	lignes.push(ze_Generation_ligne(['TDC chassé :', '', ze_Nombre(valeurs.total.TDC_chasse)]));
	lignes.push(ze_Generation_ligne(['Unités perdues :', '',ze_Nombre(ze_Calcul_capa_flood(valeurs.total.attaquant.armee) - ze_Calcul_capa_flood(valeurs.total.attaquant.armee_XP))]));
	lignes.push(ze_Generation_ligne(['Nourriture rapportée :', '',ze_Nombre(valeurs.total.nourriture)]));

	// ARMEES
	lignes.push(ze_Separation_Parser());
	lignes.push(ze_Generation_ligne(['<strong>Armées</strong>']));
	lignes.push(ze_Separation_Parser());
	lignes.push(ze_Generation_ligne(['<strong>Avant</strong>', '', '<strong>Après</strong>', '']));

	for(var i=0;i<14;i++) {
		lignes.push(ze_Generation_ligne([
			ze_Nombre(valeurs.total.attaquant.armee[i]),
			ZzzelpScriptArmee.TAGs[i],
			ze_Nombre(valeurs.total.attaquant.armee_XP[i]),
			String((valeurs.total.attaquant.armee[i] > 0) ? ze_Affichage_pourcentage(valeurs.total.attaquant.armee_XP[i]/valeurs.total.attaquant.armee[i]) : 0) + '%'
										]));
	}
	
	// DETAIL DES CHASSES
	lignes.push(ze_Separation_Parser());
	lignes.push(ze_Generation_ligne(['<strong>Détail des chasses</strong>']));
	lignes.push(ze_Separation_Parser());
	lignes.push(ze_Generation_ligne(['','<strong>TDC chassé</strong>','<strong>Pertes</strong>','<strong>Réplique</strong>']));
	for(i=0; i<valeurs.detail.length; i++) {
		lignes.push(ze_Generation_ligne([
			'Chasse n°' + (i+1),
			ze_Nombre(valeurs.detail[i].TDC_chasse),
			ze_Nombre(ze_Calcul_capa_flood(valeurs.detail[i].attaquant.armee) - ze_Calcul_capa_flood(valeurs.detail[i].attaquant.armee_XP)),
			String(parseInt(ze_Calcul_replique(valeurs.detail[i].attaquant.armee, valeurs.detail[i].defenseur.armee, valeurs.total.attaquant.armes)*100)) + '%'
										]));
	}
	lignes.push(ze_Separation_Parser());
	return lignes;
}

