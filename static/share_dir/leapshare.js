(function() {
"use strict";

/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  Revision #1 - September 4, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|  https://developer.mozilla.org/User:fusionchess
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
	getItem: function (sKey) {
		if (!sKey) { return null; }
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
				}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
	return true;
	},
	removeItem: function (sKey, sPath, sDomain) {
		if (!this.hasItem(sKey)) { return false; }
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		if (!sKey) { return false; }
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
		return aKeys;
	}
};

var langs = {
	as: "actionscript",
	txt: "asciidoc",
	s: "assembly_x86",
	S: "assembly_x86",
	asm: "assembly_x86",
	cpp: "c_cpp",
	hpp: "c_cpp",
	cx: "c_cpp",
	hx: "c_cpp",
	c: "c_cpp",
	h: "c_cpp",
	clj: "clojure",
	cljs: "clojure",
	edn: "clojure",
	coffee: "coffee",
	cs: "csharp",
	css: "css",
	dart: "dart",
	d: "d",
	erl: "erlang",
	hrl: "erlang",
	go: "golang",
	hs: "haskell",
	lhs: "haskell",
	html: "html",
	htm: "html",
	java: "java",
	js: "javascript",
	json: "json",
	jsp: "jsp",
	jl: "julia",
	tex: "latex",
	less: "less",
	lisp: "lisp",
	lsp: "lisp",
	l: "lisp",
	cl: "lisp",
	fasl: "lisp",
	lua: "lua",
	mk: "makefile",
	md: "markdown",
	m: "matlab",
	ml: "ocaml",
	pl: "perl",
	pm: "perl",
	t: "perl",
	pod: "perl",
	php: "php",
	ps: "powershell",
	py: "python",
	rb: "ruby",
	rs: "rust",
	rlib: "rust",
	sass: "sass",
	scss: "sass",
	scala: "scala",
	scm: "scheme",
	ss: "scheme",
	sh: "sh",
	bash: "sh",
	sql: "sql",
	vb: "vbscript",
	xml: "xml",
	yaml: "yaml",
	yml: "yaml",
};

var themes = {
	ambiance : "Ambiance",
	chaos : "Chaos",
	chrome : "Chrome",
	clouds : "Clouds",
	clouds_midnight : "Clouds/Midnight",
	cobalt : "Cobalt",
	crimson_editor : "Crimson",
	dawn : "Dawn",
	dreamweaver : "Dreamweaver",
	eclipse : "Eclipse",
	github : "Github",
	idle_fingers : "Idle Fingers",
	katzenmilch : "Katzenmilch",
	kuroir : "Kurior",
	merbivore : "Merbivore",
	merbivore_soft : "Merbivore Soft",
	mono_industrial : "Mono Industrial",
	monokai : "Monokai",
	pastel_on_dark : "Pastel on Dark",
	solarized_dark : "Solarized Dark",
	solarized_light : "Solarized Light",
	terminal : "Terminal",
	textmate : "Textmate",
	tomorrow : "Tomorrow",
	tomorrow_night_blue : "Tomorrow Night Blue",
	tomorrow_night_bright : "Tomorrow Night Bright",
	tomorrow_night_eighties : "Tomorrow Night Eighties",
	tomorrow_night : "Tomorrow Night",
	twilight : "Twilight",
	vibrant_ink : "Vibrant Ink",
	xcode : "XCode"
};

var keymaps = {
	none : "Standard",
	vim : "Vim",
	emacs : "Emacs"
};

var theme = "dawn";
var binding = "none";

var ace_editor = null;
var leaps_client = null;
var username = "anon";

var configure_ace_editor = function() {
	if ( ace_editor === null ) {
		return;
	}
	ace_editor.setTheme("ace/theme/" + theme);

	var map = "";
	if ( binding !== "none" ) {
		map = "ace/keyboard/" + binding;
	}
	ace_editor.setKeyboardHandler(map);
};

