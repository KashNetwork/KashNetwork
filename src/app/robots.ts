import type { MetadataRoute } from 'next';

// public marketing pages can be found; the member area, admin and API stay out of search
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/app', '/api/', '/thanks', '/login'] }],
    sitemap: 'https://kash.network/sitemap.xml',
  };
}
