function ze_MAJ_armee(armee, mode) {
	if(!mode) {
		mode = 1;
	}
	new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'niveaux_script?lieu=armee&niveaux=[' + armee + ']&' },
		{ authentication_issue : function(valeurs) {
			ze_MAJ_armee(armee, mode);		
		}
	});
}

function ze_Envoi_RC_Zzzelp(RC, analyse, mode, dernier) {
	var form = new FormData();
	form.append('RC', JSON.stringify(RC));
	form.append('valeurs', JSON.stringify(analyse));
	new ZzzelpScriptAjax({ method : 'POST', domain : 'zzzelp', url : 'RC_script?', data : form },
		{ succes : function(valeurs) {
			if(FI_guerre && valeurs == 1) {
				FI_guerre.add_RC_cache(RC, analyse);
				if(dernier) {
					FI_guerre.update_FI();
				}
			}
		}, authentication_issue : function(valeurs) {
			ze_Envoi_RC_Zzzelp(RC, valeurs, 2, dernier);
		}
	});
}


function ZzzelpScriptRapport() {

	var that = this;

	that.rapport = {};

	this.etapes = new Array(
		{ nom : 'Récupération des ouvrières', id : 'ouvrieres', index : undefined, actif : ZzzelpScript.parameters('') },
		{ nom : 'Récupération de l\'armée', id : 'armee', index : ZzzelpScriptArmee.noms_pluriel },
		{ nom : 'Récupération des constructions', id : 'constructions', index : Constructions },
		{ nom : 'Récupération des recherches', id : 'recherches', index : Recherches }
	);

	this.init = function() {
		that.createInterface();
		that.getArmee();
	};

	this.createInterface = function() {
		var elements = document.querySelector('#centre').childNodes;
		for(i=0; i<elements.length; i++) {
			if(elements[i].id != 'menu') {
				ze_Supprimer_element(elements[i]);
			}
		}

		var	zone = document.createElement('div'),
			tableau = document.createElement('table');
		zone.id = 'theme_fourmizzz';
		zone.className = 'zone_imports_zzzelp';

		var explications = document.createElement('div'),
			txt = 'Bienvenue sur le créateur de rapport de compte. Cette page a pour but de vous aider à envoyer rapidement les informations suivantes sur Zzzelp : ';
		txt += '<br><ul><li>vos ouvrières</li><li>votre armée</li><li>vos constructions</li><li>vos recherches</li></ul><br>Seuls les joueurs ayant les droits de ';
		txt += '"<i>chef</i>" de votre alliance sur Zzzelp auront accès à ces informations. Grâce à ces données, ces derniers auront une vision plus ';
		txt += 'précise de leur alliance.<br><b>Attention !</b> Cette page ne remplace en aucun cas le stockage de vos informations sur votre compte';
		txt += 'Zzzelp pour le calcul des convois par exemple.';
		explications.innerHTML =  txt;
		explications.setAttribute('style', 'max-width: 600px;margin: auto;padding: 10px;');
		explications.className = 'ligneAmelioration';
		zone.appendChild(explications);
		for(i=0; i<that.etapes.length; i++) {
			var ligne = tableau.insertRow(-1),
				entete = ligne.insertCell(0),
				fait = ligne.insertCell(1),
				actif = ligne.insertCell(2),
				img = document.createElement('img'),
				checkbox = document.createElement('input');
			img.src = url_zzzelp + '/Images/suppression.png';
			img.width = '20';
			fait.appendChild(img);
			checkbox.type = 'checkbox';
			checkbox.checked = true;
			actif.appendChild(checkbox);
			checkbox.dataset.categorie = that.etapes[i].id;
			entete.innerHTML = that.etapes[i].nom;
		}
		document.querySelector('#centre').appendChild(zone);
		zone.appendChild(tableau);
	};

	this.getArmee = function() {
		that.rapport.ouvrieres = [parseInt(gouvrieres)];
		that.validState(0);	
		if(ComptePlus) {
			ZzzelpScriptArmee.getArmeeReine(that.getNiveaux);
		}
		else {
			ZzzelpScriptArmee.getArmeeAjax(that.getNiveaux);
		}		
	};

	this.getNiveaux = function(armee) {
		that.rapport.armee = armee.unites;
		that.validState(1);		
		zzzelp.compte.getNiveauxAjax('construction', function(niveaux) {
			that.rapport.constructions = niveaux;
			that.validState(2);	
			zzzelp.compte.getNiveauxAjax('laboratoire', that.finalizeRetrieve);
		});
	};

	this.finalizeRetrieve = function(niveaux) {
		that.rapport.recherches = niveaux;
		that.validState(3);
		that.modificationInterface();
	};

	this.modificationInterface = function() {
		for(var n=0; n<that.etapes.length; n++) {
			var tableau = document.createElement('table');
			tableau.dataset.valeur = that.etapes[n].id;
			tableau.className = 'zzzelp_rapport';
			for(var i=0; i<that.rapport[that.etapes[n].id].length; i++) {
				that.createLine(tableau, n, i);
			}
			document.querySelector('#theme_fourmizzz').appendChild(tableau);
		}
		var bouton = document.createElement('input');
		bouton.type = 'button';
		bouton.value = 'Envoyer vers Zzzelp';
		bouton.setAttribute('style', 'display:block;margin:auto');
		bouton.onclick = function onclick(event) {
			that.save();
		};
		document.querySelector('#theme_fourmizzz').appendChild(bouton);
	};

	this.createLine = function(tableau, n, i) {
		var ligne = tableau.insertRow(-1),
			entete = ligne.insertCell(0),
			valeur = ligne.insertCell(1),
			input;
		if((that.etapes[n].id == 'constructions' || that.etapes[n].id == 'recherches') && i >= that.etapes[n].index.length) {
			input = document.createElement('select');
		}
		else {
			input = document.createElement('input');
		}
		input.className = 'zzzelp_valeur_rapport';
		input.onkeyup = ze_Ajout_espaces;
		if(that.etapes[n].id == 'ouvrieres') {
			entete.innerHTML = 'Ouvrières';
		}
		else if((that.etapes[n].id == 'constructions' || that.etapes[n].id == 'recherches') && i >= that.etapes[n].index.length) {
			if(i == that.etapes[n].index.length) {
				entete.innerHTML = 'En cours';
			}
			else {
				entete.innerHTML = 'En cours (C+)';
			}
		}
		else {
			entete.innerHTML = that.etapes[n].index[i];
		}
		entete.innerHTML += ' :';
		if((that.etapes[n].id == 'constructions' || that.etapes[n].id == 'recherches') && i >= that.etapes[n].index.length) {
			var option = document.createElement('option');
			option.innerHTML = 'Aucun';
			option.value = 0;
			input.appendChild(option);
			for(var j=0; j<that.etapes[n].index.length; j++) {
				option = document.createElement('option');
				option.innerHTML = that.etapes[n].index[j];
				option.value = j+1;
				input.appendChild(option);
			}
			input.value = that.rapport[that.etapes[n].id][i];
		}
		else {
			input.setAttribute('style', 'width:' + (in_array(that.etapes[n].id, ['armee', 'ouvrieres']) ? '120' : '50') + 'px;float:right;text-align:right;padding-right:3px;');
			input.type = 'text';
			input.value = ze_Nombre(that.rapport[that.etapes[n].id][i]);
		}
		valeur.appendChild(input);		
	};

	this.validState = function(i) {
		document.querySelectorAll('.zone_imports_zzzelp img')[i].src = url_zzzelp + '/Images/valider.png';
	};

	this.save = function() {
		var tableaux = document.querySelectorAll('#theme_fourmizzz table'),
			form = new FormData();
		for(var i=1; i<tableaux.length; i++) {
			if(document.querySelector('input[data-categorie="' + tableaux[i].dataset.valeur + '"]').checked) {
				for(var j=0; j<tableaux[i].rows.length; j++) {
					form.append(tableaux[i].dataset.valeur + '[]', parseInt(tableaux[i].rows[j].querySelector('.zzzelp_valeur_rapport').value.replace(/ /g,'')));
				}
			}
		}
		new ZzzelpScriptAjax({ method : 'POST', domain : 'zzzelp', url : 'rapport_script?alliance=' + galliance + '&', data : form  },
			{ success : function(valeurs) {
				ze_Supprimer_element(document.querySelector('#theme_fourmizzz'));
				var div = document.createElement('div');
				div.innerHTML = 'Données stockées avec succès';
				div.setAttribute('style', 'text-align: center;font-weight: bold;margin: 50px;font-size: 1.2em;');
				document.querySelector('#centre').appendChild(div);		
			}
		});
	};

	this.init();

}



