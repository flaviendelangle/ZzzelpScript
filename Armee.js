function ZzzelpScriptArmee(unites, niveaux, mode) {
	
	var armee = this;
	this.mode = (typeof mode == 'undefined') ? 'armee' : 'chasse';
	this.length = (this.mode == 'armee') ? 14 : 17;
	
	this.new_armee = function() {
		return new ZzzelpScriptArmee(ZzzelpScriptArmee.getEmptyArmee(armee.length), armee.niveaux);
	};

	this.copy = function() {
		return new ZzzelpScriptArmee(JSON.parse(JSON.stringify(armee.unites)), JSON.parse(JSON.stringify(armee.niveaux)));
	};

	this.extraction_armee = function (n) {
		var armee_2 = armee.new_armee(),
			i = 0, k = 0;
		while (i<n) {
			if(i + armee.unites[armee.length-1-k] <= n) {
				i += armee.unites[armee.length-1-k];
				armee_2.unites[armee.length-1-k] = armee.unites[armee.length-1-k];
			}
			else {
				armee_2.unites[armee.length-1-k] = n - i;
				i = n;
			}
			k++;
		}
		return armee_2;
	};

	this.armeePostCombat = function(morts) {
		return armee.extraction_armee(armee.getCapaFlood() - morts);	
	};

	this.noXP = function() {
		var a = armee.unites,
			unites = [a[0]+a[1]+a[2],0,0,a[3]+a[4]+a[9],0,a[5]+a[6],0,a[7]+a[8],0,0,a[10]+a[11],0,a[12]+a[13],0];
		return new ZzzelpScriptArmee(unites, armee.niveaux);
	};

	this.XP = function(JSN) {
		return JSN ? this.XPavecJSN() : this.XPsansJSN();
	};

	this.XPavecJSN = function() {
		var a = armee.unites,
			unites = [0,0,a[0]+a[1]+a[2],0,0,0,a[5]+a[6],0,a[7]+a[8],a[3]+a[4]+a[9],0,a[10]+a[11],0,a[12]+a[13]];
		return new ZzzelpScriptArmee(unites, armee.niveaux);
	};

	this.XPsansJSN = function() {
		var a = armee.unites,
			unites = [a[0],0,a[1]+a[2],0,0,0,a[5]+a[6],0,a[7]+a[8],a[3]+a[4]+a[9],0,a[10]+a[11],0,a[12]+a[13]];
		return new ZzzelpScriptArmee(unites, armee.niveaux);
	};

	this.isXP = function() {
		for(var i=0; i<armee.length; i++) {
			if(ZzzelpScriptArmee.unites_XP && armee.getUnite(i) > 0) {
				return false;
			}
		}
		return true;
	};

	this.isNull = function() {
		return (armee.getCapaFlood() === 0);
	};

	this.isDead = function(kill) {
		return (armee.getCapaFlood() <= kill);
	};

	this.getUnite = function(unite) {
		return armee.unites[unite];
	};

	this.setUnite = function(unite, valeur) {
		armee.unites[unite] = valeur;
	};

	this.addUnite = function(unite, valeur) {
		armee.unites[unite] += valeur;
	};

	this.getAttaqueHB = function() {
		var attaque = 0,
			coeffs = ZzzelpScriptArmee.attaque;
		for(var i=0;i<armee.length;i++) {
			attaque += armee.unites[i]*coeffs[i];
		}
		return attaque;
	};

	this.getVieHB = function() {
		var vie = 0,
			coeffs = ZzzelpScriptArmee.vie;
		for(var i=0;i<armee.length;i++) {
			vie += armee.unites[i]*coeffs[i];
		}
		return vie;
	};

	this.getDefenseHB = function() {
		var defense = 0,
			coeffs = ZzzelpScriptArmee.defense;
		for(var i=0;i<armee.length;i++) {
			defense += armee.unites[i]*coeffs[i];
		}
		return defense;
	};

	this.getCapaFlood = function() {
		var capa_flood = 0;
		for(var i=0;i<armee.length;i++) {
			capa_flood += armee.unites[i];
		}
		return capa_flood;
	};

	this.getConsommation = function() {
		var consommation = 0,
			coeffs = ZzzelpScriptArmee.consommation,
			pourcentages = [0.05,0.1,0.15];
		for(var i=0;i<armee.length;i++) {
			consommation += armee.unites[i]*coeffs[i]*pourcentages[this.niveaux.lieu];
		}
		return parseInt(consommation);
	};

	this.getHOF = function() {
		var secondes = 0,
			coeffs = ZzzelpScriptArmee.HOF;
		for(var i=0;i<armee.length;i++) {
			secondes += armee.unites[i]*coeffs[i];
		}
		return secondes;
	};

	this.getHOFAnnees = function() {
		return parseInt(this.getHOF()/31557600);
	};

	this.getVieAB = function() {
		if(armee.niveaux.lieu === 0) {
			return parseInt(this.getVieHB() * (1+0.1*armee.niveaux.bouclier));
		}
		else if(armee.niveaux.lieu == 1) {
			return parseInt(this.getVieHB() * (1+0.05*(armee.niveaux.niveau_lieu+2) + 0.1*armee.niveaux.bouclier));
		}
		else {
			return parseInt(this.getVieHB() * (1+0.15*(armee.niveaux.niveau_lieu+2) + 0.1*armee.niveaux.bouclier));
		}	
	};

	this.getAttaqueAB = function() {
		return parseInt(this.getAttaqueHB() * (1+armee.niveaux.armes*0.1));
	};

	this.getDefenseAB = function() {
		return parseInt(this.getDefenseHB() * (1+armee.niveaux.armes*0.1));
	};

	this.getStatistiquesAB = function() {
		return {
			attaque : this.getAttaqueAB(),
			defense : this.getDefenseAB(),
			vie : this.getVieAB(),
			capa_flood : this.getCapaFlood(),
			HOF : this.getHOF()
		};
	};

	this.logStatistiques = function() {
		armee.statistiques = armee.getStatistiquesAB();
	};

	this.getArmes = function() {
		return armee.niveaux.armes;
	};

	this.getBouclier = function() {
		return armee.niveaux.bouclier;
	};

	this.getNiveauLieu = function() {
		return armee.niveaux.niveau_lieu;
	};

	this.getLieu = function() {
		return armee.niveaux.lieu;
	};

	this.getVitesseChasse = function() {
		return armee.niveaux.vitesse_chasse;
	};


	/*
		Gestion des niveaux
	*/
	this.getDefaultLevels = function() {
		return {
			armes : 0,
			bouclier : 0,
			lieu : 0,
			niveau_lieu : 0,
			vitesse_chasse : 0
		};
	};

	this.setArmes = function(niv) {
		armee.niveaux.armes = niv;	
	};

	this.setBouclier = function(niv) {
		armee.niveaux.bouclier = niv;
	};

	this.setNiveauLieu = function(niv) {
		armee.niveaux.niveau_lieu = niv;
	};

	this.setLieu = function(niv) {
		armee.niveaux.lieu = niv;
	};

	this.setVitesseChasse = function(niv) {
		armee.niveaux.vitesse_chasse = niv;
	};

	this.computeArmes = function(degats) {
		armee.niveaux.armes = (degats.HB > 9) ? Math.round(10*(degats.bonus/degats.HB)) : 0;
	};

	this.computeNiveauxVie = function(morts, degats) {
		var vie_tuee = armee.getViePerdue(morts, armee);
		if(vie_tuee > 0) {
			if(this.getLieu() === 0) {
				armee.setBouclier(Math.round((((degats.HB + degats.bonus) / vie_tuee) - 1) * 10));
			}
			else {
				armee.computeNiveauxVieHorsTDC(morts, degats, vie_tuee);
			}
		}
	};

	this.computeNiveauxVieHorsTDC = function(morts, degats, vie_tuee) {
		var lieu = armee.niveaux.lieu;
		for(var ecart = 0; ecart<5; ecart++) {
			for(i=-1; i<2; i+=2) {
				if(ecart > 0 || i == 1) {
					var bouclier = armee.getArmes() + ecart*i,
						niveau_lieu = (((degats.HB + degats.bonus) / vie_tuee) - 1 - bouclier * 0.1) / ((lieu == 1) ? 0.05 : 0.15) - 2;
					if (Math.abs(niveau_lieu - Math.round(niveau_lieu)) < 0.1 && niveau_lieu <= 45) {
						armee.setBouclier(bouclier); 
						armee.setNiveauLieu(Math.round(niveau_lieu));
						break;
					}
				}
			}
		}
	};

	this.computeReplique = function(vie_def) {
		var attaque = armee.getAttaqueAB();
		if(attaque > vie_def*3) {
			return 0.1;
		}
		else if(attaque > vie_def*2) {
			return 0.3;
		}
		else if(attaque > vie_def*1,5) {
			return 0.5;
		}
		else {
			return 1;
		}
	};


	this.getViePerdue = function(morts) {
		var vie = 0,
			n = morts;
		for(var i=0;i<armee.length;i++) {
			if(n > armee.unites[i]) {
				vie += armee.unites[i]*ZzzelpScriptArmee.vie[i];
				n -= armee.unites[i];
			}
			else if(n > 0) {
				vie += (n+0.5)*(ZzzelpScriptArmee.vie[i]);
				n = 0;
			}
		}
		return vie;
	};


	/*
		Gestion de l'XP
	*/
	this.applyXP = function(XPs) {
		var unites = armee.unites.slice(),
			armee_XP = armee.copy();
		for(var i=0; i<XPs.length; i++) {
			armee_XP.unites[XPs[i].avant] -= XPs[i].nombre;
			armee_XP.unites[XPs[i].apres] += XPs[i].nombre;
		}
		return armee;
	};

	this.unites = (unites ? unites : ZzzelpScriptArmee.getEmptyArmee(armee.length));
	this.niveaux = (niveaux ? niveaux : armee.getDefaultLevels());
}

