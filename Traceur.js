function ZzzelpScriptTraceur(data, callback) {
	var traceur = this;

	this.values = {
		alliances : [],
		joueurs : []
	};
	this.callback = callback;
	this.alliances = data.alliances;
	this.joueurs = data.joueurs;

	this.get = function() {
		var valeurs = traceur.prepare();
		if(!valeurs) {
			if(!traceur.callback) {
				traceur.sendZzzelp(1);
			}
			else {
				traceur.callback(traceur.values);
			}
		}
		else {
			var prefix = (valeurs.mode == 'alliance') ? 'classementAlliance.php?alliance=' : 'Membre.php?Pseudo=';
			ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : prefix + valeurs.valeur, addDOM : true },
				{ success : function(zone_page, ajax) {
					var TDC, alliance, joueur, rang;
					if(zone_page.querySelectorAll('.boite_membre').length === 0) {
						var tableau = zone_page.querySelector('#tabMembresAlliance'),
							lignes = tableau.rows,
							data = [];
						for (var i=1; i<lignes.length; i++) {
							var cases = lignes[i].querySelectorAll('td');
							joueur = cases[2].querySelector('a').innerHTML;
							TDC = parseInt(cases[4].innerHTML.replace(/ /g,""));
							rang = cases[1].innerHTML;
							data.push({ pseudo : joueur, TDC : TDC, rang : rang });
						}
						traceur.values.alliances.push({ alliance : ze_Analyser_URL_2(ajax.url, 'alliance'), valeurs : data, timestamp : time() });
					}
					else {
						TDC = parseInt(zone_page.querySelector('.tableau_score').rows[1].cells[1].innerHTML.replace(/ /g, ''));
						alliance = zone_page.querySelector('.boite_membre table a').innerHTML;
						traceur.values.joueurs.push({ pseudo : ze_Analyser_URL_2(ajax.url, 'Pseudo'), TDC : TDC, alliance : alliance, timestamp : time() });
					}
					traceur.get();
				}
			});
		}
	};

	this.prepare = function() {
		var valeurs;
		if(traceur.alliances.length > 0) {
			valeurs = {
				mode : 'alliance',
				valeur : traceur.alliances.pop()
			};
		}
		else if(traceur.joueurs.length > 0) {
			valeurs = {
				mode : 'joueur',
				valeur : traceur.joueurs.pop()
			};
		}
		return valeurs;
	};

	this.sendZzzelp = function(mode) {
		var form = new FormData();
		form.append('releves', JSON.stringify(traceur.values));
		ZzzelpScriptAjax({ method : 'POST', domain : 'zzzelp', url : 'stockageTDC?', force : mode, data : form },
			{ success : function(valeurs) {
				localStorage.setItem('zzzelp_dernier_traceur_' + ze_serveur, time());
				ZzzelpScriptTraceur.updateDelay(true);
			}, authentication_issue : function() {
				ZzzelpScriptTraceur.sendZzzelp(releves, 2);
			}
		});
	};

	this.get();

}

ZzzelpScriptTraceur.updateDelay = function(premier) {
	if(localStorage.getItem('zzzelp_dernier_traceur_' + ze_serveur) && time() - localStorage.getItem('zzzelp_dernier_traceur_' + ze_serveur) < 60) {
		if(premier) {
			var zone;
			if(document.querySelectorAll('.alerte_zzzelp_traceur').length === 0) {
				zone = document.createElement('div');
				document.querySelector('.zzzelp_donnees_traceur table').style.display = 'none';
				zone.className = 'alerte_zzzelp_traceur';
				zone.setAttribute('style', 'margin: 35px 0;font-weight: bold;line-height: 2.5em;');
				document.querySelector('.zzzelp_donnees_traceur').appendChild(zone);
			}
			else {
				zone = document.querySelector('.alerte_zzzelp_traceur');
			}
			zone.innerHTML = 'Durée depuis la synchro : <br><b id="delais_traceur_zzzelp">0</b> sec';
			zone.style.color = '#32CD32';
		}
		document.querySelector('#delais_traceur_zzzelp').innerHTML = time() - parseInt(localStorage['zzzelp_dernier_traceur_' + ze_serveur]);
		setTimeout(function(){
			ZzzelpScriptTraceur.updateDelay(false);
		},1000);
	}
	else if(document.querySelectorAll('.alerte_zzzelp_traceur').length > 0) {
		ze_Supprimer_element(document.querySelector('.alerte_zzzelp_traceur'));
		document.querySelector('.zzzelp_donnees_traceur table').style.display = '';
	}
};
