const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

const copyExtensions = new Set([".css", ".js", ".json", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".ico"]);

function resetDist() {
	fs.rmSync(dist, {force: true, recursive: true});
	fs.mkdirSync(dist, {recursive: true});
}

function copyDirectory(from, to) {
	fs.mkdirSync(to, {recursive: true});

	for (const entry of fs.readdirSync(from, {withFileTypes: true})) {
		const sourcePath = path.join(from, entry.name);
		const targetPath = path.join(to, entry.name);

		if (entry.isDirectory()) {
			copyDirectory(sourcePath, targetPath);
			continue;
		}

		if (copyExtensions.has(path.extname(entry.name).toLowerCase())) {
			fs.copyFileSync(sourcePath, targetPath);
		}
	}
}

resetDist();
copyDirectory(src, dist);

console.log("Built Chrome extension in dist/");
