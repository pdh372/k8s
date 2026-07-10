import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { ComponentPropsWithoutRef } from 'react';

/** Renders a lesson's markdown with GitHub-flavored tables and code highlighting. */
export default function Markdown({ children }: { children: string }) {
	return (
		<div className='md'>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[
					[rehypeHighlight, { detect: true, ignoreMissing: true }],
				]}
				components={{
					a: ({
						href,
						children,
						...props
					}: ComponentPropsWithoutRef<'a'>) => {
						const external = !!href && /^https?:\/\//.test(href);
						return (
							<a
								href={href}
								target={external ? '_blank' : undefined}
								rel={
									external ? 'noopener noreferrer' : undefined
								}
								{...props}
							>
								{children}
							</a>
						);
					},
				}}
			>
				{children}
			</ReactMarkdown>
		</div>
	);
}
