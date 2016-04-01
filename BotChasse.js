function ZzzelpScriptBotChasse() {
	var that = this;

	this.values = {
		TDC_conquis : { values : [1000000000], name : 'quantiteVoulue' },
		TDC_depart : { values : [50], name : 'quantiteInitial' },
		armes : { values : [0], name : 'ATTtechArme' },
		bouclier : { values : [0], name : 'ATTtechBouclier' },
		cochenilles : { values : [0], name : 'cochenille' },
		vitesse_chasse : { values : [0], name : 'vitesse' }
	};
	this.armee = [10000000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	this.localStorageKey = 'zzzelp_' + ze_serveur + '_bot_chasses';
	this.number = 0;



	this.init = function() {
		that.createInterface();
		that.simulate();
	};

	this.createInterface = function() {
		var elements = document.querySelector('#centre').childNodes;
		for(i=0; i<elements.length; i++) {
			if(elements[i].id != 'menu') {
				ze_Supprimer_element(elements[i]);
			}
		}

		var	zone = document.createElement('div');
		zone.innerHTML = '<center><b>Simulations stockées : <span id="nombre_similations_zzzelp">0</span></b></center>';
		document.querySelector('#centre').appendChild(zone);
	};

	this.analyse = function(simulation) {
		var data = {
			analyse : new ZzzelpScriptAnalyseurChasse(simulation).getValues().details[0].valeurs,
			niveaux : that.actual_data
		};
		that.send(data, 1);
	};

	this.simulate = function() {
		var form = that.completeForm();
		that.submitForm(form);

	};

	this.send = function(data, mode) {
		console.log(data);
		var form = new FormData();
		form.append('data', JSON.stringify(data));
		new ZzzelpScriptAjax({ method : 'POST', data : form, force : mode, domain : 'zzzelp', url : 'stockagesimulation?mode=chasse&' }, 
			{ success : function(values) {
				var el = document.querySelector('#nombre_similations_zzzelp');
				el.innerHTML = ze_Nombre(parseInt(el.innerHTML.replace(/ /g, '')) + 1);
				that.simulate();
			}, authentication_issue : function() {
				that.send(data, 2);
			}
		});
	};

	this.completeForm = function() {
		var form = new FormData();
		that.actual_data = {};

		form.append('simulation', 'Fight !');

		for(var niveau in that.values) {
			var values = that.values[niveau].values,
				value = values[Math.floor(Math.random()*values.length)];
			that.actual_data[niveau] = value;
			form.append(that.values[niveau].name, value);
		}

		for(var i=0; i<14; i++) {
			form.append('ATTunite' + ZzzelpScriptArmee.ID[i], that.armee[i]);
		}
		return form;
	};

	this.submitForm = function(form) {
		var url_ajax = 'simulateurChasse.php';
		new ZzzelpScriptAjax({ method : 'POST', data : form, domain : 'fourmizzz', url : url_ajax, addDOM : true }, 
			{ success : function(zone_page) {
				that.analyse(zone_page.querySelectorAll('#centre p')[1].innerHTML);
			}
		});	
	};

	this.init();

}