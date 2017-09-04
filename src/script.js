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

	whitespaces.forEach(function(whitespace) {
		visualizeWS(whitespace);
	});

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
			} else {
				var newChild = document.createElement('span');

				var html = htmlEntities(child.nodeValue);
				html = html.replace(whitespace.regex, '<span class="_visualizeWS-' + whitespace.name + '">' + whitespace.char + '</span>');

				newChild.innerHTML = html;

				child.parentNode.insertBefore(newChild, child);
				child.remove();
			}
		});
	}

	function htmlEntities(string) {
		return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	document.body.innerHTML += '<style type="text/css">._visualizeWS-tab, ._visualizeWS-space { position: relative; } ._visualizeWS-tab:before, ._visualizeWS-space:before { position: absolute; top: 0; left: 50%; transform: translate(-50%, -2.75px); color: #bbb; } ._visualizeWS-tab:before { content: "\\2192"; } ._visualizeWS-space:before { content: "\\22C5"; }</style>';
})();

/* TODO: Don't replace the very first character in a line. (For non-diff lines, Github will insert a space instead of a plus or minus.) */
/* TODO: Selector only finds elements in the first .diff-table. */