var HSVtoRGB = function(h, s, v) {
	"use strict";

	var r, g, b, i, f, p, q, t;
	if (h && s === undefined && v === undefined) {
		s = h.s, v = h.v, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return {
		r: Math.floor(r * 255),
		g: Math.floor(g * 255),
		b: Math.floor(b * 255)
	};
};

var hash = function(str) {
	"use strict";

	var hash = 0, i, chr, len;
	if ('string' !== typeof str || str.length == 0) {
		return hash;
	}
	for (i = 0, len = str.length; i < len; i++) {
		chr   = str.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

var ACE_cursor_handler = function(user_id, lineHeight, top, left) {
	var height = 40;
	var width = 3;

	var id_hash = hash(user_id);
	if ( id_hash < 0 ) {
		id_hash = id_hash * -1;
	}

	var hue = ( id_hash % 10000 ) / 10000;
	var rgb = HSVtoRGB(hue, 1, 0.8);

	var colorStyle = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1)";

	var vis_height = 0;
	if ( ace_editor !== null ) {
		vis_height = (ace_editor.getLastVisibleRow() - ace_editor.getFirstVisibleRow()) * lineHeight;
	}

	var positionStyle = "";
	var nameBar = "";
	if ( ( top + lineHeight ) < height ) {
		if ( top < 0 ) {
			top = 0;
			colorStyle += "; opacity: 0.5";
		}
		positionStyle = "position: absolute; top: " + top + "px; left: " + left + "px;";
		nameBar = "<div style='position: absolute; top: " + (top + (height - 18) ) +
			"px; left: " + left + "px; background-color: " + colorStyle +
			"; color: #f0f0f0; padding: 4px; font-size: 10px;'>" + user_id + "</div>";
	} else {
		if ( top > vis_height ) {
			top = vis_height - lineHeight;
			colorStyle += "; opacity: 0.5";
		}
		positionStyle = "position: absolute; top: " + ( top - height + lineHeight ) + "px; left: " + left + "px;";
		nameBar = "<div style='" + positionStyle + " background-color: " + colorStyle +
			"; color: #f0f0f0; padding: 4px; font-size: 10px;'>" + user_id + "</div>";
	}

	var markerLine = "<div style='" + positionStyle + " height: " + height + "px; border-left: " + width +
		"px solid " + colorStyle + ";'></div>";

	return markerLine + nameBar;
};

var join_new_document = function(document_id) {
	if ( leaps_client !== null ) {
		leaps_client.close();
		leaps_client = null;
	}

	if ( ace_editor !== null ) {
		var oldDiv = ace_editor.container
		var newDiv = oldDiv.cloneNode(false)

		ace_editor.destroy();
		ace_editor = null;

		oldDiv.parentNode.replaceChild(newDiv, oldDiv)
	}

	ace_editor = ace.edit("editor");
	configure_ace_editor();

	var filetype = "asciidoc";
	try {
		var ext = document_id.substr(document_id.lastIndexOf(".") + 1);
		if ( typeof langs[ext] === 'string' ) {
			filetype = langs[ext];
		}
	} catch (e) {}

	ace_editor.getSession().setMode("ace/mode/" + filetype);

	leaps_client = new leap_client();
	leaps_client.bind_ace_editor(ace_editor);

	leaps_client.on("error", function(err) {
		if ( leaps_client !== null ) {
			console.error(err);
			append_message("Connection to document closed, document is now READ ONLY", "red");
			leaps_client.close();
			leaps_client = null;
		}
	});

	leaps_client.on("disconnect", function(err) {
		if ( leaps_client !== null ) {
			append_message(document_id + " closed", "red");
		}
	});

	leaps_client.on("connect", function() {
		leaps_client.join_document(document_id);
	});

	leaps_client.on("document", function() {
		append_message("Opened document " + document_id, "dark-grey");
	});

	leaps_client.on("user", function(user_update) {
		var metadata = user_update.message;
		if ( 'string' === typeof metadata ) {
			var data = JSON.parse(metadata);
			if ( 'string' === typeof data.text ) {
				append_message((data.username || "anon") + ": " + data.text, "blue");
			}
		}
	});

	leaps_client.ACE_set_cursor_handler(ACE_cursor_handler);

	leaps_client.connect("ws://" + window.location.host + "/socket");
};

var get_selected_li = function() {
	var li_eles = document.getElementsByTagName('li');
	for ( var i = 0, l = li_eles.length; i < l; i++ ) {
		if ( li_eles[i].className === 'selected' ) {
			return li_eles[i];
		}
	}
	return null;
};

var show_paths = function(paths_list) {
	if ( typeof paths_list !== 'object' ) {
		console.error("paths list wrong type", typeof paths_list);
		return
	}

	var selected_path = "";
	var selected_ele = get_selected_li();
	if ( selected_ele !== null ) {
		selected_path = selected_ele.id;
	}

	var paths_ele = document.getElementById("file-list");
	paths_ele.innerHTML = "";

	for ( var i = 0, l = paths_list.length; i < l; i++ ) {
		var li = document.createElement("li");
		var text = document.createTextNode(paths_list[i]);

		li.id = paths_list[i];

		li.onclick = function(ele, id) {
			return function() {
				if ( ele.className === 'selected' ) {
					// Nothing
				} else {
					var current_ele = get_selected_li();
					if ( current_ele !== null ) {
						current_ele.className = '';
					}

					ele.className = 'selected';
					join_new_document(id);
				}
			};
		}(li, li.id);

		if ( selected_path === li.id ) {
			li.className = 'selected';
		}
		li.appendChild(text);
		paths_ele.appendChild(li);
	}
};

var AJAX_GET = function(path, onsuccess, onerror) {
	var xmlhttp;
	if (window.XMLHttpRequest)  {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.onreadystatechange = function() {
		if ( xmlhttp.readyState == 4 ) { // DONE
			if ( xmlhttp.status == 200 ) {
				onsuccess(xmlhttp.responseText);
			} else {
				onerror(xmlhttp.status, xmlhttp.responseText);
			}
		}
	};

	xmlhttp.open("GET", path, true);
	xmlhttp.send();
};

var get_paths = function() {
	AJAX_GET("/files", function(data) {
		try {
			var paths_list = JSON.parse(data);
			show_paths(paths_list.paths);
		} catch (e) {
			console.error("paths parse error", e);
		}
	}, function(code, message) {
		console.error("get_paths error", code, message);
	});
};

var append_message = function(text, style) {
	var msg_window = document.getElementById("info-window");
	var messages = document.getElementById("info-messages");
	var div = document.createElement("div");
	if ( typeof style === 'string' ) {
		div.className = style;
	}
	var text = document.createTextNode((new Date()).toTimeString().substr(0, 8) + " " + text);

	div.appendChild(text);
	messages.insertBefore(div, messages.firstChild);
};

window.onload = function() {
	get_paths();

	var refresh_button = document.getElementById("refresh-button");
	refresh_button.onclick = function() {
		get_paths();
	};

	var clear_button = document.getElementById("clear-button");
	clear_button.onclick = function() {
		var messages = document.getElementById("info-messages");
		messages.innerHTML = "";
	};

	var username_bar = document.getElementById("username-bar");
	username_bar.onkeyup = function() {
		username = username_bar.value || "anon";
		docCookies.setItem("username", username_bar.value);
	};

	if ( docCookies.hasItem("username") ) {
		username_bar.value = docCookies.getItem("username");
	}
	username = username_bar.value || "anon";

	var chat_bar = document.getElementById("chat-bar");
	chat_bar.onkeypress = function(e) {
		if ( typeof e !== 'object' ) {
			e = window.event;
		}
		var keyCode = e.keyCode || e.which;
		if ( keyCode == '13' ) {
			if ( leaps_client !== null ) {
				leaps_client.send_message(JSON.stringify({
					username: username,
					text: chat_bar.value
				}));
				append_message(username + ": " + chat_bar.value, "blue");
				chat_bar.value = "";
				return false;
			} else {
				append_message(
					"You must open a document in order to send messages, " +
					"they will be readable by other users editing that document", "red"
				);
				return true;
			}
		}
	};

	setInterval(function() {
		if ( leaps_client !== null ) {
			leaps_client.send_message(JSON.stringify({
				username: username
			}));
		}
	}, 1000);
};

})();