(function () {
	"use strict";

	var selector = ".diff-table .blob-code-inner:not(.blob-code-hunk)";
	var whitespaces = [
		{
			"name": "space",
			"regex": RegExp(" ", "g"),
			"char": " "
		},
		{
			"name": "tab",
			"regex": RegExp("\\t", "g"),
			"char": "	"
		}
	];

	function visualizeWSInit() {
		whitespaces.forEach(function(whitespace) {
			visualizeWS(whitespace);
		});
	}

	function visualizeWS(whitespace) {
		var elements = document.querySelectorAll(selector);
		[...elements].forEach(function (element) {
			visualizeWSChildren(element, whitespace);
		});
	}

	function visualizeWSChildren(element, whitespace) {
		[...element.childNodes].forEach(function (child) {
			if (child.nodeName !== "#text") {
				visualizeWSChildren(child, whitespace);
				return;
			}

			var newChild = document.createElement("span");

			var html = htmlEntities(child.nodeValue);
			html = html.replace(whitespace.regex, '<span class="_visualizeWS _visualizeWS-' + whitespace.name + '">' + whitespace.char + '</span>');

			newChild.innerHTML = html;

			child.parentNode.insertBefore(newChild, child);
			child.remove();
		});
	}

	function htmlEntities(string) {
		return String(string).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	}

	window.onpopstate = function () {
		visualizeWSInit();
	}

	window.onhashchange = function () {
		visualizeWSInit();
	}

	visualizeWSInit();
})();

/* TODO: Remember which diffs are already processed. */
/* TODO: Run script at an interval to take dynamic page reloads into account. */