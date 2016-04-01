
/* Initialise la description des alliances version Zzzelp (Page Description Alliance) */
function ze_Classement_alliance_guerre(alliance) {
	ze_Nettoyer_description_alliance();
	ze_Lien_sondes_classement_alliance();
}

/* Ajoute les cases à cocher pour sonder les joueurs à porté (Page Description Alliance) */
function ze_Lien_sondes_classement_alliance() {
	var lignes = document.querySelector('#tabMembresAlliance').rows,
		entete = document.createElement('th'),
		checkbox = document.createElement('input'),
		cell;
	checkbox.type = 'checkbox';
	checkbox.dataset.actif = 0;
	checkbox.onclick = function onclick(event) {
		this.dataset.actif = (this.dataset.actif === 0) ? 1 : 0;
		var checkboxs = document.querySelectorAll('.cible_zzzelp');
		for(var i=0; i<checkboxs.length; i++) {
			checkboxs[i].checked = (this.dataset.actif == 1);
		}
	};
	entete.appendChild(checkbox);
	lignes[0].appendChild(entete);
	for(var i=1; i<lignes.length; i++) {
		cell = lignes[i].insertCell(-1);
		var pseudo = lignes[i].cells[2].querySelector('a').innerHTML,
			TDC = parseInt(lignes[i].cells[4].innerHTML.replace(/ /g, ''));
		if(pseudo != gpseudo && TDC > gTDC*1/2 && TDC < gTDC*3) {
			checkbox = document.createElement('input');
			checkbox.className = 'cible_zzzelp';
			checkbox.type = 'checkbox';
			cell.appendChild(checkbox);
		}
	}
	ligne = document.querySelector('#tabMembresAlliance').insertRow(-1);
	cell = ligne.insertCell(0);
	bouton = document.createElement('input');
	cell.setAttribute('colspan', '9');
	cell.setAttribute('style', 'line-height: 3.5em;');
	bouton.type = 'button';
	bouton.value = 'Sonder';
	bouton.onclick = function onclick(event) {
		ze_Preparation_sondes_classement_alliance();
	};
	cell.appendChild(bouton);
	
	ze_Ajout_ID_joueurs_sondes();
}

/* Récupère les ID des joueurs à sonder pour lancer les sondes (Page Description Alliance) */
function ze_Ajout_ID_joueurs_sondes() {
	var coordonnees = (typeof localStorage['zzzelp_coordonnees_' + ze_serveur] == 'undefined') ? {} : JSON.parse(localStorage['zzzelp_coordonnees_' + ze_serveur]),
		cibles = document.querySelectorAll('.cible_zzzelp'),
		pseudos = [];
	for (var i=0; i<cibles.length; i++) {		
		var pseudo = cibles[i].parentNode.parentNode.cells[2].querySelector('a').innerHTML;
		if(typeof coordonnees[pseudo] == 'undefined') {
			pseudos.push(pseudo);
		}
	}
	if(pseudos.length > 0) {
		ze_Recuperation_coordonnees(pseudos, []);
	}
	ze_Placement_ID_joueurs_sondes(1);
}

/* Place les ID préalablement récupérés (Page Description Alliance) */
function ze_Placement_ID_joueurs_sondes(n) {
	console.log('Tentative n°' + n);
	var coordonnees = JSON.parse(localStorage['zzzelp_coordonnees_' + ze_serveur]),
		cibles = document.querySelectorAll('.cible_zzzelp'),
		pseudos = [];
	for (var i=0; i<cibles.length; i++) {
		var pseudo = cibles[i].parentNode.parentNode.cells[2].querySelector('a').innerHTML;
		if(typeof coordonnees[pseudo] == 'undefined') {
			pseudos.push(pseudo);
		}
	}
	if(pseudos.length > 0) {
		setTimeout(function(){
			ze_Placement_ID_joueurs_sondes(n+1);
			return false;
		}, 1);
	}
	else {
		for(i=0; i<cibles.length; i++) {
			cibles[i].parentNode.parentNode.dataset.identifiant = coordonnees[cibles[i].parentNode.parentNode.cells[2].querySelector('a').innerHTML].ID;
		}
	}
}

/* Prépare le lancement des sondes via Zzzelpfloods (Page Description Alliance) */
function ze_Preparation_sondes_classement_alliance() {
	var cibles = document.querySelectorAll('.cible_zzzelp:checked'),
		URL = '[', sondes;
	if(ZzzelpScript.parameters('sondes') !== undefined) {
		sondes = ZzzelpScript.parameters('sondes');
	}
	else {
		sondes = [
					[{ unite : 0, valeur : 10000 }],
					[{ unite : 0, valeur : 1 }]
						];
	}		
	if(cibles.length === 0) {
		ze_Inserer_message('Aucune cible sélectionnée', 3000);
	}
	else {
		console.log(sondes);
		for(var t=0;t<cibles.length;t++) {
			URL += ((URL == '[') ? '' : ':') + '1' + ze_Base_10_36(sondes[0].valeur) + ',' + ze_Base_10_36(sondes[0].unite) + ',2;1' + ze_Base_10_36(sondes[1].valeur) + ',' + ze_Base_10_36(sondes[1].unite) + ',3' + ';' + ze_Base_10_36(cibles[t].parentNode.parentNode.dataset.identifiant) + ';' + ze_Base_10_36(10000) + ';' + cibles[t].parentNode.parentNode.cells[2].querySelector('a').innerHTML;
		}
		URL += ']&s=' + ze_serveur;
		URL = 'http://' + ze_serveur + '.fourmizzz.fr/Armee.php?fl=' + URL + '&lf';
		document.location.href = URL;
	}
}

/* Supprime les éléments superflus de la page (Page Description Alliance) */
function ze_Nettoyer_description_alliance() {
	var new_div = document.createElement('div');
	new_div.setAttribute('id','content_alliance');
	new_div.style.display = 'none';
	document.querySelector('#centre').appendChild(new_div);
  
	var elements = document.querySelector('#centre').childNodes,
		nettoyer = false;
	for(var i=0; i<elements.length-2; i++) {
		if(!nettoyer && elements[i].innerHTML == 'Description') {
			nettoyer = true;
		}
		if(nettoyer && elements[i].id != 'tabMembresAlliance') {
			new_div.appendChild(elements[i]);
			i -= 1;
		}
	}
  
	ze_Supprimer_element(document.querySelectorAll('#centre center h2')[1]);
	ze_Supprimer_element(document.querySelectorAll('#centre center h2')[0]);
	ze_Supprimer_element(document.querySelectorAll('#centre center .simulateur')[2]);
	ze_Supprimer_element(document.querySelectorAll('#centre center .simulateur')[1]);
  
	var div_open = document.createElement('div');
	div_open.style['text-align'] = 'center';
	var link_open = document.createElement('a');
	link_open.innerHTML = 'Afficher la description';
	link_open.style.cursor = 'pointer';
	div_open.appendChild(link_open);
	document.querySelector('#centre').insertBefore(div_open,new_div);
	document.querySelector('#centre').appendChild(document.createElement('br'));
	document.querySelector('#centre').appendChild(document.querySelector('#tabMembresAlliance'));
  
	link_open.onclick = function onclick(event) {
		if(link_open.innerHTML == 'Afficher la description') {
			link_open.innerHTML = 'Cacher la description';
			new_div.style.display = 'block';
		}
		else {
			link_open.innerHTML = 'Afficher la description';
			new_div.style.display = 'none';
		}
	};
}
