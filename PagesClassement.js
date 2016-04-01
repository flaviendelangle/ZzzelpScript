/* Colorise les joueurs a porté */
function ze_Amelioration_membres_alliance(lieu) {
	if(document.querySelectorAll('#tabMembresAlliance').length === 0) {
		setTimeout(function(){ze_Amelioration_membres_alliance(lieu);return false;}, 1);
	}
	else {
		var l = (lieu === 0) ? [3,5] : [2,4],
			tableau = document.querySelector('#tabMembresAlliance'),
			lignes = tableau.rows;
		for (var i=1; i<lignes.length; i++) {
			var cases = lignes[i].cells,
				pseudo = cases[l[0]].querySelector('a').innerHTML,
				TDC = parseInt(cases[l[1]].innerHTML.replace(/ /g,""));
			if(pseudo == gpseudo) {
				cases[l[0]].setAttribute('class', 'zzzelp_utilisateur');
				cases[l[1]].setAttribute('class', 'zzzelp_utilisateur');
			}
			else if(TDC > gTDC*1/2 && TDC < gTDC*3) {
				cases[l[0]].setAttribute('class', 'zzzelp_a_porte');
				cases[l[1]].setAttribute('class', 'zzzelp_a_porte');
			}
		}
	}
}


function ze_Amelioration_classement_alliances() {
	if(ze_Analyser_URL('type_classement') == 'alliance_total') {
		document.querySelector('#league').value = 0;
		demande_classement(0);
	}
	else if(!ze_Analyser_URL('type_classement')) {
		document.querySelector('#league').value = 0;
		demande_classement(1);
	}
}