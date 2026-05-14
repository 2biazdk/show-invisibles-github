const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function readJson(file) {
	return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function assertFile(file) {
	assert(fs.existsSync(path.join(root, file)), "Missing " + file);
}

function assertJavaScript(file) {
	const code = fs.readFileSync(path.join(root, file), "utf8");
	new vm.Script(code, {filename: file});
}

const packageJson = readJson("package.json");
const manifest = readJson("dist/manifest.json");

assert(manifest.manifest_version === 3, "Manifest must use Manifest V3");
assert(manifest.version === packageJson.version, "Manifest and package versions must match");
assert(!manifest.host_permissions, "Avoid host_permissions unless the background worker needs them");

[
	"dist/manifest.json",
	"dist/background.js",
	"dist/script.js",
	"dist/styling.css",
	"dist/_locales/en/messages.json",
	"dist/_locales/da/messages.json",
	"dist/img/symbol@16w.png",
	"dist/img/symbol@48w.png",
	"dist/img/symbol@128w.png"
].forEach(assertFile);

assertJavaScript("dist/background.js");
assertJavaScript("dist/script.js");

console.log("Verified Chrome extension package.");
