function ZzzelpScriptCoordonnees(joueurs, alliances, callback) {

	var that = this;

	this.joueurs = joueurs;
	this.alliances = alliances;
	this.callback = callback;
	this.localStorageKey = 'zzzelp_coordonnees_' + ze_serveur;

	this.get = function() {
		var pseudos = [];
		for (var i=0; i<that.joueurs.length; i++) {
			var pseudo = that.joueurs[i];
			if(typeof that.coordonnees[pseudo] == 'undefined') {
				pseudos.push(pseudo);
			}
		}
		if(!in_array(gpseudo, pseudos) && typeof that.coordonnees[gpseudo] == 'undefined') {
			pseudos.push(gpseudo);
		}
		if(pseudos.length > 0 || that.alliances.length > 0) {
			that.getOnZzzelp(pseudos, that.alliances);
		}
		else {
			that.retrieve();
		}
	};

	this.retrieve = function() {
		this.saveLocalStorage(that.coordonnees);
		that.callback(that.coordonnees);	
	};

	this.getLocalStorage = function() {
		var coordonnees = localStorage.getItem(that.localStorageKey);
		if(coordonnees === null) {
			that.saveLocalStorage({});
			return {};
		}
		else {
			try {
				return JSON.parse(coordonnees);
			}
			catch(e) {
				that.saveLocalStorage({});
				return {};
			}
		}
	};

	this.saveLocalStorage = function(coordonnees) {
		localStorage.setItem(that.localStorageKey, JSON.stringify(coordonnees));	
	};

	this.getOnZzzelp = function(joueurs, alliances) {
		if(joueurs.length > 100) {
			joueurs_2 = joueurs.slice(0,100);
			joueurs = joueurs.slice(100,joueurs.length);
		}
		else {
			joueurs_2 = joueurs;
			joueurs = [];
		}
		var url_ajax = 'coordonnees?alliances=[' + alliances + ']&joueurs=[' + joueurs_2 + ']&';
		new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : url_ajax, brute : true },
			{ success : function(valeurs) {
				var pseudo;
				for(var i=0;i<valeurs.length;i++) {
					pseudo = valeurs[i].pseudo.replace('&deg;', '°');
					that.coordonnees[pseudo] = valeurs[i];
				}
				if(joueurs.length > 0) {
					that.getOnZzzelp(joueurs, []);
				}
				else {
					that.retrieve();
				}
			}
		});
	};

	this.coordonnees = this.getLocalStorage();
	this.get();
}