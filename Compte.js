function ZzzelpScriptCompte() {

	var that = this;
	that.localStorageKey = 'zzzelp_niveaux';
	that.lieux = ['construction', 'laboratoire'];

	/*
		Initialisation et mise à jour des niveaux
	*/ 

	this.init = function() {
		var niveaux = that.getLocalStorage();
		if(niveaux === null) {
			that.getNiveauxAjax('construction', that.nextStepUpdateNiveaux);
		}
		else {
			var last_update = Math.min(that.niveaux.construction.update_local, that.niveaux.laboratoire.update_local);
			if(time_fzzz() - last_update > 86400) {
				that.getNiveauxAjax('construction', that.nextStepUpdateNiveaux);
			}
		}
	};

	this.getLocalStorage = function() {
		var niveaux = localStorage.getItem(that.localStorageKey);
		if(niveaux === null) {
			that.initNiveaux();
			return null;
		}
		else {
			try {
				niveaux = JSON.parse(niveaux);
				if(that.isValidNiveaux(niveaux)) {
					that.niveaux = niveaux;
					return niveaux;
				}
				that.initNiveaux();
				return null;
			}
			catch(e) {
				that.initNiveaux();
				return null;
			}
		}		
	};

	this.initNiveaux = function() {
		this.niveaux = {
			construction : {
				valeurs : new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0),
				update_local : 0,
				update_zzzelp : 0
			},
			laboratoire : {
				valeurs : new Array(0,0,0,0,0,0,0,0,0,0,0,0),
				update_local : 0,
				update_zzzelp : 0
			},
			reine : {
				update_zzzelp : 0
			}
		};
	};

	this.isValidNiveaux = function(niveaux) {
		if(typeof niveaux == 'undefined') {
			return false;
		}
		else if(typeof niveaux.construction == 'undefined') {
			return false;
		}
		else if(typeof niveaux.laboratoire == 'undefined') {
			return false;
		}
		else if(typeof niveaux.reine == 'undefined') {
			return false;
		}
		return true;
	};

	this.nextStepUpdateNiveaux = function(niveaux) {
		that.niveaux.construction.valeurs = niveaux;
		that.niveaux.construction.update_local = time_fzzz();
		that.getNiveauxAjax('laboratoire', function(niveaux) {
			that.niveaux.laboratoire.valeurs = niveaux;
			that.niveaux.laboratoire.update_local = time_fzzz();			
			that.updateLocalStorage();
		});
	};

	this.getNiveauxAjax = function(lieu, callback) {
		new ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : lieu + '.php', addDOM : true },
			{ success : function(zone_page) {
				var niveaux = that.getNiveauxDOM(zone_page, lieu, 1);	
				if(callback) {
					callback(niveaux);
				}	
			}
		});
	};

	this.updateLocalStorage = function() {
		localStorage.setItem(that.localStorageKey, JSON.stringify(that.niveaux));	
	};

	//function ze_MAJ_niveaux(zone, lieu, interne, mode) {
	this.getNiveauxDOM = function(zone, lieu, mode) {
		var niveauxDOM = zone.querySelectorAll('.niveau_amelioration'),
			niveaux = (lieu === 'construction') ? new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0) : new Array(0,0,0,0,0,0,0,0,0,0,0,0),
			en_cours = zone.querySelectorAll('#centre > strong'),
			i, valeurs;
		for(i=0; i<en_cours.length; i++) {
			var bat = new RegExp('-(.*) ([0-9]+) (se termine|terminé) dans').exec(en_cours[i].innerHTML)[1].trim();
			niveaux[niveaux.length-2+i] = (in_array(lieu, ['constructions', 'construction']) ? Constructions.indexOf(bat) : Recherches.indexOf(bat)) + 1;
		}
		for (i=0;i<niveauxDOM.length;i++) {
			if(niveauxDOM[i].innerHTML.match(new RegExp('niveau ([0-9]+) -&gt; ([0-9]+)'))) {
				valeurs = new RegExp('niveau ([0-9]+) -&gt; ([0-9]+)').exec(niveauxDOM[i].innerHTML);
			}
			else if(niveauxDOM[i].innerHTML.match(new RegExp('niveau ([0-9]+)'))) {
				valeurs = new RegExp('niveau ([0-9]+)').exec(niveauxDOM[i].innerHTML);
			}
			niveaux[i] = parseInt(valeurs[1]);			
		}
		if(url.indexOf('&iz') > 0 || ZzzelpScript.parameters('parametres', ['synchronisation', 'synchro_niveaux'])) {
			new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'niveaux_script?lieu=' + lieu + '&niveaux=[' + niveaux + ']&' },
				{ authentication_issue : function(valeurs) {
					that.getNiveauxDOM(zone, lieu, interne, 2);
				}
			});
			that.niveaux[lieu].update_zzzelp = time_fzzz();
		}
		return niveaux;
	};


	/*
		Récupération des dates de modification
	*/
	this.getUpdateConstruction = function() {
		return that.niveaux.construction.update_zzzelp;	
	};

	this.getUpdateLaboratoire = function() {
		return that.niveaux.laboratoire.update_zzzelp;	
	};

	this.getUpdateReine = function() {
		return that.niveaux.reine.update_zzzelp;	
	};




	/*
		Récupération des niveaux à partir du cache
	*/

	this.getCouveuse = function() {
		return that.niveaux.construction.valeurs[3];
	};

	this.getSolarium = function() {
		return that.niveaux.construction.valeurs[4];
	};

	this.getLaboratoire = function() {
		return that.niveaux.construction.valeurs[5];
	};

	this.getDome = function() {
		return that.niveaux.construction.valeurs[9];
	};

	this.getLoge = function() {
		return that.niveaux.construction.valeurs[10];
	};

	this.getEtablePucerons = function() {
		return that.niveaux.construction.valeurs[11];
	};

	this.getTechniquedePonte = function() {
		return that.niveaux.laboratoire.valeurs[0];
	};

	this.getArmes = function() {
		return that.niveaux.laboratoire.valeurs[2];
	};

	this.getBouclier = function() {
		return that.niveaux.laboratoire.valeurs[1];
	};

	this.getVitesseAttaque = function() {
		return that.niveaux.laboratoire.valeurs[6];
	};

	this.getVitesseChasse = function() {
		return that.niveaux.laboratoire.valeurs[5];
	};

	this.getTDP = function() {
		return that.getCouveuse() + that.getSolarium() + that.getTechniquedePonte();
	};





	/*	
		Mise à jour des ouvrières
	*/
	this.updateOuvrieres = function(mode, ouvrieres) {
		if(~url.indexOf('iz') || ZzzelpScript.parameters('parametres', ['base', 'import_auto_niveaux'])) {
			if(ComptePlus) {
				ouvrieres = document.querySelectorAll('span[id*="armee_initial"]')[0].innerHTML;
			}
			if(typeof ouvrieres == 'undefined') {
				that.getOuvrieresAjax(mode);
			}
			else {
				var entrepots = document.querySelectorAll('.ligne_boite_info span'),
					nourriture = parseInt(entrepots[1].innerHTML.replace(/ /g, '')),
					materiaux = parseInt(entrepots[2].innerHTML.replace(/ /g, '')),
					url_ajax = 'niveaux_script?lieu=ouvrieres&ouvrieres=' + ouvrieres + '&nourriture=' + nourriture + '&materiaux=' + materiaux + '&';
				new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : url_ajax },
					{ authentication_issue : function(valeurs) {
						that.updateOuvrieres(2, ouvrieres);	
					}
				});
				that.niveaux.reine.update_zzzelp = time_fzzz();
				that.updateLocalStorage();
			}
		}
	};


	that.getOuvrieresAjax = function(mode) {
		new ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : 'commerce.php', addDOM : true },
			{ success : function(zone_page) {
				var elements = zone_page.querySelectorAll('#centre strong'),
					convois = [],
					regexp = new RegExp('- Vous allez livrer ([0-9 ]+) <img (.*)> et ([0-9 ]+) <img (.*)> à  <a (.*)>(.*)<\\/a> dans (.*)');
				for(var i=0; i<elements.length; i++) {
					if(elements[i].innerHTML.match(regexp)) {
						var resultats = regexp.exec(elements[i].innerHTML);
						convois.push(parseInt(resultats[1].replace(/ /g, '')));
						convois.push(parseInt(resultats[3].replace(/ /g, '')));
					}
				}
				new ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : 'construction.php', addDOM : true },
					{ success : function(zone_page) {
						var ligne = zone_page.querySelectorAll('.niveau_amelioration')[11],
							etable;
						if(ligne.innerHTML.match(new RegExp('niveau ([0-9]+) -&gt; ([0-9]+)'))) {
							etable = parseInt(new RegExp('niveau ([0-9]+) -&gt; ([0-9]+)').exec(ligne.innerHTML)[1]);
						}
						else if(ligne.innerHTML.match(new RegExp('niveau ([0-9]+)'))) {
							etable = parseInt(new RegExp('niveau ([0-9]+)').exec(ligne.innerHTML)[1]);
						}
						var ouvrieres = parseInt(gouvrieres);
						for(var i=0; i<convois.length; i++) {
							ouvrieres += Math.ceil(convois[i] / (10 + etable * 0.5));
						}
						that.updateOuvrieres(mode, ouvrieres);
					}
				});
			}
		});
	};

	this.init();
}