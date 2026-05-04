import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://monkmodex.com";
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, priority: 1.0 },
    { url: `${base}/diagnostic`, lastModified: now, priority: 0.9 },
    { url: `${base}/research`, lastModified: now, priority: 0.6 },
    { url: `${base}/sign-in`, lastModified: now, priority: 0.4 },
    { url: `${base}/medical-disclaimer`, lastModified: now, priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${base}/refund`, lastModified: now, priority: 0.3 },
  ];
}
