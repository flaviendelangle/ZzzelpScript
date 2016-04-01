function ZzzelpScriptPageEnnemie() {

	var that = this;

	this.init = function() {
		if (document.querySelectorAll('#tabEnnemie tr td').length > 10) {
			var lignes = document.querySelector('#tabEnnemie').rows,
				pseudos = [];
			for (var i=1; i<lignes.length; i++) {
				pseudos.push(lignes[i].cells[1].querySelector('a').innerHTML);
			}
			ZzzelpScriptCoordonnees(pseudos, [], that.customize);
		}
	};

	this.customize = function(coordonnees) {
		var lignes = document.querySelector('#tabEnnemie').rows,
			entete = document.createElement('th'),
			attaquant = coordonnees[gpseudo],
			vitesse_attaque = zzzelp.compte.getVitesseAttaque();
		entete.innerHTML = 'Durée';
		lignes[0].appendChild(entete);
		for (var i=1; i<lignes.length; i++) {
			var	pseudo = lignes[i].cells[1].querySelector('a').innerHTML,
				defenseur = coordonnees[pseudo],
				distance = ze_Calcul_distance(attaquant.x, attaquant.y, defenseur.x, defenseur.y),
				temps_trajet = ze_Calcul_temps_trajet(distance, vitesse_attaque),
				cases = lignes[i].celles;
			cell = lignes[i].insertCell(7);
			cell.setAttribute('style', 'text-align:right');
			cell.innerHTML = ze_Secondes_date(temps_trajet);
		}
	};

	this.init();
}