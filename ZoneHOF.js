function ZzzelpScriptZoneHOF(RC, valeurs, nouveau, guerre) {

	var that = this;
	this.RC = RC;
	this.valeurs = valeurs;
	this.nouveau = nouveau;
	this.guerre = guerre;

	this.main = function() {
		that.entetes = that.createEnteteDict();
		that.data = that.createDict();

		that.createMainZone();
		that.createEntete();
		that.createHOF();

		if(that.nouveau && that.guerre) {
			that.createButtonSave();
			that.createLigneRC();
		}

		for(var section in that.data) {
			var conteneur = document.createElement('div');
			conteneur.setAttribute('style', 'display:inline-block;width:300px;margin:22px;vertical-align:top');
			for(var categorie in that.data[section]) {
				that.createCategorie(conteneur, section, categorie);
			}
			if(that.guerre) {
				var stockage_armee = document.createElement('a');
				stockage_armee.className = 'bouton_guerre';
				stockage_armee.innerHTML = 'Enregistrer l\'armée';
				stockage_armee.setAttribute('style', 'width: 180px;display: block;margin: auto;');
				stockage_armee.dataset.joueur = section;
				stockage_armee.onclick = that.saveArmee;
				conteneur.appendChild(stockage_armee);
			}
			that.zone.appendChild(conteneur);
		}
		that.createZoneExport();
	};

	this.getZone = function() {
		return that.zone;
	};


	/*
		Creation of the dictionnaries
	*/
	this.createDict = function() {
		return {
			attaquant : that.createDictAttaquant(),
			defenseur : that.createDictDefenseur()
		};
	};

	this.createDictAttaquant = function() {
		var armee_avant = that.valeurs.attaquant.armee,
			armee_apres = that.valeurs.attaquant.armee_XP;
		return {
			niveaux : {
				nom : 'Niveaux de l\'attaquant',
				lignes : new Array(
					{ nom : 'Armes', type : 'input', largeur : 'input_niveau', 
					  valeur : armee_avant.getArmes(), importable : (armee_avant.getArmes() > 0), id : 'armes' },
					{ nom : 'Bouclier', type : 'input', largeur : 'input_niveau', 
					  valeur : armee_avant.getBouclier(), importable : (armee_avant.getBouclier() > 0), id : 'bouclier' }
				)
			},
			avant : {
				nom : 'Attaquant avant le combat',
				lignes : new Array(
					{ nom : 'Attaque (AB)', type : 'span', valeur : ze_Nombre(armee_avant.getAttaqueAB()) },
					{ nom : 'Défense (AB)', type : 'span', valeur : ze_Nombre(armee_avant.getDefenseAB()) },
					{ nom : 'Vie (AB)', type : 'span', valeur : ze_Nombre(armee_avant.getVieAB()) },
					{ nom : 'Capacité de flood', type : 'span', valeur : ze_Nombre(armee_avant.getCapaFlood()) },
					{ nom : 'Années de ponte', type : 'span', valeur : ze_Nombre(armee_avant.getHOFAnnees()) + ' années'},
					{ nom : '', type : 'armee', valeur : armee_avant }
				)
			},
			apres : {
				nom : 'Attaquant après le combat',
				lignes : new Array(
					{ nom : 'Attaque (AB)', type : 'span', valeur : ze_Nombre(armee_apres.getAttaqueAB()) },
					{ nom : 'Défense (AB)', type : 'span', valeur : ze_Nombre(armee_apres.getDefenseAB()) },
					{ nom : 'Vie (AB)', type : 'span', valeur : ze_Nombre(armee_apres.getVieAB()) },
					{ nom : 'Capacité de flood', type : 'span', valeur : ze_Nombre(armee_apres.getCapaFlood()) },
					{ nom : 'Années de ponte', type : 'span', valeur : ze_Nombre(armee_apres.getHOFAnnees()) + ' années'},
					{ nom : '', type : 'armee', valeur : armee_apres }
				)
			}
		};
	};

	this.createDictDefenseur = function() {
		var armee_avant = that.valeurs.defenseur.armee,
			armee_apres = that.valeurs.defenseur.armee_XP,
			def = {
			niveaux : {
				nom : 'Niveaux du défenseur',
				lignes : new Array(
					{ nom : 'Armes', type : 'input', largeur : 'input_niveau', 
					  valeur : armee_avant.getArmes(), importable : (armee_avant.getArmes() > 0), id : 'armes' },
					{ nom : 'Bouclier', type : 'input', largeur : 'input_niveau', 
					  valeur : armee_avant.getBouclier(), importable : (armee_avant.getBouclier() > 0), id : 'bouclier' }
				)
			},
			avant : {
				nom : 'Défenseur avant le combat',
				lignes : new Array(
					{ nom : 'Attaque (AB)', type : 'span', valeur : ze_Nombre(armee_avant.getAttaqueAB()) },
					{ nom : 'Défense (AB)', type : 'span', valeur : ze_Nombre(armee_avant.getDefenseAB()) },
					{ nom : 'Vie (AB)', type : 'span', valeur : ze_Nombre(armee_avant.getVieAB()) },
					{ nom : 'Capacité de flood', type : 'span', valeur : ze_Nombre(armee_avant.getCapaFlood()) },
					{ nom : 'Années de ponte', type : 'span', valeur : ze_Nombre(armee_avant.getHOFAnnees()) + ' années'},
					{ nom : '', type : 'armee', valeur : armee_avant }
				)
			},
			apres : {
				nom : 'Défenseur après le combat',
				lignes : new Array(
					{ nom : 'Attaque (AB)', type : 'span', valeur : ze_Nombre(armee_apres.getAttaqueAB()) },
					{ nom : 'Défense (AB)', type : 'span', valeur : ze_Nombre(armee_apres.getDefenseAB()) },
					{ nom : 'Vie (AB)', type : 'span', valeur : ze_Nombre(armee_apres.getVieAB()) },
					{ nom : 'Capacité de flood', type : 'span', valeur : ze_Nombre(armee_apres.getCapaFlood()) },
					{ nom : 'Années de ponte', type : 'span', valeur : ze_Nombre(armee_apres.getHOFAnnees()) + ' années'},
					{ nom : '', type : 'armee', valeur : armee_apres }
				)
			}
		};
		if(that.valeurs.lieu > 0) {
			def.niveaux.lignes.push({ 
				nom : ((that.valeurs.lieu == 1) ? 'Dôme' : 'Loge Impériale'), 
				type : 'input', largeur : 'input_niveau', 
				valeur : armee_avant.getNiveauLieu(),
				importable : (armee_avant.getNiveauLieu() > 0),
				id : ((that.valeurs.lieu == 1) ? 'dome' : 'loge')
			});		
		}
		return def;
	};


	/*
		Creation of the interface
	*/
	this.createMainZone = function() {
		var zone = document.createElement('div');
		if(that.nouveau) {
			zone.setAttribute('style', 'margin:29px;padding:10px;border: 1px solid black;background: rgba(200,200,200,0.6);');
		}
		else {
			zone.setAttribute('style', 'margin:10px -10px;padding:10px;');
		}
		that.zone = zone;	
	};

	this.createEntete = function() {
		var zone_entete = document.createElement('div');
		zone_entete.setAttribute('style', 'width: 400px;margin: 15px auto 30px auto;');
		for(var i=0; i<that.entetes.length; i++) {
			var ligne = document.createElement('div'),
				span = document.createElement('span'),
				input = document.createElement('input');
			ligne.className = 'ligne_cadre_structure';
			span.innerHTML = that.entetes[i].nom + ' :';
			input.type = 'text';
			input.value = that.entetes[i].valeur;
			input.id = that.entetes[i].id;
			ligne.appendChild(span);
			ligne.appendChild(input);
			zone_entete.appendChild(ligne);
		}
		that.zone.appendChild(zone_entete);
	};

	this.createHOF = function() {
		var zone_HOF = document.createElement('div');
		zone_HOF.setAttribute('style', 'width: 400px;margin:auto;');
		var ligne = document.createElement('div');
		ligne.className = 'ligne_cadre_structure';
		ligne.setAttribute('style', 'text-align: center;');
		ligne.innerHTML = 'HOF : <b>' + ze_Secondes_date(that.valeurs.HOF, false) + '</b>';
		zone_HOF.appendChild(ligne);
		that.zone.appendChild(zone_HOF);		
	};

	this.createButtonSave = function() {
		var bouton = document.createElement('a');
		bouton.className = 'bouton_guerre';
		bouton.innerHTML = 'Enregistrer';
		bouton.setAttribute('style', 'width: 100px;margin: auto;display: block;text-align:center;');
		bouton.onclick = function onclick(event) {
			that.saveRC();
		}; 
		that.zone.appendChild(bouton);
	};

	this.createLigneRC = function(RC) {
		var ligne_RC = document.createElement('div');
		ligne_RC.className = 'ligne_cadre_structure';
		ligne_RC.setAttribute('style', 'height:auto;text-align:center;line-height:inherit;');
		ligne_RC.innerHTML = that.RC.join('<br>');
		that.zone.appendChild(ligne_RC);
	};

	this.createCategorie = function(conteneur, section, categorie) {
		var data = that.data[section][categorie],
			entete = that.createEnteteCategorie(data, conteneur);
			sous_zone = document.createElement('div');
		sous_zone.setAttribute('style', 'display:none');
		for(i=0; i<data.lignes.length; i++) {
			var donnee = data.lignes[i];
			if(donnee.type == 'armee') {
				for(var k=0; k<14; k++) {
					if(donnee.valeur.unites[k] > 0) {
						sous_zone.appendChild(that.createLigneArmee(donnee, k, section, categorie));
					}
				}
			}
			else {
				sous_zone.appendChild(that.createLigneNonArmee(donnee, section));
			}
		}
		conteneur.appendChild(sous_zone);			
	};

	this.createEnteteCategorie = function(data, conteneur) {
		var	entete = document.createElement('div');
		entete.onclick = function onclick(event) {
			this.nextSibling.style.display = (this.nextSibling.style.display == 'none') ? '' : 'none';
		};
		entete.innerHTML = data.nom;
		entete.className = 'entete_menu_cache';
		conteneur.appendChild(entete);
	};

	this.createLigneArmee = function(donnee, k, section, categorie) {
		var	ligne = document.createElement('div'),
			label = document.createElement('span'),
			input = document.createElement('span');
		ligne.className = 'ligne_cadre_structure';
		ligne.dataset.section = 'armee_' + section + '_' + categorie;
		label.innerHTML = ZzzelpScriptArmee.TAGs[k] + ' :';
		input.className = 'input_fige';
		input.innerHTML = ze_Nombre(donnee.valeur.unites[k]);
		ligne.appendChild(label);
		ligne.appendChild(input);
		return ligne;
	};

	this.createLigneNonArmee = function(donnee, section) {
		var	ligne = document.createElement('div'),
			label = document.createElement('span'),
			input;
		ligne.className = 'ligne_cadre_structure';
		label.innerHTML = donnee.nom + ' :';
		if(donnee.type == 'input') {
			input = document.createElement('input');
			input.className = donnee.largeur;
			input.value = donnee.valeur;
		}
		else if(donnee.type == 'span') {
			input = document.createElement('span');
			input.className = 'input_fige';
			input.innerHTML = donnee.valeur;
		}
		ligne.appendChild(label);
		ligne.appendChild(input);
		if(that.guerre && donnee.importable) {
			var img = document.createElement('img');
			img.src = url_zzzelp + '/Images/plus.png';
			img.dataset.nom = donnee.id;
			img.dataset.joueur = section;
			img.setAttribute('style', 'margin-right: 5px;height: 1.8em;cursor:pointer;');
			img.onclick = function onclick(event) {
				var pseudo = this.parentNode.parentNode.parentNode.parentNode.querySelector('#' + this.dataset.joueur).value,
					valeur = this.parentNode.querySelector('input').value;
				if(pseudo == document.querySelector('.modal_zzzelp').dataset.pseudo) {
					document.querySelector('.ligne_armee input[data-nom="' + this.dataset.nom + '"]').value = valeur;
				}
				if(pseudo !== '') {
					MAJ_niveau_joueur(pseudo, this.dataset.nom, valeur, this);
				}
			};
			ligne.appendChild(img);
		}
		return ligne;	
	};

	this.createZoneExport = function() {
		var lignes = new ZzzelpScriptAnalyseTextuelle('combat', that.valeurs).getContent(),
			resultat_BBCode_FE = '',
			resultat_BBCode_FI = '';
			
		for(var n=0; n<lignes.length; n++) {
			resultat_BBCode_FE += lignes[n].BBCode_FE;
			resultat_BBCode_FI += '|' + lignes[n].BBCode_FI + '|\n';
		}

		var raccourci_FE = document.createElement('div'),
			raccourci_FI = document.createElement('div'),
			contenu_FE = document.createElement('textarea'),
			contenu_FI = document.createElement('textarea');
			
		raccourci_FE.innerHTML = 'Copier sur un forum externe';
		raccourci_FI.innerHTML = 'Copier sur un forum Fourmizzz';
		contenu_FE.value = that.RC.join("\n") + '\n\n[center][table]\n' + resultat_BBCode_FE + '[/table][/center]';
		contenu_FI.value = that.RC.join("\n") + '\n\n\n[center][code]\n' + resultat_BBCode_FI + '\n[/code][/center]';
		raccourci_FE.setAttribute('style', 'text-align:center;font-weight:bold;margin:15px 0;cursor:pointer;');
		raccourci_FI.setAttribute('style', 'text-align:center;font-weight:bold;margin:15px 0;cursor:pointer;');
		contenu_FE.setAttribute('style', ' width: 80%;height: 150px;margin: 25px auto;display:none;display: block;');
		contenu_FI.setAttribute('style', ' width: 80%;height: 150px;margin: 25px auto;display:none;display: block;');
		
		raccourci_FE.onclick = function onclick(event) {
			contenu_FE.style.display = (contenu_FE.style.display === '' ? 'none' : '');
		};
		raccourci_FI.onclick = function onclick(event) {
			contenu_FI.style.display = (contenu_FI.style.display === '' ? 'none' : '');
		};
		
		that.zone.appendChild(raccourci_FE);
		that.zone.appendChild(contenu_FE);	
		that.zone.appendChild(raccourci_FI);
		that.zone.appendChild(contenu_FI);	
	};


	this.createEnteteDict = function() {
		var pseudo_defaut = '';
		return new Array(
			{ 
				nom : 'Date du combat', 
				valeur : ((typeof that.valeurs.date != 'undefined') ? ze_Generation_date_v1(that.valeurs.date, true) : ''), 
				id : 'date' 
			},{ 
				nom : 'Pseudo de l\'attaquant', 
				valeur : ((typeof that.valeurs.attaquant.pseudo != 'undefined') ? that.valeurs.attaquant.pseudo : pseudo_defaut), 
				id : 'attaquant'
			},{ 
				nom : 'Pseudo du défenseur', 
				valeur : ((typeof that.valeurs.defenseur.pseudo != 'undefined') ? that.valeurs.defenseur.pseudo : pseudo_defaut), 
				id : 'defenseur'
			}
		);	
	};


	/*
		Storage of the data on Zzzelp
	*/
	this.saveArmee = function(event) {
		var pseudo = this.parentNode.parentNode.querySelector('#' + this.dataset.joueur).value,
			date = ze_Date_to_timestamp_v1(this.parentNode.parentNode.querySelector('#date').value);
		if(pseudo !== '' && date > 0) {
			var	elements = this.parentNode.querySelectorAll('div[data-section="armee_' + this.dataset.joueur + '_apres"]'),
				armee = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0);
			for(var k=0; k<elements.length; k++) {
				var i = ZzzelpScriptArmee.TAGs.indexOf(elements[k].querySelectorAll('span')[0].innerHTML.replace(':', '').trim()); 
				armee[i] = parseInt(elements[k].querySelectorAll('span')[1].innerHTML.replace(/ /g, ''));
			}
			var url_ajax = 'mode=stockage_armee&cible=' + pseudo + '&armee=[' + armee + ']&date_armee=' + date + '&';
			new ZzzelpScriptAjax( ZzzelpScriptModalGuerre.chooseAjaxParam({ method : 'GET', url : url_ajax }, that.pseudo),
				{ success : function(valeurs) {
					var inputs = document.querySelectorAll('.ligne_armee .input_tableau[data-donnee="armee"]');
					for(var k=0; k<14; k++) {
						inputs[k].value = ze_Nombre(armee[k]);
					}
					document.querySelector('#date_MAJ_armee').value = ze_Generation_date_v1(date, 1);
				}
			});
		}
		else {
			console.log('Date inconnue');
		}	
	};

	this.saveRC = function() {
		var valeurs = that.valeurs;
		valeurs.date = ze_Date_to_timestamp_v1(that.zone.querySelector('#date').value);
		valeurs.attaquant.pseudo = that.zone.querySelector('#attaquant').value;
		valeurs.defenseur.pseudo = that.zone.querySelector('#defenseur').value;
		var	form = new FormData();
		form.append('RC', JSON.stringify(that.RC));
		form.append('valeurs', JSON.stringify(that.valeurs));
		var data = { method : 'POST', url : 'mode=stockage_RC&', data : form };
		new ZzzelpScriptAjax( ZzzelpScriptModalGuerre.chooseAjaxParam(data, that.pseudo), {});
	};

	this.main();

}