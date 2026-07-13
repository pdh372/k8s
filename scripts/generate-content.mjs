// Reads every lesson README under ../theory/<track> and emits one JSON file
// per track that the app imports at build time:
//   theory/k8s (nested: <section>/<lesson-dir>/README.md) -> src/data/lessons.json
//   theory/gcp (flat:   <NN-slug>/README.md)              -> src/data/gcp-lessons.json
// Re-run with `pnpm gen` whenever the notes change.
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

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

/**
 * Walks `theoryDir`, turns every README.md under it into a lesson record
 * (via the track-specific `parseEntry`), sorts, and writes it to `outFile`.
 * `parseEntry(parts)` maps a README's path parts (relative to theoryDir) to
 * `{ id, section, sectionOrder, lessonNum, slug }`, or returns null to skip.
 */
async function generateTrack({ theoryDir, outFile, parseEntry }) {
	if (!existsSync(theoryDir)) {
		throw new Error(`theory directory not found at ${theoryDir}`);
	}

	const readmes = await findReadmes(theoryDir);
	const lessons = [];

	for (const file of readmes) {
		const rel = relative(theoryDir, file);
		const parts = rel.split(/[\\/]/);
		const meta = parseEntry(parts);
		if (!meta) continue;

		const content = await readFile(file, 'utf8');
		lessons.push({
			...meta,
			title: extractTitle(content, meta.id),
			summary: extractSummary(content),
			content,
		});
	}

	lessons.sort(
		(a, b) => a.sectionOrder - b.sectionOrder || a.lessonNum - b.lessonNum,
	);

	await mkdir(dirname(outFile), { recursive: true });
	await writeFile(outFile, JSON.stringify(lessons, null, 2) + '\n', 'utf8');

	const totalBytes = (await stat(outFile)).size;
	console.log(
		`Generated ${lessons.length} lessons -> ${relative(REPO_ROOT, outFile)} (${(
			totalBytes / 1024
		).toFixed(1)} KB)`,
	);
}

/** theory/k8s/<section>/<lesson-dir>/README.md */
function parseK8sEntry(parts) {
	if (parts.length < 2) return null; // skip stray READMEs directly under theory/k8s
	const section = parts[0]; // e.g. 02-core-concepts
	const lessonDir = parts[parts.length - 2]; // e.g. lesson-02-pods
	const sectionOrderMatch = section.match(/^(\d+)/);
	const lessonNumMatch = lessonDir.match(/lesson-(\d+)/i);
	const slug = lessonDir.replace(/^lesson-\d+-?/i, '') || lessonDir;

	return {
		id: lessonDir,
		section,
		sectionOrder: sectionOrderMatch ? Number(sectionOrderMatch[1]) : 999,
		lessonNum: lessonNumMatch ? Number(lessonNumMatch[1]) : 999,
		slug,
	};
}

/** Ranges must be sorted ascending, start at 1, and have no gaps/overlaps. */
function assertChapterCoverage(chapters) {
	const sorted = [...chapters].sort((a, b) => a.range[0] - b.range[0]);
	let expected = 1;
	for (const c of sorted) {
		const [start, end] = c.range;
		if (start !== expected) {
			throw new Error(
				`gcp-chapters.json: gap/overlap before "${c.id}" (expected range to start at ${expected}, got ${start})`,
			);
		}
		expected = end + 1;
	}
	return expected - 1; // highest lesson number covered
}

/**
 * theory/gcp/<NN-slug>/README.md (flat — no per-chapter folders). `chapters`
 * is the hand-authored src/data/gcp-chapters.json list; each lesson's
 * `section` is set to the id of the chapter whose lesson-number range
 * contains it, and `sectionOrder` becomes that chapter's position.
 */
function makeGcpEntryParser(chapters) {
	return function parseGcpEntry(parts) {
		if (parts.length !== 2) return null; // anything not directly under theory/gcp
		const lessonDir = parts[0]; // e.g. 01-intro-to-cloud-and-gcp
		const numMatch = lessonDir.match(/^(\d+)-/);
		const lessonNum = numMatch ? Number(numMatch[1]) : 999;
		const chapterIndex = chapters.findIndex(
			c => lessonNum >= c.range[0] && lessonNum <= c.range[1],
		);
		if (chapterIndex === -1) {
			console.warn(
				`  ⚠ gcp: lesson ${lessonNum} (${lessonDir}) matches no chapter range in src/data/gcp-chapters.json`,
			);
		}
		const slug = lessonDir.replace(/^\d+-?/, '') || lessonDir;

		return {
			id: lessonDir,
			section: chapterIndex >= 0 ? chapters[chapterIndex].id : 'uncategorized',
			sectionOrder: chapterIndex >= 0 ? chapterIndex : 999,
			lessonNum,
			slug,
		};
	};
}

async function main() {
	await generateTrack({
		theoryDir: join(REPO_ROOT, 'theory', 'k8s'),
		outFile: join(REPO_ROOT, 'src', 'data', 'lessons.json'),
		parseEntry: parseK8sEntry,
	});

	const chaptersFile = join(REPO_ROOT, 'src', 'data', 'gcp-chapters.json');
	const { chapters } = JSON.parse(await readFile(chaptersFile, 'utf8'));
	assertChapterCoverage(chapters); // throws on authoring mistakes in the table itself

	await generateTrack({
		theoryDir: join(REPO_ROOT, 'theory', 'gcp'),
		outFile: join(REPO_ROOT, 'src', 'data', 'gcp-lessons.json'),
		parseEntry: makeGcpEntryParser(chapters),
	});
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
