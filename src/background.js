const STORAGE_KEY = "showInvisiblesEnabled";

async function getEnabled() {
	const result = await chrome.storage.local.get({[STORAGE_KEY]: true});
	return Boolean(result[STORAGE_KEY]);
}

async function setEnabled(enabled) {
	await chrome.storage.local.set({[STORAGE_KEY]: enabled});
}

async function updateAction(tabId, enabled) {
	await chrome.action.setTitle({
		tabId,
		title: enabled ? "Hide invisibles on GitHub" : "Show invisibles on GitHub"
	});
	await chrome.action.setBadgeText({
		tabId,
		text: enabled ? "" : "off"
	});
	await chrome.action.setBadgeBackgroundColor({
		tabId,
		color: "#6e7781"
	});
}

chrome.runtime.onInstalled.addListener(async details => {
	if (details.reason === "install") {
		await setEnabled(true);
	}
});

chrome.action.onClicked.addListener(async tab => {
	const enabled = !(await getEnabled());
	await setEnabled(enabled);

	if (tab.id) {
		await updateAction(tab.id, enabled);

		try {
			await chrome.tabs.sendMessage(tab.id, {type: "show-invisibles:set-enabled", enabled});
		} catch (error) {
			// The active tab may not be a GitHub page with the content script loaded.
		}
	}
});

chrome.runtime.onMessage.addListener((message, sender) => {
	if (message.type !== "show-invisibles:ready" || !sender.tab || !sender.tab.id) {
		return;
	}

	getEnabled().then(enabled => {
		updateAction(sender.tab.id, enabled);
	});
});
