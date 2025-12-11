/**
 * Dynamic Sitemap Generator
 * Generates XML sitemap with static and dynamic property URLs
 */

import { supabase } from '@/integrations/supabase/client';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: Array<{ loc: string; title?: string }>;
}

const BASE_URL = 'https://montoit.ci';

// Helper to get today's date
const getToday = (): string => new Date().toISOString().split('T')[0] ?? new Date().toISOString().substring(0, 10);

// Static pages configuration
const STATIC_PAGES: SitemapUrl[] = [
  { loc: '/', lastmod: getToday(), changefreq: 'daily', priority: 1.0 },
  { loc: '/recherche', lastmod: getToday(), changefreq: 'hourly', priority: 0.95 },
  { loc: '/connexion', lastmod: getToday(), changefreq: 'monthly', priority: 0.7 },
  { loc: '/inscription', lastmod: getToday(), changefreq: 'monthly', priority: 0.7 },
  { loc: '/a-propos', lastmod: getToday(), changefreq: 'monthly', priority: 0.6 },
  { loc: '/contact', lastmod: getToday(), changefreq: 'monthly', priority: 0.6 },
  { loc: '/louer-mon-bien', lastmod: getToday(), changefreq: 'weekly', priority: 0.8 },
  { loc: '/politique-confidentialite', lastmod: getToday(), changefreq: 'yearly', priority: 0.3 },
  { loc: '/conditions-utilisation', lastmod: getToday(), changefreq: 'yearly', priority: 0.3 },
];

// Ivorian communes for location-based pages
const COMMUNES = [
  'cocody', 'marcory', 'plateau', 'yopougon', 'adjame', 
  'treichville', 'abobo', 'koumassi', 'port-bouet', 'bingerville'
];

/**
 * Fetch published properties from database
 */
async function fetchPublishedProperties(): Promise<SitemapUrl[]> {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, updated_at, images, city, neighborhood')
      .eq('status', 'disponible')
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (error) {
      console.error('Error fetching properties for sitemap:', error);
      return [];
    }

    return (properties || []).map(property => {
      const images = Array.isArray(property.images) 
        ? property.images.slice(0, 3).map((img: string) => ({ 
            loc: img, 
            title: property.title || 'Propriété Mon Toit' 
          }))
        : [];

      const lastmod = property.updated_at?.split('T')[0] ?? getToday();

      return {
        loc: `/propriete/${property.id}`,
        lastmod,
        changefreq: 'daily' as const,
        priority: 0.8,
        images
      };
    });
  } catch (error) {
    console.error('Error in fetchPublishedProperties:', error);
    return [];
  }
}

/**
 * Generate commune/neighborhood pages
 */
function generateCommunePages(): SitemapUrl[] {
  const today = getToday();
  return COMMUNES.map(commune => ({
    loc: `/recherche?city=${commune}`,
    lastmod: today,
    changefreq: 'daily' as const,
    priority: 0.75
  }));
}

/**
 * Convert URLs array to XML sitemap format
 */
function generateXML(urls: SitemapUrl[]): string {
  const urlElements = urls.map(url => {
    let urlXml = `  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>`;
    
    // Add image tags if present
    if (url.images && url.images.length > 0) {
      url.images.forEach(image => {
        urlXml += `
    <image:image>
      <image:loc>${image.loc}</image:loc>
      ${image.title ? `<image:title>${escapeXml(image.title)}</image:title>` : ''}
    </image:image>`;
      });
    }
    
    urlXml += `
  </url>`;
    
    return urlXml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlElements}
</urlset>`;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate complete sitemap with static and dynamic URLs
 */
export async function generateDynamicSitemap(): Promise<string> {
  const urls: SitemapUrl[] = [...STATIC_PAGES];
  
  // Add commune pages
  urls.push(...generateCommunePages());
  
  // Add dynamic property pages
  const propertyUrls = await fetchPublishedProperties();
  urls.push(...propertyUrls);
  
  return generateXML(urls);
}

/**
 * Get sitemap stats for monitoring
 */
export async function getSitemapStats(): Promise<{
  totalUrls: number;
  staticUrls: number;
  propertyUrls: number;
  communeUrls: number;
}> {
  const propertyUrls = await fetchPublishedProperties();
  
  return {
    totalUrls: STATIC_PAGES.length + COMMUNES.length + propertyUrls.length,
    staticUrls: STATIC_PAGES.length,
    propertyUrls: propertyUrls.length,
    communeUrls: COMMUNES.length
  };
}
