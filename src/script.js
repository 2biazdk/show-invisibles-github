(function () {
	"use strict";

	const storageKey = "showInvisiblesEnabled";
	const disabledClass = "show-invisibles-github-disabled";
	const tokenClass = "show-invisibles-github-token";
	const markerClass = "show-invisibles-github-marker";
	const rawClass = "show-invisibles-github-raw";
	const targetSelector = [
		".blob-code-inner:not(.blob-code-hunk)",
		".diff-text-inner",
		"[data-code-cell]",
		"[data-testid='code-cell']",
		".react-code-text",
		".cm-line",
		"pre code"
	].join(",");

	let enabled = true;
	let scheduled = false;
	const pendingTargets = new Set();

	function setEnabled(nextEnabled) {
		enabled = Boolean(nextEnabled);
		document.documentElement.classList.toggle(disabledClass, !enabled);

		if (enabled) {
			queueTargets(document);
		}
	}

	function queueTargets(root) {
		if (!enabled || isInsideToken(root)) {
			return;
		}

		collectTargets(root).forEach(target => pendingTargets.add(target));
		scheduleFlush();
	}

	function collectTargets(root) {
		if (root.nodeType === Node.TEXT_NODE) {
			const target = root.parentElement && root.parentElement.closest(targetSelector);
			return target && !isInsideToken(target) ? [target] : [];
		}

		if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
			return [];
		}

		const targets = [];

		if (root.nodeType === Node.ELEMENT_NODE && root.matches(targetSelector)) {
			targets.push(root);
			return targets;
		}

		root.querySelectorAll(targetSelector).forEach(target => {
			if (!target.parentElement.closest(targetSelector)) {
				targets.push(target);
			}
		});

		return targets;
	}

	function scheduleFlush() {
		if (scheduled || pendingTargets.size === 0) {
			return;
		}

		scheduled = true;
		requestAnimationFrame(() => {
			scheduled = false;

			if (!enabled) {
				pendingTargets.clear();
				return;
			}

			const targets = Array.from(pendingTargets);
			pendingTargets.clear();
			targets.forEach(renderTarget);
		});
	}

	function renderTarget(target) {
		if (!target.isConnected || isInsideToken(target)) {
			return;
		}

		const walker = document.createTreeWalker(
			target,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode(node) {
					if (!/[ \t]/.test(node.nodeValue)) {
						return NodeFilter.FILTER_REJECT;
					}

					if (isInsideToken(node)) {
						return NodeFilter.FILTER_REJECT;
					}

					return NodeFilter.FILTER_ACCEPT;
				}
			}
		);
		const textNodes = [];

		while (walker.nextNode()) {
			textNodes.push(walker.currentNode);
		}

		textNodes.forEach(replaceTextNode);
	}

	function replaceTextNode(node) {
		const fragment = document.createDocumentFragment();
		const text = node.nodeValue;
		let chunkStart = 0;

		for (let index = 0; index < text.length; index += 1) {
			const char = text[index];

			if (char !== " " && char !== "\t") {
				continue;
			}

			if (chunkStart < index) {
				fragment.append(text.slice(chunkStart, index));
			}

			fragment.append(createToken(char));
			chunkStart = index + 1;
		}

		if (chunkStart < text.length) {
			fragment.append(text.slice(chunkStart));
		}

		node.replaceWith(fragment);
	}

	function createToken(char) {
		const token = document.createElement("span");
		token.className = tokenClass + " " + tokenClass + "--" + (char === "\t" ? "tab" : "space");

		const marker = document.createElement("span");
		marker.className = markerClass;
		marker.setAttribute("aria-hidden", "true");
		marker.textContent = char === "\t" ? "→" : "·";

		const raw = document.createElement("span");
		raw.className = rawClass;
		raw.textContent = char;

		token.append(marker, raw);
		return token;
	}

	function isInsideToken(node) {
		const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
		return Boolean(element && element.closest("." + tokenClass));
	}

	function handleMutations(mutations) {
		if (!enabled) {
			return;
		}

		mutations.forEach(mutation => {
			if (isInsideToken(mutation.target)) {
				return;
			}

			if (mutation.type === "characterData") {
				queueTargets(mutation.target);
				return;
			}

			mutation.addedNodes.forEach(queueTargets);
		});
	}

	chrome.storage.local.get({[storageKey]: true}, result => {
		setEnabled(result[storageKey]);
		chrome.runtime.sendMessage({type: "show-invisibles:ready"});
	});

	chrome.storage.onChanged.addListener(changes => {
		if (changes[storageKey]) {
			setEnabled(changes[storageKey].newValue);
		}
	});

	chrome.runtime.onMessage.addListener(message => {
		if (message.type === "show-invisibles:set-enabled") {
			setEnabled(message.enabled);
		}
	});

	new MutationObserver(handleMutations).observe(document.documentElement, {
		childList: true,
		subtree: true,
		characterData: true
	});

	["DOMContentLoaded", "load", "popstate", "hashchange"].forEach(event => {
		addEventListener(event, () => queueTargets(document));
	});

	queueTargets(document);
})();
