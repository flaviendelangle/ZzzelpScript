function ZzzelpScriptPageLancementAttaques(zzzelp) {

	var that = this;

	this.cible = new RegExp('Vous allez attaquer (.*) !').exec(document.querySelector('.simulateur h2').innerHTML)[1];

	this.init = function() {
		new ZzzelpScriptCoordonnees([that.cible], [], that.showReturnClock);
		that.showStatistiques();
	};

	this.showReturnClock = function(coordonnees) {
		var	vitesse_attaque = zzzelp.compte.getVitesseAttaque(),
			defenseur = coordonnees[that.cible],
			attaquant = coordonnees[gpseudo],
			temps_trajet = ze_Calcul_temps_trajet(ze_Calcul_distance(attaquant.x, attaquant.y, defenseur.x, defenseur.y), vitesse_attaque),
			tableau = document.createElement('table');
		tableau.setAttribute('style', 'margin-top:20px');
		document.querySelector('.simulateur').appendChild(tableau);
		var ligne = tableau.insertRow(0);
		ligne.insertCell(0).innerHTML = 'Temps de trajet : ';
		ligne.insertCell(1).innerHTML = ze_Secondes_date(temps_trajet) + '&nbsp&nbsp&nbsp&nbsp' + ((vitesse_attaque === 0)? '(vitesse attaque inconnue)': '(VA' + vitesse_attaque + ')');
		ligne = tableau.insertRow(1);
		ligne.insertCell(0).innerHTML = 'Arrivée : ';
		ligne.insertCell(1).innerHTML = '<span id="heure_retour"></span><span id="temps_trajet" style="display:none">' + temps_trajet + '</span>';
		that.updateClock();
	};

	this.updateClock = function() {
		setInterval(function() {
			var temps_trajet = parseInt(document.querySelector('#temps_trajet').innerHTML);
			document.querySelector('#heure_retour').innerHTML = ze_Generation_date_precise(Math.round(time_fzzz() + temps_trajet));
			var date = new Date((time_fzzz() + temps_trajet)*1000);
			if (date.getSeconds() >= 56) {
				document.querySelector('#heure_retour').innerHTML += '&nbsp&nbsp&nbsp&nbsp<span style="color:green;font-weight:bold">envoi conseillé</span>';
			}
			else {
				document.querySelector('#heure_retour').innerHTML += '&nbsp&nbsp&nbsp&nbsp<span style="color:red;font-weight:bold">envoi déconseillé</span>';
			}
		}, 50);
	};

	this.showStatistiques = function() {
		var lignes = new Array(['attaque', 'Attaque'], ['capa_flood', 'Capacité de flood']),
			tableau = document.querySelector('#tabChoixArmee');
		for(var i=0;i<lignes.length;i++) {
			var ligne = tableau.insertRow(-1);
			ligne.insertCell(0).innerHTML = lignes[i][1] + ' : ';
			ligne.insertCell(1).innerHTML = '';
			ligne.insertCell(2).innerHTML = '';
			ligne.insertCell(3).innerHTML = '';
			ligne.insertCell(4).innerHTML = '<span id="zzzelp_' + lignes[i][0] + '"></span>';
		}
		document.querySelector('#tabChoixArmee .cliquable').onclick = function onclick(event) {
			remplirArmeeJoueur();
			that.updateStatistiques();
		};
		var inputs = document.querySelectorAll('#tabChoixArmee');
		for(i=0;i<inputs.length;i++) {
			inputs[i].onkeyup = that.updateStatistiques;
		}
		that.updateStatistiques();
	};

	this.updateStatistiques = function() {
		var armee = new ZzzelpScriptArmee(),
			tableau = document.querySelector('#tabChoixArmee'),
			lignes = tableau.querySelectorAll('tr');
		for(var n=1;n<lignes.length;n++) {
			var colonnes = lignes[n].querySelectorAll('td'),
				unite = colonnes[0].innerHTML,
				index_unite = ZzzelpScriptArmee.noms_singulier.indexOf(unite);
			if(~index_unite && colonnes[4].querySelector('input')) {
				var valeur = parseInt(colonnes[4].querySelector('input').value.replace(/ /g,""));
				armee.unites[index_unite] += valeur;
			}
		}
		armee.setArmes(zzzelp.compte.getArmes());
		document.querySelector('#zzzelp_attaque').innerHTML = ze_Nombre(armee.getAttaqueAB());
		document.querySelector('#zzzelp_capa_flood').innerHTML = ze_Nombre(armee.getCapaFlood());
	};


	this.init();
}