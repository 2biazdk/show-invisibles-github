import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import plumber from 'gulp-plumber';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import size from 'gulp-size';
import terser from 'gulp-terser';
import { deleteAsync } from 'del';

const sass = gulpSass(dartSass);
const { dest, parallel, series, src } = gulp;
const chromeTarget = ['chrome >= 53'];
const todoExtensions = new Set(['.css', '.htm', '.html', '.js']);

export function clean() {
	return deleteAsync(['dist/**', 'TODO.md']);
}

export async function todos() {
	const entries = await collectSourceFiles('src');
	const todos = [];

	for (const file of entries) {
		const text = await readFile(file, 'utf8');

		text.split(/\r?\n/).forEach(function(line, index) {
			const match = line.match(/\b(?:TODO|FIXME)\b:?\s*(.*)/i);

			if (match) {
				todos.push(`- ${file}:${index + 1} ${match[1].trim()}`);
			}
		});
	}

	if (todos.length) {
		await writeFile('TODO.md', `${todos.join('\n')}\n`);
		return;
	}

	await rm('TODO.md', { force: true });
}

export function js() {
	return src(['./src/**/*.js'])
		.pipe(plumber())
		.pipe(terser({
			mangle: true
		}))
		.pipe(dest('./dist'))
		.pipe(size({
			title: 'js',
			showFiles: true,
			gzip: true
		}));
}

export function css() {
	return src('./src/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer({
			overrideBrowserslist: chromeTarget
		}))
		.pipe(cleanCss())
		.pipe(dest('dist'))
		.pipe(size({
			title: 'css',
			showFiles: true,
			gzip: true
		}));
}

export function img() {
	return src('./src/img/**/*.{jpg,jpeg,png,gif,svg,bmp,ico}')
		.pipe(plumber())
		.pipe(dest('./dist/img'))
		.pipe(size({
			title: 'img',
			showFiles: true,
			gzip: true
		}));
}

export function misc() {
	return src('./src/**/*.{html,xml,json,ico}')
		.pipe(dest('./dist'))
		.pipe(size({
			title: 'other files',
			showFiles: true,
			gzip: true
		}));
}

async function collectSourceFiles(directory) {
	const dirents = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(dirents.map(async function(dirent) {
		const file = path.join(directory, dirent.name);

		if (dirent.isDirectory()) {
			return collectSourceFiles(file);
		}

		if (todoExtensions.has(path.extname(dirent.name))) {
			return file;
		}

		return [];
	}));

	return files.flat();
}

export const build = series(
	clean,
	todos,
	parallel(js, css),
	img,
	misc
);

export default build;
