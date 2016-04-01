/* Ajoute un cadre pour afficher les colonies sur plusieurs colonnes et avec leur TDC / alliance (Page Profil) */
function ze_Amelioration_colonies() {
	var colonies = ze_Liste_colonies();
	if(colonies.length > 0) {
		var	cadre = document.createElement('div'),
			contenu = document.createElement('div');
		cadre.setAttribute('class', 'boite_membre');
		cadre.setAttribute('style', 'padding:25px 0');
		contenu.setAttribute('class', 'colonies_zzzelp');
		contenu.setAttribute('style', 'text-align:left; padding-left:15%; padding-bottom:10px;display:none');
		cadre.innerHTML = '<h4>Colonies</h4><a href="#" onclick="ze_Affichage_colonies(true);return false" id="afficher_colonies_zzzelp">Afficher la liste</a>';
		cadre.innerHTML += '<a href="#" onclick="ze_Affichage_colonies(false)" id="masquer_colonies_zzzelp" style="display:none">Masquer la liste</a>';
		cadre.appendChild(contenu);
		document.querySelector('#centre center').appendChild(cadre);
		colonies.sort();
		for(var i=0;i<colonies.length; i++) {
			var ligne = document.createElement('div');
			ligne.setAttribute('class', 'ligne_colonies_zzzelp');
			ligne.innerHTML = ze_Lien_profil(colonies[i]) + '&nbsp(&nbsp<span class="TAG_colonies_zzzelp"></span>&nbsp&nbsp<span class="TDC_colonies_zzzelp"></span>&nbsp)&nbsp';
			contenu.appendChild(ligne);
		}
	}
}

/* Récupère la liste des colonies d'un joueur et supprime l'affichage par défaut (Page Profil) */
function ze_Liste_colonies() {
	var elements = document.querySelector('.boite_membre').querySelectorAll('a'),
		colonies = [];
	for(var i=0; i<elements.length; i++) {
		if(elements[i].parentNode.parentNode.cells[0].innerHTML.length === 0) {
			colonies.push(elements[i].innerHTML);
			ze_Supprimer_element(elements[i].parentNode.parentNode);
		}
	}
	return colonies;
}

/* Affiche ou non le cadre des colonies créé par Zzzelp (Page Profil) */
function ze_Affichage_colonies(visible) {
	document.querySelector('#afficher_colonies_zzzelp').style.display = (visible ? 'none' : '');
	document.querySelector('#masquer_colonies_zzzelp').style.display = (visible ? '' : 'none');
	document.querySelector('.colonies_zzzelp').style.display = (visible ? '' : 'none');
	var colonies = document.querySelectorAll('.ligne_colonies_zzzelp');
	if(visible && colonies[0].querySelector('.TAG_colonies_zzzelp').innerHTML === '') {
		ze_Recuperation_TDC_colonies(colonies,0);
	}
}

/* Récupère pour chaque joueur son TDC et son alliance (Page Profil) */
function ze_Recuperation_TDC_colonies(colonies, i) {
	if(i < colonies.length) {
		var pseudo = colonies[i].querySelector('a').innerHTML;
		new ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : 'Membre.php?Pseudo=' + pseudo, addDOM : true },
			{ success : function(zone_page) {
				var TDC = parseInt(zone_page.querySelector('.tableau_score').rows[1].cells[1].innerHTML.replace(/ /g, '')),
					alliance = (zone_page.querySelector('.boite_membre table').rows[0].querySelector(' a') === null) ? '-' : zone_page.querySelector('.boite_membre table').rows[0].querySelector(' a').innerHTML;
				colonies[i].querySelector('.TAG_colonies_zzzelp').innerHTML = '<a href="http://' + ze_serveur + '.fourmizzz.fr/classementAlliance.php?alliance=' + alliance + '">' + alliance + '</a>';
				colonies[i].querySelector('.TDC_colonies_zzzelp').innerHTML = ze_Nombre_raccourci(TDC, 3);
				ze_Recuperation_TDC_colonies(colonies, i+1);	
			}
		});
	}
}


