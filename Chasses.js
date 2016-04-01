function ZzzelpScriptChasses() {

	chasses = this;

	this.init = function() {
		if(~url.indexOf('&nlc')) {
			var donnees = ze_Analyser_URL('c').substr(1, ze_Analyser_URL('c').length - 2).split('|');
			chasses.valeur = ze_Analyser_URL('v');
			chasses.liste_chasses = [];
			for(var i=0; i<donnees.length; i++) {
				var donnee = donnees[i].split(','),
					valeurs = [];
				for(var n=0; n<donnee.length; n++) {
					valeurs.push(parseInt(ze_Base_36_10(donnee[n])));
				}
				chasses.liste_chasses.push(valeurs);
			}
			chasses.prepareTable();
		}
	};

	this.prepareTable = function() {
		var tableau = document.createElement('table'),
			ligne = tableau.insertRow(0),
			cell = ligne.insertCell(0);
		tableau.setAttribute('style', 'box-shadow:5px 5px 10px rgba(0, 0, 0, 0.65);border:1px solid rgba(0, 0, 0, 0.40);margin-bottom:40px;width:300px');
		ligne.setAttribute('style', 'font-weight:bold;text-align:center');
		cell.setAttribute('colspan', '2');
		cell.innerHTML = 'Stockage sur Zzzelp : EN ATTENTE';
		tableau.setAttribute('id', 'lancement_zzzelp');
		for(var i=0; i<chasses.liste_chasses.length; i++) {
			ligne = tableau.insertRow(-1);
			cell = ligne.insertCell(0);
			var	cell2 = ligne.insertCell(1);
			cell.setAttribute('style', 'font-weight:bold;padding:10px;');
			cell2.setAttribute('style', 'color:red;padding:10px;');
			cell.innerHTML = 'Chasse n°' + (i+1);
			cell2.innerHTML = 'A envoyer';
		}
		document.querySelector('center').insertBefore(tableau, document.querySelector('.simulateur'));
		this.send(1);
	};

	this.send = function(n) {
		var ex_time = parseInt(localStorage.getItem('zzzelp_time_chasses_' + ze_serveur));
		if(chasses.liste_chasses.length > 0) {
			if((time() - ex_time) < 2) {
				setTimeout(function() {
					chasses.send(n);
					return false;
				}, 2000 - time() + ex_time);
			}
			else {
				localStorage.setItem('zzzelp_time_chasses_' + ze_serveur, time());
				var chasse = chasses.liste_chasses[0],
					url_ajax = 'AcquerirTerrain.php',
					contentType = 'application/x-www-form-urlencoded',
					valeurs = '';
				chasses.liste_chasses.shift();
				for(var k=0; k<14; k++) {
					if(chasse[k] !== 0) {
						valeurs += ((valeurs !== '')? '&' : '') + 'unite' + ZzzelpScriptArmee.ID[k] + '=' + chasse[k];
					}
				}
				var data = valeurs + '&AcquerirTerrain=' + chasses.valeur + '&ChoixArmee=1&t=' + document.querySelector('table #t').value;
				new ZzzelpScriptAjax({ method : 'POST', domain : 'fourmizzz', url : url_ajax, addDom : false, data : data, contentType : contentType },
					{ success : function() {
						document.querySelector('#lancement_zzzelp').rows[n].cells[1].style.color = 'green';
						document.querySelector('#lancement_zzzelp').rows[n].cells[1].innerHTML = 'Envoyée';
						chasses.send(n+1);
					}
				});
			}
		}
		else {
			localStorage.removeItem('zzzelp_time_chasses_' + ze_serveur);
			chasses.storeOnZzzelp(1, n);
		}
	};

	this.storeOnZzzelp = function(mode, n) {
		var url_ajax = 'chasses_script?arrivee=' + ze_Analyser_URL('retour') + '&valeur=' + chasses.valeur*(n-1) + '&';
		new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : url_ajax, force : mode },
			{ success : function(valeurs) {
				document.querySelector('#lancement_zzzelp').rows[0].cells[0].style.color = ((valeurs == 1) ? 'green' : 'red');
				document.querySelector('#lancement_zzzelp').rows[0].cells[0].innerHTML = 'Stockage sur Zzzelp : ' + ((valeurs == 1) ? 'REUSSI' : 'ECHOUEE');
			}, authentication_issue : function() {
				chasses.storeOnZzzelp(2, n);
			}
		});
	};

	this.init();
}

/* Ajoute un lien vers le lanceur de chasses de Zzzelp à la page Ressource */
function ze_Affichage_raccourci_chasses() {
	var div = document.createElement('div');
	div.setAttribute('class', 'raccourci_chasse_zzzelp');
	var lien = document.createElement('a');
	lien.href = '/Armee.php?icz';
	lien.innerHTML = 'Chasser avec Zzzelp';
	document.querySelector('#boite_tdc td').insertBefore(div, document.querySelector('.pas_sur_telephone'));
	div.appendChild(lien);
	document.querySelector('.pas_sur_telephone').innerHTML = '';
}

/* Affiche le total des chasses en cours et la date de retour */
function ze_Affichage_resume_chasses() {
	var span = document.querySelectorAll('#boite_tdc td span'),
		TDC = 0;
	for(var i=0;i<span.length;i++) {
		var ligne = span[i].innerHTML;
		if(ligne.match(new RegExp('- Vos chasseuses vont conquérir ([0-9 ]+) cm(.*)'))) {
			var reg = new RegExp('- Vos chasseuses vont conquérir ([0-9 ]+) cm(.*)');
			TDC += parseInt(reg.exec(ligne)[1].replace(/ /g,""));
		}
	}
	document.querySelector('#boite_tdc td').innerHTML += '<br><strong>Total des chasses : ' + ze_Nombre(TDC) + ' cm2</strong>';
}