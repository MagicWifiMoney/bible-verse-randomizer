// Static verse data - auto-generated
// Do not edit manually - update via scripts/export-for-deployment.js

import rawVerses from './verses-data.json';

export const staticVerses: Record<string, any> = rawVerses as any;

export function hasVerse(slug: string): boolean {
  return slug in staticVerses;
}

export function getStaticVerse(slug: string) {
  return staticVerses[slug] || null;
}

export function getAllVersesSlugs(): string[] {
  return Object.keys(staticVerses);
}