ZzzelpScriptArmee.noms_singulier = new Array(
	"Jeune Soldate Naine", "Soldate Naine", "Naine d’Elite", "Jeune Soldate", "Soldate", "Concierge", "Concierge d’élite", 
	"Artilleuse", "Artilleuse d’élite", "Soldate d’élite", "Tank", "Tank d’élite", "Tueuse",  "Tueuse d’élite");
ZzzelpScriptArmee.noms_pluriel = new Array(
	"Jeunes Soldates Naines", "Soldates Naines", "Naines d’Elites", "Jeunes Soldates", "Soldates", "Concierges", "Concierges d’élites", 
	"Artilleuses", "Artilleuses d’élites", "Soldates d’élites", "Tanks", "Tanks d’élites", "Tueuses",  "Tueuses d’élites");
ZzzelpScriptArmee.ex_noms_singulier = new Array(
	"Jeune Soldate Naine", "Soldate Naine", "Naine d'Elite", "Jeune Soldate", "Soldate", "Concierge", "Concierge d'élite", 
	"Artilleuse", "Artilleuse d'élite", "Soldate d'élite", "Tank", "Tank d'élite", "Tueuse",  "Tueuse d'élite");
ZzzelpScriptArmee.ex_noms_pluriel = new Array(
	"Jeunes Soldates Naines", "Soldates Naines", "Naines d'Elites", "Jeunes Soldates", "Soldates", "Concierges", "Concierges d'élites", 
	"Artilleuses", "Artilleuses d'élites", "Soldates d'élites", "Tanks", "Tanks d'élites", "Tueuses",  "Tueuses d'élites");
