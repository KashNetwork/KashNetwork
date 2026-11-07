import type { MetadataRoute } from 'next';

const pages = ['/', '/confirm', '/faqs', '/contact', '/disclaimer', '/ftc-compliance', '/explodely-refund-policy'];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({ url: `https://kash.network${p}`, changeFrequency: 'monthly' as const }));
}
