function ZzzelpScriptErrors() {

	var that = this;

	this.messages = [];
	this.trace = false;
	this.localStorageKey = 'zzzelp_rapport_bug_' + ze_serveur;

	this.init = function() {
		this.event();
		this.updateConsole();	
		this.addPage();
		if(~document.location.href.indexOf('?bug_report')) {
			that.createInterface();
		}
	};

	this.event = function() {
		window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
			that.logMessage('error', {
				error : errorMsg,
				script : url, 
				line : lineNumber,
				column : column,
				trace : errorObj
			});
		};	
	};

	this.updateConsole = function() {
		window.console= that.console(window.console);
	};

	this.logMessage = function(type, message) {
		if(this.trace) {
			window.console.trace();
		}
		that.messages.push({
			type : type,
			date : new Date().getTime(),
			content : message
		});
		that.updateRapport();
	};

	this.console = function(old_console) {
		var console = {

		};
		console.log = function(text){
			that.logMessage('message', text);
			old_console.log(text);        
		};
		console.info = function (text) {
			that.logMessage('message', text);
			old_console.info(text);
		};
		console.warn = function (text) {
			that.logMessage('message', text);
			old_console.warn(text);
		};
		console.error = function (text) {
			that.logMessage('message', text);
			old_console.error(text);
		};
		console.trace = function() {
			old_console.trace();
		};
		console.old_log = function(text) {
			old_console.log(text);
		};
		return console;
	};

	this.getRapport = function() {
		var rapport = localStorage.getItem(that.localStorageKey);
		if(rapport === null) {
			that.saveRapport([]);
			return [];
		}
		else {
			try {
				return JSON.parse(rapport);
			}
			catch(e) {
				that.saveRapport([]);
				return [];
			}
		}
	};

	this.saveRapport = function(rapport) {
		localStorage.setItem(that.localStorageKey, JSON.stringify(rapport));
	};

	this.addPage = function() {
		var rapport = that.getRapport();
		rapport.push({
			page : document.location.href,
			contenu : []
		});
		that.saveRapport(rapport);
	};

	this.updateRapport = function() {
		var rapport = that.getRapport();
		rapport[rapport.length-1].contenu = that.messages;
		if(rapport.length > 25) {
			rapport.shift();
		}
		that.saveRapport(rapport);
	};

	this.createInterface = function() {
		var elements = document.querySelector('#centre').childNodes;
		for(i=0; i<elements.length; i++) {
			if(elements[i].id != 'menu') {
				elements[i].parentNode.removeChild(elements[i]);
			}
		}
		var textarea = document.createElement('textarea');
		textarea.value =  that.createReport();
		textarea.setAttribute('style', 'width: 70%;margin: auto;display: block;height: calc(90vh - 200px);');
		document.querySelector('#centre').appendChild(textarea);
	};

	this.createReport = function() {
		var rapport = that.getRapport(),
			txt = '';
		for(var i=rapport.length-1; i>=0; i--) {
			var page = rapport[i];
			txt += '[b]' + page.page + ' : [/b]\n\n';
			for(var j=0; j<page.contenu.length; j++) {
				var ligne = page.contenu[j];
				txt += '[i]' + that.getDate(ligne.date) + ' (' + ligne.type + ') :[/i]\n';
				if(ligne.type == 'message') {
					txt += ligne.content;
				}
				else {
					txt += '[color=#FF0000]Error : ' + ligne.content.error + '\n';
					txt += ligne.script + ' (' + ligne.content.line + ' ' + ligne.content.column + ')[/color]'; 
				}
				txt += '\n\n';
			}
			txt += '\n\n\n';
		}
		return txt;
	};

	this.getDate = function(timestamp) {
		var date = new Date(timestamp),
			date_str = ((date.getHours() >= 10) ? date.getHours()  : ("0" + date.getHours())) + ':';
		date_str += ((date.getMinutes() >= 10) ? date.getMinutes()  : ("0" + date.getMinutes())) + ':';
		date_str += ((date.getSeconds() >= 10) ? date.getSeconds()  : ("0" + date.getSeconds()));		
		return date_str;
	};

	this.init();
}

