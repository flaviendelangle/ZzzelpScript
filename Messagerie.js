function ZzzelpScriptMessagerie() {

	var messagerie = this;

	this.getMessageZzzelp = function(mode) {
		new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'messagerie_script?' },
			{ success : function(messages) {
				messagerie.init(messages);
			},
			authentication_issue : function(messages) {
				messagerie.getMessageZzzelp(2);
			}
		});
	};

	this.init = function(messages) {
		var categorie = document.querySelector('.option_dossiers_speciaux strong');
		if(ZzzelpScript.parameters('parametres', ['perso', 'perso_smileys'])) {
			new ZzzelpScriptSmileys('new_MP', document.querySelector('#contenu_ecrire_nouveau_message'));
		}
		if(ZzzelpScript.parameters('parametres', ['perso', 'perso_messagerie'])) {
			this.getChaineNewMP();
		}
		this.customJS();
		this.watcher(categorie, messages);
		this.addEvents();
		this.addMessagesZzzelp(messages);
	};

	this.customJS = function() {
		var scripts = document.querySelectorAll('#centre script');
		for(var i=0; i<scripts.length; i++) {
			if(~scripts[i].innerHTML.indexOf('derniere_sauvegarde')) {
				$( "#contenu_ecrire_nouveau_message" ).undelegate("#bt_envoi_message", "click");
				var content = 'document.querySelector(\'#message_envoi\').value = ze_Preparation_message(document.querySelector(\'#message_envoi\').value);';
				content += messagerie.contentCustomJS(scripts[i].innerHTML, '$("#contenu_ecrire_nouveau_message").on');
				messagerie.modifyJS(content);
				
			}
		}
	};

	this.contentCustomJS = function(script, amorce) {
		var n = script.indexOf(amorce),
			nombre_ouverte = 0,
			entre = false,
			contenu = '';
		while (nombre_ouverte !== 0 || !entre) {
			if(!entre && script[n] == '{') {
				entre = true;
			}
			nombre_ouverte += ((script[n] == '{') ? 1 : ((script[n] == '}') ? -1 : 0));
			contenu += script[n];
			n ++;
		}
		return contenu.substr(contenu.indexOf('\n'), contenu.length - contenu.indexOf('\n') - 1);
	};

	this.modifyJS = function(content) {
		var el = document.querySelector("#bt_envoi_message");
		el.onclick = function onclick(event){
			eval(content); 
			return false;
		};
	};

	this.watcher = function(categorie, messages_zzzelp) {
		var categorie_2 = document.querySelector('.option_dossiers_speciaux strong');
		if(categorie != categorie_2) {
			categorie = categorie_2;
			messagerie.analyseTitles();
			messagerie.addMessagesZzzelp(messages_zzzelp);
		}
		var ouvertes = document.querySelectorAll('.contenu_conversation');
		for(var i=0; i<ouvertes.length; i++) {
			if(ouvertes[i].querySelectorAll('tr[id*="reactions_"]').length > 0) {
				var id = ouvertes[i].querySelector('tr[id*="reactions_"]').id.replace('reactions_', '');
				if(!document.querySelector('#conversation_' + id).dataset.zzzelp_ouverture && !document.querySelector('#conversation_' + id).dataset.zzzelp_ouvert) {
					console.log('ZzzelpScript : Ouverture de la conversation');
					messagerie.loadMessage('conversation_' + id);
				}
			}
		}
		setTimeout(function(){messagerie.watcher(categorie, messages_zzzelp);}, 25);
	};

	this.addEvents = function() {
		if(ZzzelpScript.parameters('parametres', ['perso', 'perso_smileys'])) {
			$( "#liste_conversations" ).undelegate(".reaction_choisie", "click");
		}
		messagerie.analyseTitles();
	};

	this.analyseTitles = function() {
		var messages = document.querySelectorAll('#corps_messagerie tr[id*="conversation"]'),
			n_mess = 0;
		for (var i=0;i<messages.length; i++) {
			var titre = messages[i].querySelector('.intitule_message').innerHTML,
				id = messages[i].id.replace('conversation_', '');
			if(ZzzelpScript.parameters('parametres', ['perso', 'perso_messagerie_guerre']) && messagerie.isImportant(messages[i])) {
				messagerie.highlightMessage(id);
			}
			messagerie.addEventOpen(messages[i]);
		}
	};

	this.addEventOpen = function(message) {
		message.onclick = function onclick(event) {
			this.dataset.zzzelp_ouverture = 1;
			messagerie.loadMessage(this.id);
		};
	};

	this.loadMessage = function(id) {
		var type = document.querySelector('#' + id).dataset.type,
			longueur = (type == 'Combats' || type == 'Chasses') ? 2 : 4,
			lignes = document.querySelector('#table_liste_conversations').rows,
			index = document.querySelector('#' + id).rowIndex;
		if(lignes.length < index + longueur + 1 || lignes[index + longueur].className != 'contenu_conversation') {
			setTimeout(function(){messagerie.loadMessage(id);},10);
		}
		else {
			document.querySelector('#' + id).dataset.zzzelp_ouvert = 1;
			document.querySelector('#' + id).removeAttribute('data-zzzelp_ouverture');
			if(type == 'Combats') {
				messagerie.customCombat(id);
			}
			else if(type == 'Chasses' && ZzzelpScript.parameters('parametres', ['perso', 'perso_messagerie'])) {
				messagerie.customChasse(id);
			}
			else {
				messagerie.customConversation(id);
			}
		}
	};

	this.customCombat = function(id) {
		var table = document.querySelector('#table_liste_conversations');
		if(document.querySelector('#' + id).dataset.joueur == 'adversaire') {
			var titre = document.querySelector('#' + id).querySelector('.intitule_message').innerHTML,
				RCs = table.rows[document.querySelector('#' + id).rowIndex + 2].querySelectorAll('tr[id*=message_] .message'),
				dates = table.rows[document.querySelector('#' + id).rowIndex + 2].querySelectorAll('tr[id*=message_] .expe span span');
			if(ZzzelpScript.parameters('parametres', ['perso', 'perso_messagerie_guerre'])) {
				new ZzzelpScriptRC().messagerie(id, titre, RCs, dates);
			}
			if(typeof ze_Lien_Forum_Guerre != 'undefined') {
				//messagerie.getLinkForum(1, document.querySelector('#' + id).dataset.pseudo, document.querySelector('#table_liste_conversations').rows[document.querySelector('#' + id).rowIndex + 2].querySelector('table'));
			}
		}		
	};

	this.customConversation = function(id) {
		var titre = document.querySelector('#' + id + ' .intitule_message').innerHTML,
			conversation = document.querySelector('#table_liste_conversations').rows[document.querySelector('#' + id).rowIndex + 4].querySelector('table');
		if(typeof Aide_admin_messagerie != 'undefined') {
			Aide_admin_messagerie(id);
		}
		if(typeof ze_Aide_admin_erreur != 'undefined') {
			ze_Aide_admin_erreur(titre, conversation);
		}
		if(ZzzelpScript.parameters('parametres', ['perso', 'perso_messagerie'])) {
			messagerie.actionBar(titre, conversation);
			messagerie.keyboardEvent(conversation);
		}
		if(ZzzelpScript.parameters('parametres', ['perso', 'perso_smileys'])) {
			messagerie.prepareSmileys(id);
			new ZzzelpScriptSmileys('champ_reponse_' + id.replace('conversation_', ''), document.querySelector('#table_liste_conversations').rows[document.querySelector('#' + id).rowIndex + 4].querySelector('tr[id*="reactions_"]'));
		}	
	};

	this.customChasse = function(id) {
		var table =  document.querySelector('#table_liste_conversations'),
			conversation = table.rows[document.querySelector('#' + id).rowIndex + 2],
			liens = conversation.querySelectorAll('.lien_voir_precedent');
		if(liens.length > 0) {
			if(conversation.querySelector('.lien_voir_precedent').innerHTML != 'Chargement en cours') { 
				liens[0].click();
			}
			setTimeout(function(){
				messagerie.customChasse(id);
			}, 25);
		}
		else {
			var chasses = conversation.querySelectorAll('tr[id*=message_] .message'),
				dates = conversation.querySelectorAll('tr[id*=message_] .expe span span'),
				donnees = { detail : [], total : {} },
				chasses_str = '';
			for(var i=0; i<chasses.length; i++) {
				chasses_str += chasses[i].innerHTML.replace(/<br>/gi, '\n') + '\n\n';
			}
			new ZzzelpScriptAnalyseurChasse(chasses_str).initMessagerie(id);
		}	
	};

	this.keyboardEvent = function(conversation) {
		conversation.querySelector('textarea[id*="champ_reponse_"]').onkeypress = function onkeypress(event) {
			var keycode = (event.keyCode ? event.keyCode : event.which);
			if ((keycode == '13' || keycode == '10') && event.ctrlKey) {
				var r = confirm("Voulez-vous envoyer ce message ?");
				if(r) {
					conversation.querySelector('.reagir_message button').click();
				}
			}
		};
	};

	this.isImportant = function(message) {
		var pseudo, i,
			membres = ZzzelpScript.parameters('membres'),
			titre = message.querySelector('.intitule_message').innerHTML,
			regexps = new Array(
				{ regexp : 'Vol par ([^ ]+) :', index : 1, type: 'flood_defense' },
				{ regexp : 'Butin chez ([^ ]+) :', index : 1, type : 'pillage_attaque' },
				{ regexp : 'Invasion repoussée de ([^ ]+) :', index : 1, type : 'RC_defense' },
				{ regexp : 'Invasion de ([^ ]+) :', index : 1, type : 'RC_defense' },
				{ regexp : 'Rebellion (échouée|réussie) contre ([^ ]+)', index : 2, type : 'rebellion_attaque' },
				{ regexp : 'Attaque (annulée|échouée|réussie) contre ([^ ]+)', index : 2, type : 'RC_attaque' },
				{ regexp : 'Colonie (perdue|protégée) chez ([^ ]+)', index : 2, type : 'telescopage_defense' },
				{ regexp : 'Colonie (conquise|libérée) chez ([^ ]+)', index : 2, type : 'colonie_attaque' },
				{ regexp : 'Soumission par ([^ ]+)', index : 1, type : 'colonie_defense' },
				{ regexp : 'Indépendance de ([^ ]+)', index : 1, type : 'rebellion_defense' },
				{ regexp : 'Colonie libérée chez ([^ ]+)', index : 1, type : 'liberation_colonie' }
			),
			trouve = false;
		for(i=0; i<regexps.length; i++) {
			if(titre.match(regexps[i].regexp)) {
				pseudo = new RegExp(regexps[i].regexp).exec(titre)[regexps[i].index];
				message.dataset.combat_zzzelp = regexps[i].type;
				message.dataset.pseudo = pseudo;
			}
		}
		if(pseudo) {
			trouve = false;
			for(var alliance in membres) {
				for(i=0; i<membres[alliance].length; i++) {
					trouve = (trouve || membres[alliance][i].pseudo == pseudo);
				}
			}
			return (!trouve);
		}
		return false;
	};

	this.highlightMessage = function(id) {
		document.querySelector('#conversation_' + id).dataset.joueur = 'adversaire';
		document.querySelector('#conversation_' + id).style.background = '#FF6347';
	};

	//MESSAGES ZZZELP
	this.addMessagesZzzelp = function(messages_zzzelp) {
	    if(document.querySelector('#corps_messagerie')) {
	        var messages = document.querySelectorAll('#corps_messagerie tr[id*="conversation"]'),
				n_mess = 0;
	        for (var i=0;i<messages.length; i++) {
				var date_MP = ze_Date_to_timestamp_v2(messages[i].querySelectorAll('td')[3].querySelector('span').innerHTML);
				messages[i].querySelectorAll('td')[3].querySelector('span').innerHTML = ' ' + ze_Generation_date_v1(date_MP);
				while (messages_zzzelp.length > 0 && messages_zzzelp[0].date > date_MP) {
					messagerie.addMessageZzzelp(messages_zzzelp[0], i+1+n_mess*3, i);
					messages_zzzelp.splice(0,1);
					n_mess += 1;
				}
	        }
	        for(i=0;i<messages_zzzelp.length;i++) {
				messagerie.addMessageZzzelp(messages_zzzelp[i], document.querySelectorAll('#TableMessagerie tr').length);
				n_mess += 1;
			}		
		}
	};

	this.addMessageZzzelp = function(message, i, n) {
		var cell, ligne;
		ligne = document.querySelector('#table_liste_conversations').insertRow(i+1);
		ligne.setAttribute('id', 'zzzelp_' + message.ID);
		if(message.expediteur == 'delangle') {
			ligne.setAttribute('style', 'font-weight:bold');
		}
		cell = ligne.insertCell(0);
		cell.innerHTML = '<input type="checkbox">';
		cell.setAttribute('style', 'cursor:pointer;');
		cell = ligne.insertCell(1);
		cell.innerHTML = '';
		cell.setAttribute('style', 'cursor:pointer;');
		cell = ligne.insertCell(2);
		cell.innerHTML = message.expediteur;
		cell.setAttribute('style', 'cursor:pointer;' + ((message.lu === 0 && message.titre.indexOf('[News Zzzelp]') == -1) ? 'color:#0000AA':''));
		cell.setAttribute('class', 'expediteur_message_zzzelp_' + message.ID);
		cell = ligne.insertCell(3);
		cell.innerHTML = '<span style="float:right; color:#444444;"> ' + ze_Generation_date_v1(message.date) + '</span><span ' + ((message.lu === 0 && message.titre.indexOf('[News Zzzelp]') == -1) ? 'style="color:#0000AA" class="nouveau_MP_zzzelp"':'') + '>' + message.titre + '</span>';
		cell.setAttribute('style', 'padding-left:10px;cursor:pointer;');
		cell.setAttribute('class', 'titre_message_zzzelp_' + message.ID);
		cell = ligne.insertCell(4);
		cell.innerHTML = '';

		ligne = document.querySelector('#table_liste_conversations').insertRow(i+2);
		ligne.setAttribute('class', 'message_zzzelp_' + message.ID);
		ligne.setAttribute('style', 'display:none');
		cell = ligne.insertCell(0);
		cell.setAttribute('colspan', '2');
		cell.innerHTML = '';
		cell = ligne.insertCell(1);
		cell.setAttribute('colspan', '3');
		cell.setAttribute('style', 'font-size:0.9em; padding-right:5px;color:#444444;');
		cell.innerHTML = 'Participants (non-lus) : ' + message.expediteur + ', Moi';

		ligne = document.querySelector('#table_liste_conversations').insertRow(i+3);
		ligne.setAttribute('class', 'contenu_conversation message_zzzelp_' + message.ID);
		ligne.setAttribute('style', 'display:none');
		cell = ligne.insertCell(0);
		cell.setAttribute('colspan', '2');
		cell.innerHTML = '';
		cell = ligne.insertCell(1);
		cell.setAttribute('colspan', '3');
		cell.innerHTML = '<span id="message_zzzelp_' + message.ID + '" style="display:block;margin:10px 0">' + message.contenu + '</span>';
		document.querySelector('.titre_message_zzzelp_' + message.ID).onclick = function onclick(event) {
			messagerie.showMPZzzelp(message.ID); 
			return false;
		};	
		document.querySelector('.expediteur_message_zzzelp_' + message.ID).onclick = function onclick(event) {
			messagerie.showMPZzzelp(message.ID); 
			return false;
		};	
	};

	this.showMPZzzelp = function(ID) {
		if(document.querySelectorAll('.titre_message_zzzelp_' + ID + ' .nouveau_MP_zzzelp').length) {
			messagerie.markReadMPZzzelp(ID);
			document.querySelector('.titre_message_zzzelp_' + ID + ' .nouveau_MP_zzzelp').style.color = '';
			document.querySelector('.expediteur_message_zzzelp_' + ID).style.color = '';
		}
		var lignes = document.querySelectorAll('.message_zzzelp_' + ID);
		for(var i=0;i<lignes.length;i++) {
			if(lignes[i].style.display === '') {
				lignes[i].style.display = 'none';
			}
			else {
				lignes[i].style.display = '';
			}
		}
	};

	this.deleteMPZzzelp = function(id) {
		new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'messagerie_script?action=suppression_MP' + '&id=' + id + '&' },
			{ success : function(url) {
				location.reload(); 
			}
		});
	};

	this.markReadMPZzzelp = function(id) {
		new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'messagerie_script?action=MP_lu' + '&id=' + id + '&' }, {});
	};

	//GUERRE
	this.getLinkForum = function(mode, pseudo, contenu) {
		new ZzzelpScriptAjax({ method : 'GET', domain : 'zzzelp', url : 'guerre_script?mode=lien_forum&cible=' + pseudo + '&' },
			{ success : function(url) {
				messagerie.addLinkForum(contenu, url);
			}, authentication_issue : function() {
				messagerie.getLinkForum(2, pseudo, contenu);
			}
		});
	};

	this.addLinkForum = function(contenu, url) {
		if(contenu.querySelectorAll('.generation_message_zzzelp').length > 0) {
			ze_Supprimer_element(contenu.querySelector('.generation_message_zzzelp').parentNode.parentNode);
		}
		var ligne_boutons = contenu.insertRow(contenu.rows.length),
			cell_boutons = ligne_boutons.insertCell(0),
			lien_forum = document.createElement('input');
		cell_boutons.setAttribute('colspan', '2');
		cell_boutons.setAttribute('style', 'text-align: center;padding: 20px 0;');
		lien_forum.type = 'button';
		lien_forum.setAttribute('class', 'generation_message_zzzelp');
		lien_forum.value = 'Forum de guerre';
		lien_forum.onclick = function onclick(event) { 
			window.open(url); 
			return false;		
		};
		cell_boutons.appendChild(lien_forum);
	};


	this.actionBar = function(titre, conversation) {
		if(conversation.querySelectorAll('.generation_message_zzzelp').length > 0) {
			ze_Supprimer_element(conversation.querySelector('.generation_message_zzzelp').parentNode.parentNode);
		}
		var ligne_boutons = conversation.insertRow(conversation.rows.length),
			ligne_resultats = conversation.insertRow(conversation.rows.length),
			cell_boutons = ligne_boutons.insertCell(0),
			cell_resultats = ligne_resultats.insertCell(0),
			copie_convers = document.createElement('input');
		cell_boutons.setAttribute('colspan', '2');
		cell_boutons.setAttribute('style', 'text-align: center;padding: 20px 0;');
		cell_resultats.setAttribute('colspan', '2');
		cell_resultats.className = 'resultats_messagerie_zzzelp';
		copie_convers.type = 'button';
		copie_convers.setAttribute('class', 'generation_message_zzzelp');
		copie_convers.value = 'Copier la conversation';
		copie_convers.onclick = function onclick(event) {
			messagerie.transformConversation(titre, conversation); 
			return false;
		};
		cell_boutons.appendChild(copie_convers);
	};

	this.transformConversation = function(titre, conversation) {
		var ligne_precedente = conversation.parentNode.parentNode.parentNode.rows[conversation.parentNode.parentNode.rowIndex-2];
		if(conversation.querySelectorAll('.lien_voir_precedent').length > 0) {
			if(conversation.querySelector('.lien_voir_precedent').innerHTML != 'Chargement en cours') { 
				conversation.querySelector('.lien_voir_precedent').innerHTML = 'Chargement en cours';
				conversation.querySelector('.lien_voir_precedent').click();
			}
			setTimeout(function(){
				messagerie.transformConversation(titre, conversation);
			},50);
		}
		else if(ligne_precedente.querySelectorAll('.afficher_tous_participants').length > 0) {
			if(ligne_precedente.querySelector('.afficher_tous_participants').innerHTML != 'Chargement en cours') { 
				ligne_precedente.querySelector('.afficher_tous_participants').innerHTML = 'Chargement en cours';
				ligne_precedente.querySelector('.afficher_tous_participants').click();
			}
			setTimeout(function(){messagerie.transformConversation(titre, conversation);},50);
		}
		else {
			var conversations = messagerie.getCleanConversation(conversation, ligne_precedente, titre);
			messagerie.insertCleanConversation(conversations, conversation);
		}
	};

	this.getCleanConversation = function(conversation, ligne_precedente, titre) {
		var messages = conversation.querySelectorAll('[id*="message_"]'),
			participants = ligne_precedente.querySelectorAll('[id*="liste_participants_"] a[href*="Membre.php"]'),
			sans_code = 'Titre : ' + titre + '\n\nParticipants : ',
			avec_bbcode = '[center][b]' + titre + '[/b][/center]' + '\n\nParticipants : ',
			avec_bbcode_2 = '[center][b]' + titre + '[/b][/center]' + '\n\nParticipants : ',
			pseudo, i, contenu;

		var max = ze_Majoration(participants.length, 20);
		for(i=0; i<max; i++) {
			pseudo = new RegExp('Pseudo=(.*)').exec(participants[i].href)[1];
			sans_code += pseudo + ((i == max-1) ? ',' : '') + ' ';
			avec_bbcode += '[player]' + pseudo + '[/player]' + ((i == max-1) ? ',' : '') + ' ';
			avec_bbcode_2 += '[url=http://' + ze_serveur + '/Membre.php?Pseudo=' + pseudo + ']' + pseudo + '[/url]' + ((i == max-1) ? ',' : '') + ' ';
		}
		if(max < participants.length) {
			sans_code += '...';
			avec_bbcode += '...';
			avec_bbcode_2 += '...';	
		}
		sans_code += '\n\n';
		avec_bbcode += '\n\n';
		avec_bbcode_2 += '\n\n';
		for(i=0; i<messages.length; i++) {
			pseudo = messages[i].querySelectorAll('.expe a');
			if(pseudo.length > 0) {
				pseudo = messages[i].querySelector('.expe a').innerHTML;
				var date = messages[i].querySelector('.date_envoi').innerHTML;
				if(pseudo == 'Moi') {
					pseudo = gpseudo;
				}
				if(messages[i].querySelectorAll('[id*="afficher_complet_"]').length > 0) {
					messages[i].querySelector('[id*="afficher_complet_"]').click();
					contenu = decodeHtml(messages[i].querySelector('[id*="message_complet_"]').innerHTML);
				}
				else {
					contenu = decodeHtml(messages[i].querySelector('.message').innerHTML.replace('<div class="date_envoi">' + date + '</div>', ''));
				}
				sans_code += pseudo + '	' + date + '\n\n' + Nettoyage_HTML(contenu) + '\n\n\n';
				avec_bbcode += '[player]' + pseudo + '[/player]	[b]' + date + '[/b]\n\n' + ze_HTML_to_BBcode(contenu, true) + '\n\n[hr]\n';
				avec_bbcode_2 += '[b]' + pseudo + '[/b]	[b]' + date + '[/b]\n\n' + ze_HTML_to_BBcode(contenu, false) + '\n\n[hr]\n';
			}
		}
		return { sans_code : sans_code, avec_bbcode : avec_bbcode, avec_bbcode_2 : avec_bbcode_2 };	
	};

	this.insertCleanConversation = function(conversations, conversation) {
		var zone = document.createElement('div'),
			zone_1 = document.createElement('div'),
			zone_2 = document.createElement('div'),
			zone_3 = document.createElement('div'),
			zone_sans_code = document.createElement('textarea'),
			zone_avec_bbcode = document.createElement('textarea'),
			zone_avec_bbcode_2 = document.createElement('textarea'),
			entete_1 = document.createElement('strong'),
			entete_2 = document.createElement('strong');
			entete_3 = document.createElement('strong');
		zone.setAttribute('style', 'margin-top:35px');
		zone_sans_code.value = conversations.sans_code;
		zone_avec_bbcode.value = conversations.avec_bbcode;
		zone_avec_bbcode_2.value = conversations.avec_bbcode_2;
		zone_sans_code.setAttribute('style', 'width:90%;height:150px');
		zone_avec_bbcode.setAttribute('style', 'width:90%;height:150px');
		zone_avec_bbcode_2.setAttribute('style', 'width:90%;height:150px');
		entete_1.innerHTML = 'Sans BBCode';
		entete_2.innerHTML = 'Avec BBCode (version Fourmizzz)';
		entete_3.innerHTML = 'Avec BBCode (version classique)';
		entete_1.setAttribute('style', 'display:block;margin-bottom:10px');
		entete_2.setAttribute('style', 'display:block;margin-bottom:10px');
		entete_3.setAttribute('style', 'display:block;margin-bottom:10px');
		zone_1.appendChild(entete_1);
		zone_2.appendChild(entete_2);
		zone_3.appendChild(entete_3);
		zone_1.appendChild(zone_sans_code);
		zone_2.appendChild(zone_avec_bbcode);
		zone_3.appendChild(zone_avec_bbcode_2);
		zone.appendChild(zone_1);
		zone.appendChild(zone_2);
		zone.appendChild(zone_3);
		conversation.querySelector('.resultats_messagerie_zzzelp').appendChild(zone);
		ze_Supprimer_element(conversation.querySelector('.generation_message_zzzelp'));
	};


	// SMILEYS
	this.prepareSmileys = function(id) {
		var scripts = document.querySelectorAll('#centre script');
		for(var i=0; i<scripts.length; i++) {
			if(~scripts[i].innerHTML.indexOf('derniere_sauvegarde')) {
				var index = document.querySelector('#' + id).rowIndex + 4,
					conversation = document.querySelector('#table_liste_conversations').rows[index].querySelector(".reaction_choisie");
				content = 'var nom = $(this).prop("id");if (~nom.indexOf("repondre_tous_") || ~nom.indexOf("repondre_unique_")){';
				content += 'var zone = this.parentNode.parentNode.parentNode.querySelector("textarea");zone.value=ze_Preparation_message(zone.value)};';
				content += messagerie.contentCustomJS(scripts[i].innerHTML, '$("#liste_conversations").on("click", ".reaction_choisie"').replace('return false;', 'console.log("")');
				messagerie.addEventSmileys(conversation, content);
			}
		}
	};

	this.addEventSmileys = function(conversation, content) {
		conversation.onclick = function onclick(event){
			eval(content);
			return false;
		};
	};


	//MESSAGES PAR GROUPE
	this.getChaineNewMP = function() {
		if(localStorage.getItem('zzzelp_rangs_' + ze_serveur)) {
			new ZzzelpScriptAjax({ method : 'GET', domain : 'fourmizzz', url : 'classementAlliance.php?alliance=' + galliance, addDOM : true, destroyDOM : false },
				{ success : function(zone_page) {
					var rangs = JSON.parse(localStorage.getItem('zzzelp_rangs_' + ze_serveur));
					ze_Affichage_rangs(rangs, 1, galliance, zone_page);
					var	chaine = ze_Analyser_chaine(ze_Recuperer_chaine(zone_page));
					messagerie.addGroups(chaine);
				}
			});
		}
		else {
			messagerie.addGroups({ grenier : [], passeur : [], chasseur : []});
		}
	};

	this.addGroups = function(chaine) {
		var zone_groupes;
		if(!document.querySelector('#menu_amis')) {
			document.querySelector('#contenu_ecrire_nouveau_message div span').innerHTML = '';
			zone_groupes = document.querySelector('#contenu_ecrire_nouveau_message div span');
		}
		else {
			zone_groupes = document.querySelector('#menu_amis').parentNode;
		}
		var corbeille = document.createElement('img'),
			membres = ZzzelpScript.parameters('membres'),
			groupes = new Array(
				{ nom : 'Dirigeants', id : 'chefs', condition : 'droits', valeur : 4 },
				{ nom : 'Membres', id : 'membres', condition : 'droits', valeur : 1 },
				{ nom : 'Greniers', id : 'greniers', condition : 'role', valeur : 'grenier' },
				{ nom : 'Passeurs', id : 'passeurs', condition : 'role', valeur : 'passeur' },
				{ nom : 'Chasseurs', id : 'chasseurs', condition : 'role', valeur : 'chasseur' }
			),
			data = {};
		corbeille.src = url_zzzelp + '/Images/trash.png';
		corbeille.setAttribute('style', 'height:15px;margin-right:15px;margin-left:10px;cursor:pointer');
		corbeille.onclick = function onclick(event) {
			messagerie.cleanPlayers();
		};
		for(var alliance in membres) {
			var select = document.createElement('select'),
				entete = document.createElement('option');
			data[alliance] = {};
			select.dataset.alliance = alliance;
			entete.innerHTML = 'Groupes ' + alliance + ' ?';
			select.appendChild(entete);
			messagerie.addEventGroup(select, data);
			data = messagerie.getPlayerInGroups(chaine, groupes, select, membres[alliance], alliance, data);
			zone_groupes.appendChild(select);
		}
		zone_groupes.parentNode.appendChild(corbeille);
		
	};

	this.getPlayerInGroups = function(chaine, groupes, select, liste_joueurs, alliance, data) {
		for(var j=0; j<groupes.length; j++) {
			var joueurs = [],
				ligne = document.createElement('option');
			ligne.dataset.n_groupe = j;
			for(var pseudo in liste_joueurs) {
				if((groupes[j].condition == 'droits' && liste_joueurs[pseudo].droits >= groupes[j].valeur) || 
				   (groupes[j].condition == 'role' && chaine[liste_joueurs[pseudo].pseudo] && chaine[liste_joueurs[pseudo].pseudo].role == groupes[j].valeur)) {
					joueurs.push(liste_joueurs[pseudo].pseudo);
				}
			}
			data[alliance][j] = joueurs;
			ligne.id = 'zzzelp_' + groupes[j].id + '_' + alliance;
			ligne.value = 'zzzelp_' + groupes[j].id + '_' + alliance;
			ligne.innerHTML = groupes[j].nom + ' ' + alliance;
			select.appendChild(ligne);
		}
		return data;
	};

	this.addEventGroup = function(select, data) {
		select.onchange = function onchange(event) {
			var joueurs = data[this.dataset.alliance][document.querySelector('#' + this.value).dataset.n_groupe];
			document.querySelector('#objet').value = '[' + document.querySelector('#' + this.value).innerHTML + ']';
			for(var i=0; i<joueurs.length; i++) {
				valideDestinataires(joueurs[i]);
			}
		};
	};

	this.cleanPlayers = function() {
		var joueurs = document.querySelectorAll('.destinataire_valide');
		for(var i=0; i<joueurs.length; i++) {
			ze_Supprimer_element(joueurs[i]);
		}
	};

	this.getMessageZzzelp(1);
}

/* Décode le HTML d'un message */
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.value = html;
    return txt.value;
}

/* Supprime tout le HTML d'une chaine de caractère */
function Nettoyage_HTML(html) {
	return html.replace(/<\/?(?!\!)[^>]*>/gi, '');
}