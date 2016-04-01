function ZzzelpScriptAnalyseurChasse(chasses) {

	var that = this;

	this.content = chasses;

	this.lignes_chasse = new Array(
		{
			regexp : 'Troupes en attaque( |):( |)([^.]+)',
			action : function(valeurs, ligne, regexp) {
				valeurs.attaquant.armee = ZzzelpScriptArmee.analyse(new RegExp(regexp).exec(ligne)[3]);
				return valeurs;
			}
		},
		{
			regexp : 'Troupes en défense( |):( |)([^.]+)',
			action : function(valeurs, ligne, regexp) {
				var unites = new RegExp(regexp).exec(ligne)[3].split(','),
					armee_def = new ZzzelpScriptArmee(undefined, undefined, 'chasse');
				for(var j=0; j<unites.length; j++) {
					var data_unite = new RegExp('([0-9 ]+)(.*)').exec(unites[j]),
						valeur = parseInt(data_unite[1].replace(/ /g, ""));
					if(~unites_chasses.noms_pluriel.indexOf(data_unite[2].trim())) {
						armee_def.setUnite(unites_chasses.noms_pluriel.indexOf(data_unite[2].trim()), valeur);
					}
					else {
						armee_def.setUnite(unites_chasses.noms_singulier.indexOf(data_unite[2].trim()), valeur);	
					}
				}
				valeurs.defenseur.armee = armee_def;
				return valeurs;
			}
		},
		{
			regexp : 'Vous infligez <strong>([ 0-9]+)\\(\\+([ 0-9]+)\\)<\\/strong> dégâts et tuez <strong>([ 0-9]+)<\\/strong> ennemie|ennemies',
			action : function(valeurs, ligne, regexp) {
				var variables = new RegExp(regexp).exec(ligne),
					valeur = parseInt(variables[3].replace(/ /g, ''));
				valeurs.defenseur.total_morts += valeur;
				valeurs.defenseur.morts.push(valeur);
				valeurs.attaquant.degats.push({ 
					HB : parseInt(variables[1].replace(/ /g, '')), 
					bonus : parseInt(variables[2].replace(/ /g, ''))
				});
				return valeurs;
			}
		},
		{
			regexp : 'ennemie inflige <strong>([ 0-9]+)\\(\\+([ 0-9]+)\\)<\\/strong> dégâts à vos fourmis et en tue <strong>([ 0-9]+)<\\/strong>',
			action : function(valeurs, ligne, regexp) {
				var variables = new RegExp(regexp).exec(ligne),
					valeur = parseInt(variables[3].replace(/ /g, ''));
				valeurs.attaquant.total_morts += valeur;
				valeurs.attaquant.morts.push(valeur);
				valeurs.defenseur.degats.push({ 
					HB : parseInt(variables[1].replace(/ /g, '')), 
					bonus : parseInt(variables[2].replace(/ /g, ''))
				});
				return valeurs;
			}
		},
		{
			regexp : '- ([0-9 ]+) (.*) sont devenues des (<strong>|)(.*)(<\\/strong>|)',
			action : function(valeurs, ligne, regexp, offensif) {
				var resultats = new RegExp(regexp).exec(ligne),
					data = { nombre : parseInt(resultats[1].replace(/ /g, '')) }; 
				if(ZzzelpScriptArmee.noms_pluriel.indexOf(resultats[2]) >= 0) {
					data.avant = ZzzelpScriptArmee.noms_pluriel.indexOf(resultats[2]);
				}
				else {
					data.avant = ZzzelpScriptArmee.noms_singulier.indexOf(resultats[2]);
				} 
				if(ZzzelpScriptArmee.noms_pluriel.indexOf(resultats[4]) >= 0) {
					data.apres = ZzzelpScriptArmee.noms_pluriel.indexOf(resultats[4]);
				}
				else {
					data.apres = ZzzelpScriptArmee.noms_singulier.indexOf(resultats[4]);
				}
				valeurs.attaquant.unites_XP.push(data);	
				return valeurs;
			}
		},
		{
			regexp : 'Vos chasseuses ont conquis <strong>([0-9 ]+) cm(²|2)<\\/strong>, les carcasses des prédateurs vous rapportent <strong>([0-9 ]+)<\\/strong>',
			action : function(valeurs, ligne, regexp) {
				var variables = new RegExp(regexp).exec(ligne);
				valeurs.TDC_chasse = parseInt(variables[1].replace(/ /g, ''));
				valeurs.nourriture = parseInt(variables[3].replace(/ /g, ''));
				return valeurs;
			}
		}
	);

	this.main = function() {
		that.splitChasses();
		that.parseChasses();
		if(that.analyses.length > 0) {
			that.groupAnalyses();
			that.analyse_textuelle = new ZzzelpScriptAnalyseTextuelle('chasse', that.analyseTotal).getContent();
		}
	};

	this.getValues = function() {
		return that.analyseTotal;
	};

	this.splitChasses = function() {
		var lignes = that.content.split('\n'),
			rapports = [],
			rapport = [];
		for(var i=0; i<lignes.length; i++) {
			if(~lignes[i].indexOf('Troupes en attaque') && rapport.length > 0) {
				rapports.push(rapport);
				rapport = [];
			}
			rapport.push(lignes[i]);
		}
		rapports.push(rapport);
		that.chasses = rapports;
	};

	that.initValeursChasse = function() {
		return {
			mode : 'chasse',
			TDC_chasse : 0,
			nourriture : 0,
			attaquant : {
				morts : [],
				total_morts : 0,
				degats : [],
				unites_XP : []
			},
			defenseur : {
				morts : [],
				total_morts : 0,
				degats : []
			}
		};
	};

	this.parseChasses = function() {
		that.analyses = [];
		for(var k=0; k<that.chasses.length; k++) {
			var valeurs = that.initValeursChasse(),
				lignes = that.chasses[k];
			if(~lignes[0].indexOf('Troupes en attaque')) {
				for(var n=0; n<lignes.length ; n++) {
					var ligne = lignes[n];
					for(var i=0; i<that.lignes_chasse.length; i++) {
						var l = that.lignes_chasse[i];
						if(ligne.match(l.regexp)) {
							valeurs = l.action(valeurs, ligne, l.regexp);
						}
					}
				}
				that.analyses.push({
					valeurs : that.analyse(valeurs),
					chasse : lignes
				});
			}
		}
	};

	this.getVieChasse = function(armee) {
		var vie = 0,
			coeffs = [50,90,100,105,140,200,700,220,450,1000,5000,900,4800,8400,13000,105000,6600000];
		for(var i=0;i<17;i++) {
			vie += armee.getUnite(i)*coeffs[i];
		}
		return vie;		
	};

	this.analyse = function(valeurs) {
		valeurs.attaquant.armee.computeArmes(valeurs.attaquant.degats[0]);
		if(valeurs.attaquant.degats.length > 1 || !valeurs.attaquant.armee.isDead(valeurs.attaquant.total_morts)) {
			valeurs.attaquant.armee.computeNiveauxVie(valeurs.attaquant.morts[0], valeurs.defenseur.degats[0]);
		}
		valeurs.attaquant.armee_apres = valeurs.attaquant.armee.armeePostCombat(valeurs.attaquant.total_morts);
		valeurs.attaquant.armee_XP = valeurs.attaquant.armee_apres.applyXP(valeurs.attaquant.unites_XP);
		valeurs.defenseur.armee_apres = valeurs.defenseur.armee.armeePostCombat(valeurs.defenseur.total_morts);

		valeurs.defenseur.vie = that.getVieChasse(valeurs.defenseur.armee);
		valeurs.replique = valeurs.attaquant.armee.computeReplique(valeurs.defenseur.vie);

		return valeurs;
	};

	this.groupAnalyses = function() {
		var valeurs = {
			attaquant : {
				armee : that.analyses[0].valeurs.attaquant.armee.new_armee(),
				armee_apres : that.analyses[0].valeurs.attaquant.armee.new_armee(),
				armee_XP : that.analyses[0].valeurs.attaquant.armee.new_armee(),
				unites_XP : ZzzelpScriptArmee.getEmptyArmee(14),
				total_morts : 0,
				
			},
			nourriture : 0,
			TDC_chasse : 0,
			details : that.analyses
		};
		for(var i=0; i<that.analyses.length; i++) {
			var analyse = that.analyses[i].valeurs;
			valeurs.TDC_chasse += analyse.TDC_chasse;
			valeurs.attaquant.total_morts += analyse.attaquant.total_morts;
			valeurs.nourriture += analyse.nourriture;
			for(var n=0; n<14; n++) {
				valeurs.attaquant.armee.addUnite(n, analyse.attaquant.armee.getUnite(n));
				valeurs.attaquant.armee_apres.addUnite(n, analyse.attaquant.armee_apres.getUnite(n));
				valeurs.attaquant.armee_XP.addUnite(n, analyse.attaquant.armee_XP.getUnite(n));
			}
			var unites_XP = analyse.attaquant.unites_XP;
			for(n=0; n<unites_XP.length; n++) {
				valeurs.attaquant.unites_XP[unites_XP[n].avant] += unites_XP[n].nombre;
			}
		}
		that.analyseTotal = valeurs;
	};

	this.initMessagerie = function(id) {
		var table = document.querySelector('#table_liste_conversations'),
			zone = document.createElement('div'),
			entete = document.createElement('div'),
			bouton = document.createElement('div');
		bouton.setAttribute('class', 'bouton_analyse');
		bouton.innerHTML = 'Afficher les analyses';
		bouton.onclick = function onclick(event) {
			zone.style.display = (zone.style.display === '' ? 'none' : '');
		};
		entete.appendChild(bouton);
		var style = 'margin:50px 0;text-align:center;font-family:Consolas,Monaco,Lucida Console,';
		style += 'Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;font-size:0.9em;display:none';
		zone.setAttribute('style', style);
		table.rows[document.querySelector('#' + id).rowIndex + 2].querySelector('tr[id*="reactions_"] td').appendChild(entete);
		table.rows[document.querySelector('#' + id).rowIndex + 2].querySelector('tr[id*="reactions_"] td').appendChild(zone);
		that.createZone(zone);
	};

	this.createZone = function(zone) {
		if(that.analyses.length === 0) {
			return document.createElement('div');
		}		
		var resultat_HTML = '',
			resultat_BBCode_FE = '',
			resultat_BBCode_FI = '';
			
		for(var n=0; n<that.analyse_textuelle.length; n++) {
			resultat_HTML += '|' + that.analyse_textuelle[n].HTML + '|<br>';
			resultat_BBCode_FE += that.analyse_textuelle[n].BBCode_FE;
			resultat_BBCode_FI += that.analyse_textuelle[n].BBCode_FI + '\n';
		}

		var raccourci_FE = document.createElement('div'),
			raccourci_FI = document.createElement('div'),
			zone_HTML = document.createElement('div'),
			contenu_FE = document.createElement('textarea'),
			contenu_FI = document.createElement('textarea');
			
		raccourci_FE.innerHTML = 'Copier sur un forum externe';
		raccourci_FI.innerHTML = 'Copier sur un forum Fourmizzz';
		contenu_FE.value = '[center][table]\n' + resultat_BBCode_FE + '[/table][/center]';
		contenu_FI.value = '[center][code]\n' + resultat_BBCode_FI + '\n[/code][/center]';
		raccourci_FE.setAttribute('style', 'text-align:center;font-weight:bold;margin:15px 0;cursor:pointer;');
		raccourci_FI.setAttribute('style', 'text-align:center;font-weight:bold;margin:15px 0;cursor:pointer;');
		contenu_FE.setAttribute('style', ' width: 80%;height: 150px;margin: 25px 0;display:none;');
		contenu_FI.setAttribute('style', ' width: 80%;height: 150px;margin: 25px 0;display:none;');
		zone_HTML.setAttribute('style', 'margin-top:50px;');
		
		zone_HTML.setAttribute('class', 'zzzelp_analyse_RC');
		zone_HTML.innerHTML = '<code>' + resultat_HTML + '</code>';
		
		raccourci_FE.onclick = function onclick(event) {
			contenu_FE.style.display = (contenu_FE.style.display === '' ? 'none' : '');
		};
		raccourci_FI.onclick = function onclick(event) {
			contenu_FI.style.display = (contenu_FI.style.display === '' ? 'none' : '');
		};
		
		zone.appendChild(zone_HTML);
		zone.appendChild(raccourci_FE);
		zone.appendChild(contenu_FE);	
		zone.appendChild(raccourci_FI);
		zone.appendChild(contenu_FI);
	};





	this.main();



}