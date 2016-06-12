function ZzzelpScriptAide(section) {

	var that = this;

	this.section = (typeof section == 'undefined') ? '' : section;

	this.init = function(mode) {
		new ZzzelpScriptAjax(that.getAjaxData(mode),
			{ success : function(values) {
				that.create(values);
			}, authentication_issue : function() {
				that.init(2);
			}
		});		
	};

	this.getAjaxData = function(mode) {
		var data = {
			method : 'GET',
			force : mode
		};
		if(typeof gpseudo != 'undefined') {
			data.domain = 'zzzelp';
			data.url = 'aide_script?';
		}
		else {
			data.domain = 'zzzelp_interne';
			data.url = 'aide_data';
		}
		return data;
	};

	this.create = function(values) {
		this.data = values;
		this.createInterface();
	};

	this.createInterface = function() {
		var fond = document.createElement('div'),
			fenetre = document.createElement('div'),
			entete = document.createElement('header'),
			titre_sommaire = document.createElement('span'),
			contenu_sommaire = document.createElement('div'),
			barre_boutons = document.createElement('div'),
			bouton_quitter = document.createElement('img'),
			bouton_sommaire = document.createElement('img');
		titre_sommaire.innerHTML = 'Aide de ZzzelpScript';
		titre_sommaire.className = 'zzzelp_titre_FAQ';
		titre_sommaire.dataset.section = 0;
		contenu_sommaire.dataset.section = 0;
		contenu_sommaire.dataset.visible = 1;
		contenu_sommaire.className = 'zzzelp_contenu_modal';
		entete.appendChild(titre_sommaire);
		fond.className = 'modal_zzzelp';

		barre_boutons.className = 'zzzelp_modal_boutons';
		bouton_quitter.src = url_zzzelp + '/Images/close.png';
		bouton_quitter.onclick = function onclick(event) {
			ze_Supprimer_element(fond);
		};
		bouton_sommaire.src = url_zzzelp + '/Images/home.png';
		bouton_sommaire.onclick = function onclick(event) {
			that.changeSection(0);
		};
		barre_boutons.appendChild(bouton_quitter);
		barre_boutons.appendChild( document.createTextNode( '\u00A0' ) );
		barre_boutons.appendChild(bouton_sommaire);
		fenetre.appendChild(barre_boutons);

		fond.appendChild(fenetre);
		fenetre.appendChild(entete);
		fenetre.appendChild(contenu_sommaire);
		document.body.appendChild(fond);

		var i=0,
			showed = 0;
		for(var section in that.data) {
			if(section == that.section) {
				showed = i;
			}
			i++;
			var results = that.createSection(section, i);
			entete.appendChild(results.title);
			contenu_sommaire.appendChild(results.link);
			fenetre.appendChild(results.content);
		}
		that.changeSection(showed);	
	};

	this.createSection = function(section, i) {
		var data = that.data[section],
			titre_section = document.createElement('span'),
			lien_section = document.createElement('div'),
			contenu_section = document.createElement('div');
		titre_section.innerHTML = data.titre;
		titre_section.className = 'zzzelp_titre_FAQ';
		titre_section.dataset.section = i;
		titre_section.setAttribute('style', 'display:none');
		contenu_section.className = 'zzzelp_contenu_modal';
		contenu_section.dataset.section = i;
		contenu_section.dataset.visible = 0;

		lien_section.className = 'zzzelp_lien_sommaire';
		lien_section.dataset.section = i;
		lien_section.innerHTML = data.titre;
		lien_section.onclick = function onclick(event) {
			that.changeSection(this.dataset.section);
		};
			
		for(var sous_section in data.contenu) {
			that.createSubSection(contenu_section, sous_section, data.contenu[sous_section]);
		}

		return {
			title : titre_section,
			link : lien_section,
			content : contenu_section
		};
	};

	this.createSubSection = function(section, sous_section, data) {
		var entete_section = document.createElement('h3');
		entete_section.innerHTML = sous_section;
		section.appendChild(entete_section);
		for(var question in data) {
			that.createQuestion(section, question, data[question].contenu);
		}
	};

	this.createQuestion = function(section, question, content) {
		var question_link = document.createElement('div'),
			question_content = document.createElement('div');
		question_link.className = 'zzzelp_question_FAQ';
		question_link.innerHTML = question;
		question_link.onclick = function onclick(event) {
			that.showQuestion(this);
		};
		question_content.setAttribute('style', 'display:none');
		question_content.className = 'zzzelp_reponse_FAQ';
		question_content.innerHTML = '<p>' + content + '</p>';
		section.appendChild(question_link);
		section.appendChild(question_content);
	};

	this.changeSection = function(i) {
		var titres = document.querySelectorAll('.zzzelp_titre_FAQ'),
			contenus = document.querySelectorAll('.zzzelp_contenu_modal');
		for(n=0; n<titres.length; n++) {
			titres[n].style.display = (titres[n].dataset.section == i) ? '' : 'none';
			contenus[n].dataset.visible = (contenus[n].dataset.section == i) ? 1 : 0;
		}		
	};

	this.showQuestion = function(element) {
		element.nextSibling.style.display = (element.nextSibling.style.display == 'none') ? '' : 'none';
	};

	this.init(1);
}