ZzzelpScriptArmee.TAGs = new Array('JSN', 'SN', 'NE', 'JS', 'S', 'C', 'CE', 'A', 'AE', 'SE', 'Tk', 'TkE', 'T', 'TE');
ZzzelpScriptArmee.ordre = new Array('unite1', 'unite2', 'unite3', 'unite4', 'unite5', 'unite6', 'unite14', 
									'unite7', 'unite8', 'unite9', 'unite10', 'unite13', 'unite11', 'unite12');
ZzzelpScriptArmee.attaque = new Array(3,5,7,10,15,1,1,30,35,24,55,80,50,55); 
ZzzelpScriptArmee.vie = new Array(8,10,13,16,20,30,40,10,12,27,35,50,50,55); 
ZzzelpScriptArmee.defense = new Array(2,4,6,9,14,25,35,15,18,23,1,1,50,55);
ZzzelpScriptArmee.HOF = new Array(300,450,570,740,1000,1410,1410,1440,1520,1450,1860,1860,2740,2740);
ZzzelpScriptArmee.ID = new Array(1,2,3,4,5,6,14,7,8,9,10,13,11,12);
ZzzelpScriptArmee.consommation = new Array(16,20,26,30,36,70,100,30,34,44,100,150,80,90);
ZzzelpScriptArmee.unites_XP = new Array(true, true, false, true, true, true, false, true, false, false, true, false, true, false);

ZzzelpScriptArmee.getArmee = function(zone, mode) {
	var armee = [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		armees_lieu = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
		tableaux = zone.querySelectorAll('.simulateur'),
		tableau, i;
	for(i=0;i<tableaux.length;i++) {
		if(tableaux[i].rows[0].cells[0].getAttribute('colspan') == '10') {
			tableau = tableaux[i];
		}
	}
	if(tableau) {
		var lignes = tableau.rows;
		for(var n=2;n<lignes.length;n++) {
			if(lignes[n].querySelectorAll('td')[0].querySelectorAll('#Vie').length > 0) {
				break;
			}
			var colonnes = lignes[n].querySelectorAll('td'),
				unite = colonnes[0].querySelector('.pas_sur_telephone');
			if(unite !== null) {
				var index_unite = ZzzelpScriptArmee.noms_singulier.indexOf(unite.innerHTML);
				for(i=1;i<colonnes.length;i++) {
					var contenu = colonnes[i].innerHTML;
					if(~contenu.indexOf('unite') && contenu.indexOf('fleche') == -1) {
						var resultats = new RegExp('(.*),([0-3])' + (ComptePlus ? ',' : '') + '(.*)>([ 0-9]+)<\/span>').exec(contenu);
						try {
							var nombre = parseInt(resultats[4].replace(/ /g,"")),
								lieu = parseInt(resultats[2]);
							armee[index_unite] += nombre;
							armees_lieu[lieu-1][index_unite] += nombre;
						}
						catch(e) {
							console.log('ZzzelpScript : Impossible de récupérer le contenu : ' + contenu);  
						}
					}
				}
			}
		}
	}
	return new ZzzelpScriptArmee((mode === 0) ? armee : armees_lieu);
};

ZzzelpScriptArmee.getArmeeAjax = function(callBack) {
	new ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : 'Armee.php', addDOM : true },
		{ success : function(zone_page) {
			callBack(ZzzelpScriptArmee.getArmee(zone_page, 0));
		}
	});
};

