function ZzzelpScriptSmileys(lieu, section) {

	var smileys = this;

	this.section = section;
	this.lieu = lieu;
	this.liste = ZzzelpScript.parameters('smileys');

	this.init = function() {
		if(!smileys.section) {
			smileys.section = document;
		}
		var images = smileys.section.querySelectorAll('img[title=Smiley]');
		for(var n=0; n<images.length; n++) {
			smileys.removeOldInterface(images[n]);
			smileys.addSmileys();
		}
		if(this.lieu == 'MC') {
			this.manageMC();
		}
	};

	this.manageMC = function() {
		var bouton = document.querySelector('.boiteMessagerie input[type="submit"]'),
			txt =  "document.querySelector('#message_collectif').value = ze_Preparation_message(document.querySelector('#message_collectif').value);";
		bouton.setAttribute('onclick', txt + bouton.getAttribute('onclick'));
	};

	this.addSmileys = function(img_source) {
		var element = smileys.section.querySelector('#ze_gestion_smileys_' + smileys.nom_section),
			smileys_section = smileys.section.querySelectorAll('#tousLesSmiley' + smileys.nom_section + ' div'),
			i, j;
		for(j=0; j<smileys_section.length; j++) {
			i = parseInt(smileys_section[j].id.replace('listeSmiley','').substring(0,1));
			if((i > 1 && !ComptePlus) || !in_array('C' + i,smileys.liste[1])) {
				ze_Supprimer_element(smileys_section[j]);
			}
			else {
				smileys_section[j].dataset.npack = 'C' + i;
			}
		}
		i=0;
		for(var pack in smileys.liste[0]) {
			if(smileys.liste[0][pack].liste !== null) {
				smileys.section.querySelector('#tousLesSmiley' + smileys.nom_section).appendChild(smileys.createGroupSmileys(pack, smileys.liste[0][pack], i));
				i++;
			}
		}
	  	var longueur = smileys.section.querySelectorAll('#tousLesSmiley' + smileys.nom_section + ' div[data-npack="' + ze_readCookie('zzzelp_ligne_smiley_' + ze_serveur) + '"]').length,
	  		active;
		if(ze_readCookie('zzzelp_ligne_smiley_' + ze_serveur) !== null && longueur > 0) {
			active = ze_readCookie('zzzelp_ligne_smiley_' + ze_serveur);
		}
		else {
			active = smileys.section.querySelector('#tousLesSmiley' + smileys.nom_section + ' div').dataset.npack;
		}
		ze_createCookie('zzzelp_ligne_smiley_' + ze_serveur, active, 365);
	  
		smileys_section = smileys.section.querySelectorAll('#tousLesSmiley' + smileys.nom_section + ' div');
		for(i=0; i<smileys_section.length; i++) {
			if(smileys_section[i].dataset.npack == active) {
				smileys_section[i].style.display = '';
				smileys_section[i].dataset.affiche = '1';
			}
			else {
				smileys_section[i].style.display = 'none';
				smileys_section[i].dataset.affiche = '0';
			}
		}		
		var content = smileys.section.querySelector('#tousLesSmiley' + smileys.nom_section);
		for(var k=0; k<smileys.liste
			[1].length; k++) {
			if(content.querySelector('div[data-npack="' + smileys.liste[1][k] + '"]') !== null) {
				content.appendChild(content.querySelector('div[data-npack="' + smileys.liste[1][k] + '"]'));
			}
		}
	};

	this.removeOldInterface = function(img_source) {
		smileys.nom_section = new RegExp('changerCookieSmiley\\(\'(.*)\'\\)').exec(img_source.getAttribute('onclick'))[1];
		ze_Supprimer_element(smileys.section.querySelector('#smileyPrecedent' + smileys.nom_section));
		ze_Supprimer_element(smileys.section.querySelector('#smileySuivant' + smileys.nom_section));
		
		smileys.show = (smileys.section.querySelector('#tousLesSmiley' + smileys.nom_section).style.display != 'none');
		var gestion_smileys = smileys.createZone();

		img_source.parentNode.parentNode.insertBefore(gestion_smileys, img_source.parentNode.nextSibling);
		ze_Supprimer_element(img_source);
	};

	this.createZone = function() {
		var gestion_smileys = document.createElement('span'),
			zone_avant = document.createElement('span'),
			avant = document.createElement('img'),
			zone_apres = document.createElement('span'),
			apres = document.createElement('img'),
			zone_open_smiley = document.createElement('span'),
			open_smiley = document.createElement('img');
			
		gestion_smileys.setAttribute('id','ze_gestion_smileys_' + smileys.nom_section);
		zone_apres.onclick = function onclick(event) {
			smileys.changeSmileyPack(true, smileys.nom_section);
		};
		zone_avant.onclick = function onclick(event) {
			smileys.changeSmileyPack(false, smileys.nom_section);
		};
		open_smiley.setAttribute('onclick', 'changerCookieSmiley("' + smileys.nom_section + '")');
		
		open_smiley.src = 'http://zzzelp.fr/Images/Smileys/Zzzelp/smile.gif';
		avant.src = "/images/fleche-champs-gauche.gif";
		apres.src = "/images/fleche-champs-droite.gif";
		avant.id = "smileyPrecedent" + smileys.nom_section;
		apres.id = "smileySuivant" + smileys.nom_section;
		
		zone_avant.style.cursor = 'pointer';
		zone_avant.style.position = 'relative';
		zone_avant.style.top = '2px';
		zone_avant.style.visibility = (smileys.show ? 'visible' : 'hidden');
	 
		zone_apres.style.cursor = 'pointer';
		zone_apres.style.position = 'relative';
		zone_apres.style.top = '2px';
		zone_apres.style.visibility = (smileys.show ? 'visible' : 'hidden');
		
		zone_open_smiley.style.cursor = 'pointer';
		zone_open_smiley.style.position = 'relative';
		zone_open_smiley.style.top = '4px';
		zone_open_smiley.style['margin-left'] = '2px';
		zone_open_smiley.style['margin-right'] = '2px';
		
		zone_avant.appendChild(avant);
		zone_apres.appendChild(apres);
		zone_open_smiley.appendChild(open_smiley);
		gestion_smileys.appendChild(zone_avant);
		gestion_smileys.appendChild(zone_open_smiley);
		gestion_smileys.appendChild(zone_apres);
		return gestion_smileys;
	};

	this.createGroupSmileys = function(pack, donnees, i) {
		var ligne = document.createElement('div');
		ligne.setAttribute('id', 'zone_smileys_zzzelp_' + donnees.ID);
		ligne.setAttribute('style', 'display:none;margin-top:20px');
		ligne.dataset.npack = 'Z'+ donnees.ID;
		ligne.dataset.numero = i;
		for(var k=0; k<donnees.liste.length; k++) {
			var smiley = smileys.createSmiley(pack, donnees.liste[k], donnees.format);
			smileys.addEventSmiley(smiley, i);
			ligne.appendChild(smiley);
		}
		return ligne;
	};

	this.createSmiley = function(pack, name, format) {
	  var smiley = document.createElement('img');
	  smiley.setAttribute('src', 'http://zzzelp.fr/Images/Smileys/' + pack + '/' + name + '.' + format);
	  smiley.setAttribute('style', 'padding:0 2px');
	  smiley.dataset.nom = name;
	  smiley.dataset.pack = pack;
	  return smiley;
	};

	this.addEventSmiley = function(smiley, i) {
		if(smileys.lieu == 'new_MP') {
			arg = 'message_envoi';
		}
		else if(smileys.lieu == 'MC') {
			arg = 'message_collectif';
		}
		else if(~smileys.lieu.indexOf('champ_reponse_')) {
			arg = lieu;
		}
		else {
			arg = 'message';
		}
		smiley.onclick = function onclick(event) {
			addRaccourciSmiley(arg, 'z' + i + '_'  + this.dataset.nom);
			return false;
		};
	};

	this.sortSmileys = function(ordre) {
		var packs = smileys.section.querySelectorAll('.tousLesSmiley div');
		for (var i=1;i<packs.length;i++) {
			ligne = smileys.section.querySelectorAll('.tousLesSmiley div')[i];
			j = i;
			while (j > 0 && ordre.indexOf(ligne.dataset.npack) > ordre.indexOf(smileys.section.querySelectorAll('.tousLesSmiley div')[j-1].dataset.npack)) {
				smileys.switchPosition(smileys.section.querySelectorAll('.tousLesSmiley div')[j]);
				j--;
			}
		}
	};

	this.switchPosition = function(row) {
		var sibling = row.previousElementSibling,
			anchor = row.nextElementSibling,
			parent = row.parentNode;
		parent.insertBefore(row, sibling);
	};

	this.getPacks = function() {
		var liste = smileys.section.querySelector('div[id*="tousLesSmiley"]').querySelectorAll('div'),
			packs = [];
		for(var k=0; k<liste.length; k++) {
			packs.push(liste[k].id);
		}
		return packs;
	};

	this.changeSmileyPack = function(avancer, id) {
		var zones = document.querySelectorAll('#tousLesSmiley' + id + ' div'),
			e;
		for(var i=0; i<zones.length; i++) {
			if(zones[i].dataset.affiche == '1') {
				if(avancer) {
					e = zones[i].nextElementSibling;
					if(e  === null) {
						e = zones[0];
					}
				}
				else {
					e = zones[i].previousElementSibling;
					if(e === null) {
						e = zones[zones.length-1];
					}
				}
				zones[i].style.display = 'none';
				zones[i].dataset.affiche = '0';
			}
		}
		e.style.display = '';
		e.dataset.affiche = '1';  
		ze_createCookie('zzzelp_ligne_smiley_' + ze_serveur, e.dataset.npack, 365);
	};

	this.init();

}

/* Prépare les divers ajouts au FI tels que les smileys Zzzelp (Page Alliance) */
function ze_Amelioration_FI() {
	if(document.querySelector('.tousLesSmiley') && !document.querySelector('#zzzelp_smileys_places')) {
		var input = document.createElement('input'),
			lieu;
		input.id = 'zzzelp_smileys_places';
		input.type = 'hidden';
		if(document.querySelector('#nouveauSujet')) {
			document.querySelector('#nouveauSujet').appendChild(input);
			lieu = new Array('nouveauSujet', 'NouveauSujet');
		}
		else {
			document.querySelector('#nouveauMessage').appendChild(input);
			lieu = new Array('nouveauMessage', 'NouveauMessage');
		}
		document.querySelector('#forum input[type*="submit"]').setAttribute('onclick', 'document.querySelector(\'#message\').value = ze_Preparation_message(document.querySelector(\'#message\').value);xajax_envoi' + lieu[1] + '(xajax.getFormValues(\'' + lieu[0] + '\')); return false;');
		ZzzelpScriptSmileys('FI');
	}
	setTimeout(function(){ze_Amelioration_FI();},50);
}

