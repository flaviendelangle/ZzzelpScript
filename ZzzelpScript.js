function ZzzelpScript() {

	var zzzelp = this;

	this.version = {
		str : '3.2.3',
		int : 3.23
	};
	this.debug_mode = false;

	this.page_loader = {
		Armee : function() {
			if(~url.indexOf('&zmf')) {
				new ZzzelpScriptMultiflood();
			}
			else if(~url.indexOf('?icz')) {
				var armee = ZzzelpScriptArmee.getArmee(document, 0);
				document.location.href = url_zzzelp + '/chasses/preparation?serveur=' + ze_serveur + '&armee=[' + armee.unites + ']';
			}
			else if(~url.indexOf('?lg')) {
				new ZzzelpScriptAideGhost(zzzelp);
			}
			else if(~document.location.href.indexOf('&lf') || ~document.location.href.indexOf('&lz')) {
				LancementZzzelpflood();
			}
			else if(~url.indexOf('&ar')) {
				ze_Aide_Relance(true);
			}
			else {
				var forbidden = 0;
				forbidden += ~url.indexOf('?lg') ? 1 : 0;
				forbidden += ~url.indexOf('?icz') ? 1 : 0;
				forbidden += ~url.indexOf('&zf') ? 1 : 0;
				forbidden += ~url.indexOf('&lf') ? 1 : 0;
				forbidden += ~url.indexOf('&lz') ? 1 : 0;
				forbidden += ~url.indexOf('&paz') ? 1 : 0;
				forbidden += ~url.indexOf('&zmf') ? 1 : 0;
				if(ZzzelpScript.parameters('parametres', ['perso', 'perso_page_armee']) && forbidden === 0) {
					new ZzzelpScriptPageArmee(zzzelp);
				}
				if(ComptePlus && ZzzelpScript.parameters('parametres', ['synchronisation', 'synchro_armee'])) {
					ZzzelpScriptArmee.getArmeeReine(ze_MAJ_armee);
				}
			}
		},

		alliance : function() {
			if (~url.indexOf('Membres')) {
				ze_Amelioration_membres_alliance(0);
				new ZzzelpScriptChaine().retrieve(0, 0);
			}
			else if(document.querySelectorAll('#formulaireChat').length > 0) {
				if(ZzzelpScript.parameters('parametres', ['perso', 'perso_smileys'])) {
					$('#formulaireChat').unbind('submit');
					document.querySelector('#formulaireChat').onsubmit = function onsubmit(e) {
						e.preventDefault();
						ze_Envoi_chat("alliance");
					};
					new ZzzelpScriptSmileys('CA');
				}
			}
			else if (~url.indexOf('messCollectif') && ZzzelpScript.parameters('parametres', ['perso', 'perso_smileys'])) {
				new ZzzelpScriptSmileys('MC');
			}
			else if (~url.indexOf('forum_menu')) {
				new ZzzelpScriptForum();
				var ID_sujet = ze_Analyser_URL('ID_sujet');
				if (ID_sujet) {
					xajax_callGetTopic(parseInt(ID_sujet));
				}
				if(ZzzelpScript.parameters('parametres', ['perso', 'perso_smileys'])) {
					ze_Amelioration_FI();
				}
			}
		},

		AcquerirTerrain : function() {
			new ZzzelpScriptChasses();
		},

		chat : function() {
			if(ZzzelpScript.parameters('parametres', ['perso', 'perso_smileys'])) {
				$('#formulaireChat').unbind('submit');
				document.querySelector('#formulaireChat').onsubmit = function onsubmit(event) {
					event.preventDefault();
					ze_Envoi_chat("general");
				};
				new ZzzelpScriptSmileys('CA');
			}
		},

		classementAlliance : function() {
			var alliance = ze_Analyser_URL('alliance');
			if (alliance) {
				new ZzzelpScriptChaine().retrieve(1, 0);	
				ze_Amelioration_membres_alliance();
				if(ZzzelpScript.parameters('parametres', ['perso', 'perso_page_description'])) {
					ze_Classement_alliance_guerre(alliance);
				}
				var url_MF =  '<li><a class="boutonReine" href="Armee.php?alliances=[' + alliance + ',' + galliance;
				url_MF += ']&joueurs=[]&zmf" target="_BLANK"><span></span>MF ' + alliance + '</a></li>';
				document.querySelector('#menuAlliance').innerHTML +=  url_MF;
				setTimeout(function(){
					if(typeof ze_Traceur != 'undefined') {
						ze_Traceur(alliance);
					}
				}, 500);
			}
		},

		classement2 : function() {
			ze_Amelioration_classement_alliances();
		},
					
		commerce : function() {
			if (~url.indexOf('&ID')) {
				ze_Envoi_convois();
			}
			else {
				ze_Validation_convois();
			}
		},
		
		compte : function() {
			ze_ModifCompte();
		},

		construction : function() {
			zzzelp.compte.getNiveauxDOM(document, 'construction', 1);
		},

		ennemie : function() {
			if(~url.indexOf('&la')) {
				ze_Lancement_attaque();
			}
			else if(ze_Analyser_URL('zauto') == 'true') {
				document.getElementsByName('ChoixArmee')[0].type= "hidden";
				document.querySelector('#formulaireChoixArmee').submit();				
			}
			else if(~url.indexOf('?Attaquer=')) {
				if(ZzzelpScript.parameters('parametres', ['perso', 'perso_lancement_attaques'])) {	
				new ZzzelpScriptPageLancementAttaques(zzzelp);
				}
			}
			else if(ZzzelpScript.parameters('parametres', ['perso', 'perso_lancement_attaques'])) {
				new ZzzelpScriptPageEnnemie();
			}
		},

		laboratoire : function() {
			zzzelp.compte.getNiveauxDOM(document, 'laboratoire', 1);
		},

				
		Membre : function() {
			var joueur = ze_Analyser_URL('Pseudo');
			if(ZzzelpScript.parameters('parametres', ['perso', 'perso_colonies'])) {
				ze_Amelioration_colonies();
			}
			if(joueur) {
				ZzzelpScriptArmee.getArmeeAjax(ze_Initialisation_Zzzelpfloods_profil);
				if(typeof ze_Ajout_raccourci_modal_profil != 'undefined') {
					ze_Ajout_raccourci_modal_profil();
				}				
			}
		},

		messagerie : function() {
			new ZzzelpScriptMessagerie();
		},

		Reine : function() {
			zzzelp.compte.updateOuvrieres(1);
		},
		
		Ressources : function() {
			if (~url.indexOf('valeur_convois')) {
				ze_MAJ_convois();
			}
			else {
				if (!ComptePlus) {
					ze_Affecter_ouvrieres();
				}
				ze_Affichage_resume_chasses();
				ze_Affichage_raccourci_chasses();
			}
		},
		
		tutorial : function() {
			if(~url.indexOf('?iv')) {
				new ZzzelpScriptRapport();
			}
			else if(~url.indexOf('?simu_chasses')) {
				new ZzzelpScriptBotChasse();
			}
		}
	};

	this.insertSyleSheet = function(url) {
		var stylesheet = document.createElement('link');
		stylesheet.href = url;
		stylesheet.rel = 'stylesheet';
		stylesheet.type = 'text/css';
		document.head.appendChild(stylesheet);
	};

	this.getParameters  = function(obligatoire, mode) {
		var menu = zzzelp.getParametersState(obligatoire, mode);
		if (typeof menu != 'undefined' && !zzzelp.debug_mode) {
			zzzelp.main();
		}
		else {
			localStorage.setItem('Maj_Parametres_Zzzelp' + ze_serveur, time_fzzz());
			new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'parametres_script?', force : mode },
				{ success : function(valeurs) {
					localStorage['zzzelp_parametres_' + ze_serveur] = JSON.stringify(valeurs);
					ze_getTimeZone();
					if(typeof mode == 'undefined' || mode < 4) {
						if(obligatoire) {
							ze_Inserer_message("Synchronisation avec Zzzelp réussie", 3000);
						}
						else {
							zzzelp.main();
						}
					}
				}, authentication_issue : function() {
					zzzelp.getParameters(obligatoire, 2);
				}, unknown_player : function() {
					zzzelp.main();
				}
			});
		}
	};

	this.getParametersState = function (obligatoire, mode) {
		if(mode == 2) {
			return undefined;
		}
		else if(typeof ZzzelpScript.parameters('version') == 'undefined' || ZzzelpScript.parameters('version') < zzzelp.version.int) {
			return undefined;
		}
		else if(typeof localStorage.getItem('Maj_Parametres_Zzzelp' + ze_serveur) == 'undefined') {
			return undefined;
		}
		else if(time() - localStorage.getItem('Maj_Parametres_Zzzelp' + ze_serveur) >= 900) {
			return undefined;
		}
		else if(obligatoire) {
			return undefined;
		}
		else {
			var reussi = localStorage.getItem('zzzelp_authreussie');
			if(ZzzelpScript.auth() < 2 && typeof reussi != 'undefined' && time_fzzz() - reussi < 86400*7) {
				return undefined;
			}
			try {
				return ZzzelpScript.parameters('menu');
			}
			catch(e) {
				return undefined;
			}
		}
	};

	this.setMenu = function(menu, nom) {
		var n = 0,
			actuel = document.querySelector('#' + nom);
		while(document.querySelectorAll('#' + nom + ' li').length % 3 && n<4) {
			n++;
			var vide = document.createElement('li');
			actuel.appendChild(vide);
		}
		var entete_menu = document.createElement('li'),
			barre = document.createElement('a');
		entete_menu.setAttribute('class', 'entete_menu_zzzelp');
		barre.setAttribute('class', 'barre_entete_zzzelp');
		barre.target = '_BLANK';
		barre.href = url_zzzelp;
		barre.innerHTML = 'Zzzelp';
		entete_menu.appendChild(barre);
		actuel.appendChild(entete_menu);
		if(typeof menu != "undefined") {
			actuel.innerHTML += menu;
		}
	};

	this.updateClock = function() {
		setInterval(function() {
			document.querySelector('#boiteComptePlus .titre_colonne_cliquable').innerHTML = ze_Generation_date_precise(time_fzzz());
		}, 50);
	};

	this.initHelp = function() {
		var li = document.createElement('li'),
			a = document.createElement('a');
		a.className = 'boutonIntro';
		a.setAttribute('style', 'cursor:pointer');
		a.onclick = function onclick(event) {
			new ZzzelpScriptAide('zzzelpscript');
		};
		a.innerHTML = '<span></span>Aide ZzzelpScript';
		li.appendChild(a);
		document.querySelector('#menuAide').appendChild(li);
	};

	this.main = function() {
		zzzelp.compte = new ZzzelpScriptCompte();
		if(document.location.pathname.length > 1) {
			new ZzzelpScriptCadre(zzzelp);
		}
		zzzelp.updateClock();
		zzzelp.setMenu(ZzzelpScript.parameters('menu'), 'menuAlliance');
		zzzelp.setMenu(ZzzelpScript.parameters('menucplus'), 'menuComptePlus');
		zzzelp.initHelp();
		if(ZzzelpScript.parameters('parametres', ['perso', 'perso_menu_contextuel'])) {
			new ZzzelpScriptRightClick();
		}
		if(ZzzelpScript.auth() == 2) {
			var page = new RegExp('([a-zA-Z1-9]+).php').exec(document.location.pathname)[1];
			if(page in zzzelp.page_loader) {
				zzzelp.page_loader[page]();
			}
		}
	};

	this.init = function() {
		if(Connecte) {
			zzzelp.insertSyleSheet(url_zzzelp + 'Style/zzzelpUI.css');
			zzzelp.insertSyleSheet(url_zzzelp + 'Style/fonts.css');
			zzzelp.getParameters(false);
		}
	};

	this.init();
}

