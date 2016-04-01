function ZzzelpScriptRightClick() {

	var menu = this;

	this.init = function() {
		menu.mouseEvent();
		var menuDOM = document.createElement('div');
		menuDOM.id = 'zzzelp_contextuel_membre';
		menuDOM.className = 'zzzelp_menu_contextuel';
		document.body.appendChild(menuDOM);
		document.body.onmousedown = function onmousedown(event) {
			menu.hide(event);
		};
		menu.menuDOM = menuDOM;
		menu.findLinks();
	};

	this.mouseEvent = function() {
		document.addEventListener('mousemove', function(e){ 
			coordonnees_souris.x = e.clientX || e.pageX; 
			coordonnees_souris.y = e.clientY || e.pageY;
		}, false);		
	};

	this.findLinks = function() {
		var liens = document.querySelectorAll('a[href*="Membre.php"]');
		for(var i=0; i<liens.length; i++) {
			if(liens[i].oncontextmenu === null || liens[i].oncontextmenu.name != 'contextuelzzzelp') {
				menu.addEvent(liens[i]);
			}
		}
		setTimeout(function(){
			menu.findLinks();
		},100);
	};

	this.addEvent = function(lien) {
		lien.oncontextmenu = function oncontextmenu(event) {
			menu.show(event, this.innerHTML);
			return false;
		};
	};

	this.show = function(event, pseudo) {
		document.querySelector('#zzzelp_contextuel_membre').style.display = 'block';
	    document.querySelector('#zzzelp_contextuel_membre').style.left = event.clientX + window.pageXOffset +'px';
	    document.querySelector('#zzzelp_contextuel_membre').style.top = event.clientY + window.pageYOffset + 'px';
		var coordonnees = localStorage['zzzelp_coordonnees_' + ze_serveur];
		menu.create(pseudo);
	};

	this.hide = function(event) {
		if((!event.target.href || !~event.target.href.indexOf('Membre.php')) && event.target.className != 'zzzelp_text_contextuel') {
			document.querySelector('#zzzelp_contextuel_membre').style.display = 'none';
		}
	};

	this.create = function(pseudo) {
		ZzzelpScriptCoordonnees([pseudo], [], function(coordonnees){
			var	ID = coordonnees[pseudo].ID,
				actions = new Array(
					{ nom : 'Accéder au profil', id : 'profil' },
					{ nom : 'MP le joueur', id : 'message' },
					{ nom : 'Envoyer un convoi', id : 'convois' },
					{ nom : 'Accéder au traceur', id : 'traceur' }
			);
			if(ZzzelpScriptModalGuerre) {
				actions.push({ nom : 'Aide de guerre', id : 'guerre' });
			}
			menu.menuDOM.innerHTML = '';
			for(var i=0; i<actions.length; i++) {
				var ligne = document.createElement('div'),
					text = document.createElement('span');
				ligne.className = 'zzzelp_action_contextuelle';
				ligne.dataset.action = actions[i].id;
				menu.Eventclick(ligne, pseudo, ID);
				text.className = 'zzzelp_text_contextuel';
				text.innerHTML = actions[i].nom;
				ligne.appendChild(text);
				menu.menuDOM.appendChild(ligne);
			}	
		});
	};

	this.Eventclick = function(ligne, pseudo, ID) {
		ligne.onclick = function onclick(event) {
			var action = this.dataset.action,
				a_ouvrir = '';
			if(action == 'message') {
				a_ouvrir = 'http://' + ze_serveur + '.fourmizzz.fr/messagerie.php?defaut=Ecrire&destinataire=' + pseudo;
			}
			else if(action == 'convois') {
				a_ouvrir = 'http://' + ze_serveur + '.fourmizzz.fr/commerce.php?ID=' + ID;
			}
			else if(action == 'profil') {
				a_ouvrir = 'http://' + ze_serveur + '.fourmizzz.fr/Membre.php?Pseudo=' + pseudo;
			}
			else if(action == 'traceur') {
				a_ouvrir = url_zzzelp + 'traceur?serveur=' + ze_serveur + '&mode=joueurs&joueur=' + pseudo;
			}
			else if(action == 'guerre') {
				new ZzzelpScriptModalGuerre(pseudo);
			}
			if(a_ouvrir.length > 0) {
				var a = document.createElement('a');
				a.href = a_ouvrir;
				a.target = '_BLANK';
				a.setAttribute('style', 'display:none');
				document.body.appendChild(a);
				a.click();
				ze_Supprimer_element(a);
			}
			menu.menuDOM.style.display = 'none';
		};
	};

	this.init();
}