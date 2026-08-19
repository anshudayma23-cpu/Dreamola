import { MetadataRoute } from 'next';
import { prisma } from '../lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dreamola.com';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/dream`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  try {
    const [dreams, users] = await Promise.all([
      prisma.dream.findMany({
        where: { isPublic: true },
        select: { id: true, updatedAt: true },
        take: 1000,
      }),
      prisma.user.findMany({
        select: { username: true, updatedAt: true },
        take: 1000,
      }),
    ]);

    const dreamRoutes: MetadataRoute.Sitemap = dreams.map((dream: any) => ({
      url: `${baseUrl}/dream/${dream.id}`,
      lastModified: dream.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const userRoutes: MetadataRoute.Sitemap = users.map((user: any) => ({
      url: `${baseUrl}/u/${user.username}`,
      lastModified: user.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...dreamRoutes, ...userRoutes];
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err);
    return staticRoutes;
  }
}