ZzzelpScript.parameters = function(section, optionnels) {
	try {
		var parametres = JSON.parse(localStorage['zzzelp_parametres_' + ze_serveur]);
		if(section == 'parametres') {
			if(parametres.parametres[optionnels[0]].parametres[optionnels[1]].hasOwnProperty('active')) {
				return parametres.parametres[optionnels[0]].parametres[optionnels[1]].active == '1';
			}
			else {
				return parametres.parametres[optionnels[0]].parametres[optionnels[1]].valeur;
			}
		}
		else if(section == 'ghosts') {
			return parametres.ghosts[optionnels[0]];
		}
		else if(section == '*') {
			return parametres;
		}
		else if(in_array(section, ['sondes', 'antisonde', 'donnees_traceur', 'menu', 'menucplus', 'modules', 'smileys', 
								   'membres', 'fichiers', 'traceur_perso', 'version', 'script_prive', 'FI_guerre'])) {
			return parametres[section];
		}
	}
	catch(e) {
		return undefined;
	}	
};

ZzzelpScript.auth = function() {
	return ze_readCookie('zzzelp_etat_auth_' + ze_serveur);		
};








if(typeof document.querySelector('#pseudo') != 'undefined' && ~url.indexOf('fourmizzz.fr/')) {
	var url_zzzelp = 'http://test.zzzelp.fr/',
		coordonnees_souris = {
			x: 0,
			y: 0
		},
		zzzelp_errors = new ZzzelpScriptErrors(),
		zzzelp = new ZzzelpScript();
}