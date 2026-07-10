// Reads every lesson README under ../theory and emits a single JSON file the app
// imports at build time. Re-run with `npm run gen` whenever the notes change.
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const THEORY_DIR = join(REPO_ROOT, 'theory');
const OUT_FILE = join(__dirname, '..', 'src', 'data', 'lessons.json');

/** Recursively collect every README.md path under a directory. */
async function findReadmes(dir) {
	const out = [];
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...(await findReadmes(full)));
		} else if (entry.name.toLowerCase() === 'readme.md') {
			out.push(full);
		}
	}
	return out;
}

/** First markdown H1 in the file, stripped of the leading "# ". */
function extractTitle(markdown, fallback) {
	const match = markdown.match(/^#\s+(.+?)\s*$/m);
	return match ? match[1].trim() : fallback;
}

/** First non-heading, non-blockquote paragraph — used as a card summary. */
function extractSummary(markdown) {
	const lines = markdown.split(/\r?\n/);
	let inFence = false;
	for (const raw of lines) {
		const line = raw.trim();
		if (line.startsWith('```')) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		if (!line) continue;
		if (line.startsWith('#')) continue;
		if (line.startsWith('>')) continue;
		if (line.startsWith('|') || line.startsWith('---')) continue;
		// Strip common markdown emphasis / links for a clean plain-text preview.
		const plain = line
			.replace(/\*\*(.+?)\*\*/g, '$1')
			.replace(/\*(.+?)\*/g, '$1')
			.replace(/`(.+?)`/g, '$1')
			.replace(/\[(.+?)\]\((.+?)\)/g, '$1');
		return plain.length > 220 ? plain.slice(0, 217) + '…' : plain;
	}
	return '';
}

async function main() {
	if (!existsSync(THEORY_DIR)) {
		throw new Error(`theory/ directory not found at ${THEORY_DIR}`);
	}

	const readmes = await findReadmes(THEORY_DIR);
	const lessons = [];

	for (const file of readmes) {
		const rel = relative(THEORY_DIR, file); // e.g. 02-core-concepts/lesson-02-pods/README.md
		const parts = rel.split(/[\\/]/);
		if (parts.length < 2) continue; // skip stray READMEs directly under theory/

		const section = parts[0]; // 02-core-concepts
		const lessonDir = parts[parts.length - 2]; // lesson-02-pods
		const sectionOrderMatch = section.match(/^(\d+)/);
		const lessonNumMatch = lessonDir.match(/lesson-(\d+)/i);

		const content = await readFile(file, 'utf8');
		const slug = lessonDir.replace(/^lesson-\d+-?/i, '') || lessonDir;

		lessons.push({
			id: lessonDir,
			section,
			sectionOrder: sectionOrderMatch
				? Number(sectionOrderMatch[1])
				: 999,
			lessonNum: lessonNumMatch ? Number(lessonNumMatch[1]) : 999,
			slug,
			title: extractTitle(content, lessonDir),
			summary: extractSummary(content),
			content,
		});
	}

	lessons.sort(
		(a, b) => a.sectionOrder - b.sectionOrder || a.lessonNum - b.lessonNum,
	);

	await mkdir(dirname(OUT_FILE), { recursive: true });
	await writeFile(OUT_FILE, JSON.stringify(lessons, null, 2) + '\n', 'utf8');

	const totalBytes = (await stat(OUT_FILE)).size;
	console.log(
		`Generated ${lessons.length} lessons -> ${relative(REPO_ROOT, OUT_FILE)} (${(
			totalBytes / 1024
		).toFixed(1)} KB)`,
	);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
