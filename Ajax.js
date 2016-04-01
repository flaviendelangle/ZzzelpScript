function ZzzelpScriptAjax(values, callBacks) {
	var ajax = this;

	this.callBacks = callBacks;
	this.method = values.method;
	this.domain = values.domain;
	this.data = values.data;
	this.force = values.force;
	this.values = values;
	this.requestLog = {};
	this.logs_enable = false;

	this.init = function() {
		ajax.url = ajax.getFullURL(values.url, values.force);
		console.log('AJAX : ' + ajax.url);
		ajax.createXDR();
		ajax.send();
	};

	this.createXDR = function() {
		if (window.XDomainRequest) {
			ajax.xdr = new XDomainRequest(); 
		} 
		else if (window.XMLHttpRequest) {
			ajax.xdr = new XMLHttpRequest(); 
		} 
		else {
			alert("Votre navigateur ne gère pas l'AJAX cross-domain !");
	    }
	};

	this.send = function() {
		ajax.xdr.onload = function() {
			if(ajax.domain == 'fourmizzz') {
				ajax.logRequest();
			}
			ajax.callBack();
		};
		ajax.xdr.open(ajax.method, ajax.url, true);
		if(ajax.values.contentType) {
			ajax.xdr.setRequestHeader("Content-Type", ajax.values.contentType);
		}
		this.requestLog.beginning = time(true);
		ajax.xdr.send(ajax.data);
	};

	this.callBack = function() {
		if(ajax.domain == 'zzzelp' || ajax.domain == 'zzzelp_interne') {
			if(ajax.values.brute) {
				var valeur;
				try {
					valeur = JSON.parse(ajax.xdr.responseText);
				}
				catch(e) {
					valeur = ajax.xdr.responseText;
				}
				ajax.callBacks.success(valeur, ajax);
			}
			else {
				var response_maping = ['unknown_player', 'authentication_issue', 'success'],
					data = ajax.response(ajax.xdr.responseText),
					response_type = response_maping[data.etat];
				console.log(ajax.callBacks);
				console.log(response_type)
				if(response_type in ajax.callBacks) {
					ajax.callBacks[response_type](data.resultats, ajax);
				}
			}
		}
		else {
			if(ajax.values.addDOM) {
				ajax.addResponseDOM();
			}
			else if(ajax.callBacks.success) {
				ajax.callBacks.success(ajax.xdr.responseText, ajax);
			}
		}
	};

	this.getFullURL = function(partial_url, force) {
		if(ajax.domain == 'zzzelp') {
			var token = (ajax.force == 2) ? getToken() : getTokenZzzelp();
			return url_zzzelp + partial_url + 'serveur=' + ze_serveur + '&pseudo=' + gpseudo + '&token=' + token;
		}
		else if(ajax.domain == 'zzzelp_interne') {
			return url_zzzelp + partial_url;
		}
		else {
			return 'http://' + ze_serveur + '.fourmizzz.fr/' + partial_url;
		}
	};

	this.response = function(data) {
		try {
			data = JSON.parse(data);
			if(typeof ze_serveur != 'undefined') {
				ze_createCookie('zzzelp_etat_auth_' + ze_serveur, data.etat, 365);
				if(typeof data.token == 'string') {
					ze_createCookie('zzzelp_token_' + ze_serveur, data.token, 365);
				}
				if(data.etat == 2) {
					localStorage.setItem('zzzelp_authreussie', time_fzzz());
				}
			}
		}
		catch(e) {
			console.log(data);
			console.log(e);
		}
		return data;
	};

	this.addResponseDOM = function() {
		var page = ze_getBody(ajax.xdr.responseText),
			zone_page = document.createElement('div');
		zone_page.setAttribute('id','contenu_zzzelp');
		zone_page.setAttribute('style','display:none');
		zone_page.innerHTML = page;
		document.querySelector('body').appendChild(zone_page);
		if(ajax.callBacks.success) {
			ajax.callBacks.success(zone_page, this);
		}
		if(typeof ajax.values.destroyDOM == 'undefined' || ajax.values.destroyDOM) {
			setTimeout(function() {
				try {
					ze_Supprimer_element(zone_page);
				}
				catch(e) {

				}
			}, 1000);
		}
	};

	this.logRequest = function() {
		if(ajax.logs_enable) {
			ajax.requestLog.end = time(true);
			ajax.requestLog.duration = ajax.requestLog.end - ajax.requestLog.beginning;
			ajax.requestLog.size = ajax.xdr.getResponseHeader("Content-Length");
			ajax.requestLog.url = ajax.url;
			var logs = ZzzelpScriptAjax.getLogs();
			logs.push(ajax.requestLog);
			ajax.saveLogs(logs);
		}


	};


	this.saveLogs = function(logs) {
		localStorage.setItem(ZzzelpScriptAjax.localStorageKey, JSON.stringify(logs));
	};

	this.init();
}

if(typeof ze_serveur != 'undefined') {
	ZzzelpScriptAjax.localStorageKey = 'zzzelp_logs_ajax_' + ze_serveur;
}

ZzzelpScriptAjax.getLogs = function() {
	var logs = localStorage.getItem(ZzzelpScriptAjax.localStorageKey);
	if(logs === null) {
		return [];
	}
	else {
		try {
			logs = JSON.parse(logs);
			return logs;
		}
		catch(e) {
			return [];
		}
	}			
};

ZzzelpScriptAjax.showLogs = function() {
	var logs = ZzzelpScriptAjax.getLogs(),
		txt = '';
	for(var i=0; i<logs.length; i++) {
		txt += logs[i].duration + '	' + logs[i].size + '	' + logs[i].url + '\n';
	}
	console.log(txt);
};