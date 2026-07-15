import { useState } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('typescript', typescript);

interface Props {
	code: string;
	lang?: string;
}

/** A syntax-highlighted code block with a copy-to-clipboard button. */
export default function CodeBlock({ code, lang = 'bash' }: Props) {
	const [copied, setCopied] = useState(false);
	const language = hljs.getLanguage(lang) ? lang : 'plaintext';
	const html =
		language === 'plaintext'
			? undefined
			: hljs.highlight(code, { language }).value;

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			/* clipboard unavailable (e.g. insecure context) — ignore */
		}
	};

	return (
		<div className='group relative'>
			<button
				onClick={copy}
				className='focus-ring absolute right-2 top-2 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-300 opacity-0 transition hover:bg-slate-700 group-hover:opacity-100'
				aria-label='Copy code'
			>
				{copied ? 'Copied ✓' : 'Copy'}
			</button>
			<pre className='overflow-x-auto rounded-xl border border-slate-800 bg-[#0d1117] p-4 text-[13px] leading-relaxed'>
				<code className='hljs font-mono text-slate-200'>
					{html ? (
						<span dangerouslySetInnerHTML={{ __html: html }} />
					) : (
						code
					)}
				</code>
			</pre>
		</div>
	);
}
