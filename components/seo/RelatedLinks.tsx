/**
 * RelatedLinks Component
 * 
 * Renders internal links from the internal-links engine.
 * Displays breadcrumbs at top and related link sections below content.
 */

import Link from 'next/link';
import { LinkSection, InternalLink } from '@/lib/seo/internal-links';

interface RelatedLinksProps {
    sections: LinkSection[];
}

/** Breadcrumb bar — renders at the top of a page */
export function Breadcrumbs({ links }: { links: InternalLink[] }) {
    if (links.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-6">
            <ol className="flex flex-wrap items-center gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
                {links.map((link, i) => (
                    <li key={link.url} className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        {i > 0 && <span className="mx-1 text-slate-300">›</span>}
                        {i < links.length - 1 ? (
                            <Link href={link.url} className="hover:text-amber-600 transition-colors" itemProp="item">
                                <span itemProp="name">{link.text}</span>
                            </Link>
                        ) : (
                            <span className="text-slate-800 font-medium" itemProp="name">{link.text}</span>
                        )}
                        <meta itemProp="position" content={String(i + 1)} />
                    </li>
                ))}
            </ol>
        </nav>
    );
}

/** Full related links section — renders after main content */
export function RelatedLinks({ sections }: RelatedLinksProps) {
    // Filter out breadcrumb sections (rendered separately)
    const contentSections = sections.filter(s =>
        !s.links.some(l => l.type === 'breadcrumb')
    );

    if (contentSections.length === 0) return null;

    return (
        <aside className="mt-12 border-t border-slate-200 pt-8">
            <h2 className="sr-only">Related Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {contentSections.map((section, i) => (
                    <div key={i}>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">{section.title}</h3>
                        <ul className="space-y-2">
                            {section.links.map((link, j) => (
                                <li key={j}>
                                    <Link
                                        href={link.url}
                                        className="text-amber-700 hover:text-amber-900 hover:underline transition-colors"
                                    >
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </aside>
    );
}

/** Extract breadcrumb links from sections */
export function extractBreadcrumbs(sections: LinkSection[]): InternalLink[] {
    for (const section of sections) {
        const breadcrumbs = section.links.filter(l => l.type === 'breadcrumb' || l.type === 'parent');
        if (breadcrumbs.length > 0) return breadcrumbs;
    }
    return [];
}
