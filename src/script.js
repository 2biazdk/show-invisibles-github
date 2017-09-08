(function () {
	"use strict";

	const selector = ".blob-code-inner:not(.blob-code-hunk)";
	const blanks = [
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

	function extension() {
		let elements = document.querySelectorAll(selector);
		blanks.forEach(blank => {
			forElements(blank);
		});

		function forElements(blank) {
			[...elements].forEach(element => {
				if (element.dataset["visible" + blank.name]) {
					return;
				}
				forChildren(element, blank);
				element.dataset["visible" + blank.name] = true;
			});
		}
	
		function forChildren(element, blank) {
			[...element.childNodes].forEach(child => {
				if (child.nodeName !== "#text") {
					forChildren(child, blank);
					return;
				}
	
				let newChild = document.createElement("span");
				newChild.innerHTML = replaceBlanks(child.nodeValue, blank);
	
				child.parentNode.insertBefore(newChild, child);
				child.remove();
			});
		}
	
		function replaceBlanks(string, blank) {
			return htmlEntities(string)
				.replace(
					blank.regex,
					'<span class="invisible invisible__' + blank.name + '">' + blank.char + '</span>'
				);
		}
	
		function htmlEntities(string) {
			return String(string)
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;");
		}
	}

	// Initialize on these handlers
	["load", "popstate", "hashchange"].forEach(event =>
		addEventListener(event, extension)
	);

	// When handlers that are not caught
	setInterval(extension, 3000);
})();

/* TODO: Option to toggle on/off on toolbar icon. */