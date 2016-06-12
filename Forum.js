function ZzzelpScriptForum() {

	var that = this;

	this.init = function() {
		this.addWatcher(0);
	};

	this.addWatcher = function(ex_ID) {
		if(document.querySelectorAll('.messageForum div[id*="editTopic"]').length > 0) {
			var ID = parseInt(document.querySelector('.messageForum div[id*="editTopic"]').id.replace('editTopic', ''));
			if(ex_ID != ID) {
				ex_ID = ID;
				that.addShareButton(ID);
			}

		}
		setTimeout(function(){
			that.addWatcher(ex_ID);
		}, 100);
	};

	this.addShareButton = function(ID) {
		document.querySelector('#forum').style.position = 'relative';
		var button = document.createElement('img');
		button.src = url_zzzelp + 'Images/share.png';
		button.setAttribute('style', 'position: absolute;top: -10px;right: 10px;width: 20px;cursor: pointer;');
		button.onclick = function onclick(event) {
			window.prompt('Nécessite ZzzelpScript !', 'http://' + ze_serveur + '.fourmizzz.fr/alliance.php?forum_menu&ID_sujet=' + ID);
		};
		document.querySelector('#forum').appendChild(button);
	}

	this.init();
}