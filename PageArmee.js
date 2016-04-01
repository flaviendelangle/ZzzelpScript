function ZzzelpScriptPageArmee(zzzelp) {

	var page = this;
	this.noms_lieux = ['','Vers le Terrain de Chasse', 'Vers le Fourmilière', 'Vers la Loge Impériale', ''];
	this.armees = [];
	this.tooltips = '';

	this.init = function() {
		var unites_lieux = ZzzelpScriptArmee.getArmee(document, 1).unites,
			niveaux_lieu = [0, zzzelp.compte.getDome(), zzzelp.compte.getLoge()];

		for(var i=0; i<3; i++) {
			niveaux = {
				armes : zzzelp.compte.getArmes(),
				bouclier : zzzelp.compte.getBouclier(),
				niveau_lieu : niveaux_lieu[i],
				lieu : i
			};
			page.armees.push(new ZzzelpScriptArmee(unites_lieux[i], niveaux));
		}
		page.findTableau();
		if(typeof page.tableau != 'undefined') {
			page.createAntisondeButton();
			page.ameliorerTableau();
			page.lignesVie();
			page.lignesAttaque();
			page.lignesDefense();
			page.lignesConsommation();
			page.lignesHOF();
			page.ligneCapaFlood();
			ze_Inserer_script(page.tooltips);
		}
	};

	this.findTableau = function() {
		var	tableaux = document.querySelectorAll('.simulateur');
		for(i=0;i<tableaux.length;i++) {
			if(tableaux[i].rows[0].cells[0].getAttribute('colspan') == '10') {
				page.tableau = tableaux[i];
			}
		}
	};

	this.ameliorerTableau = function() {
		var lignes = page.tableau.rows;
		document.querySelectorAll('#centre p')[0].innerHTML = '';	
		
		for(var n=2;n<lignes.length;n++) {
			if(lignes[n].cells[0].querySelectorAll('#Vie').length > 0) {
				for(var k=n; k<page.tableau.rows.length; k++) {
					page.tableau.rows[k].innerHTML = '';
				}
				break;
			}
			else {
				var colonnes = lignes[n].cells,
					unite = colonnes[0].querySelector('.pas_sur_telephone');
				if(unite !== null) {
					index_unite = ZzzelpScriptArmee.noms_singulier.indexOf(unite.innerHTML);
					for(var i=1;i<colonnes.length;i++) {
						var contenu = colonnes[i].innerHTML;
						if(~contenu.indexOf('unite') && contenu.indexOf('fleche') == -1) {
							page.ameliorerLigne(i, n, colonnes, index_unite, contenu);
						}
					}
				}
			}
		}
		if((page.armees[1].getHOF() + page.armees[0].getHOF())*Math.pow(0.9, zzzelp.compte.getTDP()) > 86400*2) {
			document.querySelectorAll('.simulateur tr h3')[0].innerHTML = 'Unités en dehors de la loge';
			document.querySelectorAll('.simulateur tr h3')[0].style.color = 'red';
		}

	};

	this.ameliorerLigne = function(i, n, colonnes, index_unite, contenu) {
		var resultats = new RegExp('(.*),([0-3])' + (ComptePlus ? ',' : '') + '(.*)>([ 0-9]+)<\/span>').exec(contenu),
			nombre = parseInt(resultats[4].replace(/ /g,"")),
			lieu = parseInt(resultats[2]),
			className = 'zzzelp_armee_' + n + '_' + i,
			span, img;
		if(!ComptePlus) {
			colonnes[i].querySelector('span').onmouseover = function onmouseover(event) {
				this.setAttribute('style','font-weight:bold'); 
				return false;
			};
			colonnes[i].querySelector('span').onmouseout = function onmouseout(event) {
				this.setAttribute('style','font-weight:normal'); 
				return false;
			};
			colonnes[i].querySelector('span').onclick = function onclick(event) {
				document.querySelector('#nbTroupes').value = this.innerHTML;
				document.querySelector('#ChoixUnite').value = ZzzelpScriptArmee.ordre[index_unite];
			};
			if(lieu > 1) {
				span = document.createElement('span');
				img = document.createElement('img');
				span.setAttribute('style', 'float:right;cursor:pointer');
				span.onclick = function onclick(event) {
					remplirFormulaire(nombre, ZzzelpScriptArmee.ordre[index_unite], lieu, lieu-1);
					document.querySelector('#centre input[type=submit]').type = 'hidden';
					document.querySelector('.simulateur form[action="Armee.php"]').submit();
				};
				img.title = page.noms_lieux[lieu-1];
				img.src = 'images/fleche-champs-gauche.gif';
				span.appendChild(img);
				colonnes[i-1].appendChild(span);
			}
			if(lieu < 3) {
				span = document.createElement('span');
				img = document.createElement('img');
				span.setAttribute('style', 'float:left;cursor:pointer');
				span.onclick = function onclick(event) {
					remplirFormulaire(nombre, ZzzelpScriptArmee.ordre[index_unite], lieu, lieu+1);
					document.querySelector('#centre input[type=submit]').type = 'hidden';
					document.querySelector('.simulateur form[action="Armee.php"]').submit();
				};
				img.title = page.noms_lieux[lieu+1];
				img.src = 'images/fleche-champs-droite.gif';
				span.appendChild(img);
				colonnes[i+1].appendChild(span);
			}
		}
		colonnes[i].querySelector('span').setAttribute('title','');
		colonnes[i].querySelector('span').setAttribute('class', className);
		page.genererTooltipUnite(nombre, index_unite, lieu, className);
	};

	this.genererTooltipUnite = function(nombre, index_unite, lieu, className) {
		var armee = ZzzelpScriptArmee.new_armee_unite(nombre, index_unite, page.armees[lieu-1].niveaux);
		page.genererTooltip(className, [
			{ titre : 'Vie', valeur : armee.getVieAB() },
			{ titre : 'Attaque', valeur : armee.getAttaqueAB() },
			{ titre : 'Défense', valeur : armee.getDefenseAB() }
		]);
	};

	this.genererTooltip = function(className, valeurs) {
		contenu = '$(function() {';
		contenu += 		'$(".' + className + '").tooltip({';
		contenu +=			'position: {my: "left+10 middle",at: "right middle"},';
		contenu +=			'tooltipClass: "warning-tooltip",';
		contenu +=			'content:"<table>';
		for(var i=0; i<valeurs.length; i++) {
			var valeur = isNaN(valeurs[i].valeur) ? valeurs[i].valeur : ze_Nombre(parseInt(valeurs[i].valeur));
			contenu += 				'<tr><td>' + valeurs[i].titre + ' :</td><td>' +  valeur + '</td></tr>';
		}
		contenu +=				'</table>"});});\n';
		page.tooltips += contenu;
	};

	this.lignesVie = function() {
		var ligne = page.tableau.insertRow(-1),
			cell, contenu, className, vie_HB, vie_AB, bonus_bouclier, bonus_lieu;
		ligne.setAttribute('id','zzzelp_vie');
		ligne.setAttribute('style','cursor:pointer');
		cell = ligne.insertCell(0);
		cell.innerHTML = 'Vie';	
		for(var n=0;n<3;n++) {
			vie_HB =  page.armees[n].getVieHB();
			vie_AB = page.armees[n].getVieAB();
			bonus_bouclier = vie_HB*(0.1*page.armees[n].niveaux.bouclier);
			bonus_lieu = vie_AB - vie_HB - bonus_bouclier;
			className = 'tooltip_zzzelp_stats_vie_' + n;
			cell = ligne.insertCell(n+1);
			cell.setAttribute('colspan','3');
			cell.innerHTML = "<img src=\"http://www.fourmizzz.fr/images/icone_coeur.gif\"> " + ze_Nombre(vie_AB);
			cell.setAttribute('class', className);
			cell.setAttribute('title','');
			page.genererTooltip(className, [
				{ titre : 'Vie HB', valeur : vie_HB },
				{ titre : 'Bonus bouclier ', valeur : bonus_bouclier },
				{ titre : 'Bonus lieu', valeur : bonus_lieu}
			]);
		}
		document.querySelector('#zzzelp_vie').onclick = function onclick(event) {
			page.showDetails('zzzelp_details_vie'); 
			return false;
		};
		var JSN, valeur;
		for(k=0; k<2; k++) {
			JSN = (k === 0) ? 'sans' : 'avec';
			ligne = page.tableau.insertRow(-1);
			cell = ligne.insertCell(0);
			ligne.setAttribute('style','display:none');
			ligne.setAttribute('id','zzzelp_details_vie');
			cell.innerHTML = 'Vie full XP (' + JSN + ' JSN)';	
			for(n=0; n<3; n++){
				className = 'tooltip_zzzelp_stats_vie_XP_' + JSN + '_JSN_' + n;
				var armee_XP = page.armees[n].XP(k == 1);
				vie_HB =  armee_XP.getVieHB();
				vie_AB = armee_XP.getVieAB();
				bonus_bouclier = vie_HB*(0.1*armee_XP.niveaux.bouclier);
				bonus_lieu = vie_AB - vie_HB - bonus_bouclier;	
				cell = ligne.insertCell(n+1);
				cell.setAttribute('colspan','3');
				cell.innerHTML = ze_Nombre(vie_AB);
				cell.setAttribute('class',className);
				cell.setAttribute('title','');	
				page.genererTooltip(className, [
					{ titre : 'Gain', valeur : (page.armees[n].isNull() ? 0 : parseInt(((armee_XP.getVieHB()/page.armees[n].getVieHB())-1)*1000)/10) + '%' },
					{ titre : 'Vie HB', valeur : vie_HB },
					{ titre : 'Bonus bouclier', valeur : bonus_bouclier },
					{ titre : 'Bonus lieu', valeur : bonus_lieu }
				]);
			}
		}
	};

	this.lignesAttaque = function() {
		var ligne = page.tableau.insertRow(-1),
			cell, contenu, className, attaque_HB, attaque_AB, bonus_armes;
		ligne.setAttribute('id','zzzelp_attaque');
		ligne.setAttribute('style','cursor:pointer');
		ligne.setAttribute('class','ligne_paire');
		cell = ligne.insertCell(0);
		cell.innerHTML = 'Attaque';	
		for(var n=0;n<3;n++) {
			attaque_HB =  page.armees[n].getAttaqueHB();
			attaque_AB = page.armees[n].getAttaqueAB();
			bonus_armes = attaque_HB*(0.1*page.armees[n].niveaux.armes);
			className = 'tooltip_zzzelp_stats_attaque_' + n;
			cell = ligne.insertCell(n+1);
			cell.setAttribute('colspan','3');
			cell.innerHTML = "<img src=\"http://www.fourmizzz.fr/images/icone_degat_attaque.gif\"> " + ze_Nombre(attaque_AB);
			cell.setAttribute('class', className);
			cell.setAttribute('title','');
			page.genererTooltip(className, [
				{ titre : 'Attaque HB', valeur : attaque_HB },
				{ titre : 'Bonus armes ', valeur : bonus_armes }
			]);
		}
		document.querySelector('#zzzelp_attaque').onclick = function onclick(event) {
			page.showDetails('zzzelp_details_attaque'); 
			return false;
		};
		var JSN, valeur;
		for(k=0; k<2; k++) {
			JSN = (k === 0) ? 'sans' : 'avec';
			ligne = page.tableau.insertRow(-1);
			cell = ligne.insertCell(0);
			ligne.setAttribute('style','display:none');
			ligne.setAttribute('id','zzzelp_details_attaque');
			ligne.setAttribute('class','ligne_paire');
			cell.innerHTML = 'Attaque full XP (' + JSN + ' JSN)';	
			for(n=0; n<3; n++){
				className = 'tooltip_zzzelp_stats_attaque_XP_' + JSN + '_JSN_' + n;
				var armee_XP = page.armees[n].XP(k == 1);
				attaque_HB =  armee_XP.getAttaqueHB();
				attaque_AB = armee_XP.getAttaqueAB();
				bonus_armes = attaque_HB*(0.1*armee_XP.niveaux.armes);
				cell = ligne.insertCell(n+1);
				cell.setAttribute('colspan','3');
				cell.innerHTML = ze_Nombre(attaque_AB);
				cell.setAttribute('class',className);
				cell.setAttribute('title','');	
				page.genererTooltip(className, [
					{ titre : 'Gain', valeur : (page.armees[n].isNull() ? 0 : parseInt(((armee_XP.getAttaqueHB()/page.armees[n].getAttaqueHB())-1)*1000)/10) + '%' },
					{ titre : 'Attaque HB', valeur : attaque_HB },
					{ titre : 'Bonus armes', valeur : bonus_armes }
				]);
			}
		}
	};

	this.lignesDefense = function() {
		var ligne = page.tableau.insertRow(-1),
			cell, contenu, className, defense_HB, defense_AB, bonus_armes;
		ligne.setAttribute('id','zzzelp_defense');
		ligne.setAttribute('style','cursor:pointer');
		cell = ligne.insertCell(0);
		cell.innerHTML = 'Défense';	
		for(var n=0;n<3;n++) {
			defense_HB =  page.armees[n].getDefenseHB();
			defense_AB = page.armees[n].getDefenseAB();
			bonus_armes = defense_HB*(0.1*page.armees[n].niveaux.armes);
			className = 'tooltip_zzzelp_stats_defense_' + n;
			cell = ligne.insertCell(n+1);
			cell.setAttribute('colspan','3');
			cell.innerHTML = "<img src=\"http://www.fourmizzz.fr/images/icone_degat_defense.gif\"> " + ze_Nombre(defense_AB);
			cell.setAttribute('class', className);
			cell.setAttribute('title','');
			page.genererTooltip(className, [
				{ titre : 'Défense HB', valeur : defense_HB },
				{ titre : 'Bonus armes ', valeur : bonus_armes }
			]);
		}
		document.querySelector('#zzzelp_defense').onclick = function onclick(event) {
			page.showDetails('zzzelp_details_defense'); 
			return false;
		};
		var JSN, valeur;
		for(k=0; k<2; k++) {
			JSN = (k === 0) ? 'sans' : 'avec';
			ligne = page.tableau.insertRow(-1);
			cell = ligne.insertCell(0);
			ligne.setAttribute('style','display:none');
			ligne.setAttribute('id','zzzelp_details_defense');
			cell.innerHTML = 'Défense full XP (' + JSN + ' JSN)';	
			for(n=0; n<3; n++){
				className = 'tooltip_zzzelp_stats_defense_XP_' + JSN + '_JSN_' + n;
				var armee_XP = page.armees[n].XP(k == 1);
				defense_HB =  armee_XP.getDefenseHB();
				defense_AB = armee_XP.getDefenseAB();
				bonus_armes = defense_AB*(0.1*armee_XP.niveaux.armes);
				cell = ligne.insertCell(n+1);
				cell.setAttribute('colspan','3');
				cell.innerHTML = ze_Nombre(defense_AB);
				cell.setAttribute('class',className);
				cell.setAttribute('title','');	
				page.genererTooltip(className, [
					{ titre : 'Gain', valeur : (page.armees[n].isNull() ? 0 : parseInt(((armee_XP.getDefenseHB()/page.armees[n].getDefenseHB())-1)*1000)/10) + '%' },
					{ titre : 'Défense HB', valeur : defense_HB },
					{ titre : 'Bonus armes', valeur : bonus_armes }
				]);
			}
		}
	};

	this.lignesConsommation = function() {
		var ligne = page.tableau.insertRow(-1),
			cell, contenu, className, consommation;
		ligne.setAttribute('id','zzzelp_conso');
		ligne.setAttribute('style','cursor:pointer');
		ligne.setAttribute('class','ligne_paire');
		cell = ligne.insertCell(0);
		cell.innerHTML = 'Consommation journalière';	
		for(var n=0;n<3;n++) {
			consommation = page.armees[n].getConsommation();
			cell = ligne.insertCell(n+1);
			cell.setAttribute('colspan','3');
			cell.innerHTML = "<img src=\"http://www.fourmizzz.fr/images/icone_pomme.gif\"> " + ze_Nombre(consommation);
		}
		document.querySelector('#zzzelp_conso').onclick = function onclick(event) {
			page.showDetails('zzzelp_details_conso'); 
			return false;
		};
		var JSN, valeur;
		for(k=0; k<2; k++) {
			JSN = (k === 0) ? 'sans' : 'avec';
			ligne = page.tableau.insertRow(-1);
			cell = ligne.insertCell(0);
			ligne.setAttribute('style','display:none');
			ligne.setAttribute('id','zzzelp_details_conso');
			ligne.setAttribute('class','ligne_paire');
			cell.innerHTML = 'Consommation full XP (' + JSN + ' JSN)';	
			for(n=0; n<3; n++){
				var armee_XP = page.armees[n].XP(k == 1);
				consommation = armee_XP.getConsommation();
				cell = ligne.insertCell(n+1);
				cell.setAttribute('colspan','3');
				cell.innerHTML = ze_Nombre(consommation);
			}
		}
	};

	this.lignesHOF = function() {
		var ligne = page.tableau.insertRow(-1),
			cell, contenu, className, HOF;
		ligne.setAttribute('id','zzzelp_HOF');
		ligne.setAttribute('style','cursor:pointer');
		cell = ligne.insertCell(0);
		cell.innerHTML = 'Années de ponte';	
		for(var n=0;n<3;n++) {
			HOF = page.armees[n].getHOFAnnees();
			cell = ligne.insertCell(n+1);
			cell.setAttribute('colspan','3');
			cell.innerHTML = "<img src=\"http://www.fourmizzz.fr/images/icone_sablier.gif\"> " + ze_Nombre(HOF);
		}
		document.querySelector('#zzzelp_HOF').onclick = function onclick(event) {
			page.showDetails('zzzelp_details_HOF'); 
			return false;
		};
		var JSN, valeur;
		for(k=0; k<2; k++) {
			JSN = (k === 0) ? 'sans' : 'avec';
			ligne = page.tableau.insertRow(-1);
			cell = ligne.insertCell(0);
			ligne.setAttribute('style','display:none');
			ligne.setAttribute('id','zzzelp_details_HOF');
			cell.innerHTML = 'Années full XP (' + JSN + ' JSN)';	
			for(n=0; n<3; n++){
				var armee_XP = page.armees[n].XP(k == 1);
				HOF = armee_XP.getHOFAnnees();
				cell = ligne.insertCell(n+1);
				cell.setAttribute('colspan','3');
				cell.innerHTML = ze_Nombre(HOF);
			}
		}
	};

	this.ligneCapaFlood = function() {
		var ligne = page.tableau.insertRow(-1);
		ligne.setAttribute('id','zzzelp_CDF');
		ligne.setAttribute('class','ligne_paire');
		cell = ligne.insertCell(0);
		cell.innerHTML = 'Capacité de flood';	
		for(var n=0;n<3;n++) {
			cell = ligne.insertCell(n+1);
			cell.setAttribute('colspan','3');
			cell.innerHTML = "<img src=\"http://www.fourmizzz.fr/images/favicon.gif\"> " + ze_Nombre(page.armees[n].getCapaFlood());
		}
	};

	this.showDetails = function(id) {
		var lignes = document.querySelectorAll('#' + id);
		for(var i=0;i<lignes.length;i++) {
			lignes[i].style.display = (lignes[i].style.display == 'none') ? '' : 'none';
		}
	};

	this.createAntisondeButton = function() {
		var input = document.createElement('input');
		input.type = 'button';
		input.value = 'Placer antisonde';	
		input.onclick = function onclick(event) {
			var antisonde = ZzzelpScript.parameters('antisonde');
			if(antisonde === null) {
				antisonde = [
							[{ unite : 0, valeur : 1 }],
							[{ unite : 0, valeur : 10000 }]
								];
			}
			Placement_antisonde_Ajax([
				[antisonde[0].unite, antisonde[0].valeur], 
				[antisonde[1].unite, antisonde[1].valeur]], 
				document.querySelector('#t').value, 1, true
			);
		};
		page.tableau.rows[1].cells[0].innerHTML = '';
		page.tableau.rows[1].cells[0].appendChild(input);
	};


	this.init();
}
