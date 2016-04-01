/* Met à jour les statistiques en fonction de la page visitée */
function ze_Gestion_statistiques() {
	if(localStorage['zzzelp_statistiques_' + ze_serveur] && url.match(new RegExp('fourmizzz.fr\/(.*).php'))) {
		var statistiques = JSON.parse(localStorage['zzzelp_statistiques_' + ze_serveur]),
			page = new RegExp('fourmizzz.fr\/(.*).php').exec(url)[1];
		if(page in statistiques.pages) {
			statistiques.pages[page] += 1;
		}
		localStorage['zzzelp_statistiques_' + ze_serveur] = JSON.stringify(statistiques);
	}
}

/* Affectation des ouvrieres (Page Ressource) */
function ze_Affecter_ouvrieres() {
	var RecolteMateriaux = parseInt(document.querySelector('#RecolteMateriaux').value.replace(/ /g,""));
	var RecolteNourriture = parseInt(document.querySelector('#RecolteNourriture').value.replace(/ /g,""));
	if ((RecolteMateriaux + RecolteNourriture < gTDC ) && (RecolteMateriaux + RecolteNourriture < gouvrieres * 0.99999 )) {
		document.querySelector('#RecolteMateriaux').value = Math.min(gouvrieres - RecolteNourriture,gTDC - RecolteNourriture);
		document.getElementsByName('ChangeRessource')[0].type= "hidden";
		document.forms[0].submit();
	}
}

/* Applique les modifications du compte Fzzz à Zzzelp */
function ze_ModifCompte() {
	if(~document.querySelector('#centre').innerHTML.indexOf('Le fuseau a été modifié')) {
		ze_SynchronisationParametres(true)
	}
}