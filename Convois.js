/* MAJ TDC / ouvrieres et retour vers les convois de Zzzelp */
function ze_MAJ_convois() {
	var pseudo = ze_Analyser_URL('pseudo');
	var valeur = ze_Analyser_URL('valeur_convois') ;
	var alliance = ze_Analyser_URL('alliance');
	var ressource = ze_Analyser_URL('ressource');
	document.location.href=url_zzzelp + '/convois/preparation?ressource=' + ressource + '&serveur=' + ze_serveur + '&alliance=' + alliance + '&pseudo=' + pseudo + '&valeur_convois=' + valeur + '&ouvrieres=' + gouvrieres + '&TDC=' + gTDC;
}

/* Envoi d'un convoi */
function ze_Envoi_convois() {
	materiaux = parseInt(ze_Analyser_URL('materiaux'));
	nourriture = parseInt(ze_Analyser_URL('nourriture'));
	pseudo = ze_Analyser_URL('pseudo');
	alliance = ze_Analyser_URL('alliance');
	if(materiaux != 0) {
		document.querySelector('#nbMateriaux').value = ze_Nombre(materiaux);
		document.querySelector('#input_nbMateriaux').value = ze_Nombre(materiaux);
	}
	if(nourriture != 0) {
		document.querySelector('#nbNourriture').value = ze_Nombre(nourriture);
		document.querySelector('#input_nbNourriture').value = ze_Nombre(nourriture);
	}
	localStorage['ValeurConvois' + ze_serveur] = pseudo + ',' + materiaux + ',' + nourriture + ',' + alliance;
	localStorage['ModeConvois' + ze_serveur] = ze_Analyser_URL('mode');
	document.getElementsByName('convoi')[0].type= "hidden";
	document.querySelector('.simulateur form').submit();
}


/* Retour vers Zzzelp après le lancement d'un convois */
function ze_Validation_convois() {
	if (localStorage['ValeurConvois' + ze_serveur] && localStorage['ValeurConvois' + ze_serveur] != '' && document.querySelector('.verificationOK')) {
		mode = localStorage['ModeConvois' + ze_serveur].split(',');
		donnees = localStorage['ValeurConvois' + ze_serveur].split(',');
		localStorage['ValeurConvois' + ze_serveur] = '';
		document.location.href=url_zzzelp + '/convois/modification?alliance=' + donnees[3] + '&serveur=' + ze_serveur + '&pseudo=' + donnees[0] + '&materiaux=' + donnees[1] + '&nourriture=' + donnees[2];
	}
}