ZzzelpScriptArmee.getArmeeReine = function(callBack) {
	new ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : 'Reine.php', addDOM : true },
		{ success : function(zone_page) {
			var valeurs = zone_page.querySelectorAll('span[id*="armee_initial"]'),
				armee = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0);
			for(var i=0; i<valeurs.length; i++) {
				var index = ZzzelpScriptArmee.noms_singulier.indexOf(valeurs[i].parentNode.querySelector('h2').innerHTML);
				if(index >= 0) {
					armee[index] = parseInt(valeurs[i].innerHTML);
				}
			}
			callBack(new ZzzelpScriptArmee(armee));
		}
	});
};

ZzzelpScriptArmee.new_armee_unite = function(n,i, niveaux) {
	var unites = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	unites[i] = n;
	return new ZzzelpScriptArmee(unites, niveaux);
};

/*
 * Tente a part d'une chaine de caractère d'extraire les unités du joueur. 
 * Pour l'instant gère les copies de la page armée et de RC
 * str -> array
*/
ZzzelpScriptArmee.analyse = function(texte, type) {
	var unites = ZzzelpScriptArmee.getEmptyArmee(14);
	texte = texte.replace(/(Vers le Terrain de Chasse)|(Vers la Fourmilière)|(Vers la Loge Impériale)/gi, '');
	texte = texte.replace(/(Vers le TDC)|(Vers le Fourmilière)|(Vers la Loge)/gi, '');
	texte = texte.replace(/(Vos raiders.*secondes?)|(Vos chasseuses.*secondes?)|(Vous allez attaquer.*secondes?)|(inflige.*\.)|(Arriv.*[0-9]{2}h[0-9]{2})|(\\(s\\))/gi, '');
	texte = texte.replace(/\]/gi, '\n').replace(/\[/gi, '\n');
	texte = texte.replace(/:/gi, ',');
	texte = texte.split("\n").join(',').split(',');	
	for(var i=0; i<texte.length; i++) {
		var ligne = texte[i].trim();
		if(isNaN(ligne.replace(/ /g, ''))) {
			var id_unite = ZzzelpScriptArmee.getIDunite(ligne);
			if(~id_unite) {
				unite_tampon = id_unite;
			}
			else if(!isNaN(ligne.replace(/ /g, '').replace(/	/g, ''))) {
				ligne = ligne.split('	');
				for(var k=0; k<ligne.length; k++) {
					if(ligne[k] !== '') {
						unites[unite_tampon] += parseInt(ligne[k].replace(/ /g, ''));
					}
				}
			}
			else if(ligne.match(new RegExp('([0-9 ]+) ([^.]+)'))) {
				var valeurs = new RegExp('([0-9 ]+) ([^.]+)').exec(ligne),
					unite = ZzzelpScriptArmee.getIDunite(valeurs[2]); 
				unites[unite] += parseInt(valeurs[1].replace(/ /g, ''));
			}
		}
		else if(ligne.length > 0 && ~unite_tampon) {
			unites[unite_tampon] += parseInt(ligne.replace(/ /g, ''));
		}
	}
	var armee = new ZzzelpScriptArmee(unites);
	return armee;
};

ZzzelpScriptArmee.getIDunite = function(unite) {
	var index = new Array(
		ZzzelpScriptArmee.noms_singulier,
		ZzzelpScriptArmee.noms_pluriel,
		ZzzelpScriptArmee.ex_noms_singulier,
		ZzzelpScriptArmee.ex_noms_pluriel,
		ZzzelpScriptArmee.TAGs
	);
	for(var n=0; n<index.length; n++) {
		if(~index[n].indexOf(unite)) {
			return index[n].indexOf(unite);
		}
	}
	return -1;
};

ZzzelpScriptArmee.getEmptyArmee = function(length) {
	var armee = [];
	for(var i=0; i<length; i++) {
		armee.push(0);
	}
	return armee;	
};
