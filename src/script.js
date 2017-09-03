(function () {
	"use strict";

	var selector = ".diff-table .blob-code-inner";
	var whitespaces = [
		{
			"name": "space",
			"regex": RegExp(" ", "g"),
			"char": "&sdot;"
		},
		{
			"name": "tab",
			"regex": RegExp("\\t", "g"),
			"char": "&rarr;"
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

	document.body.innerHTML += '<style type="text/css">._visualizeWS-tab, ._visualizeWS-space { display: inline-block; text-align: center; color: #bbb; } ._visualizeWS-tab { width: 56.45px; } ._visualizeWS-space { width: 7.25px; }</style>';
})();

/* TODO: Don't replace the very first character in a line. (For non-diff lines, Github will insert a space instead of a plus or minus.) */
/* TODO: Don't replace whitespace within '.blob-code-inner.blob-code-hunk'. */