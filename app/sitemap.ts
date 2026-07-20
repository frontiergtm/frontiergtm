import type { MetadataRoute } from "next";
import { getPublishedBlogSlugsFresh } from "@/lib/sanity/posts";

export const dynamic = "force-dynamic";

const routes = ["", "/agents", "/skills", "/agent-builds", "/scan", "/signal", "/launch", "/deal"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes = routes.map((route) => ({
    url: `https://www.frontiergtm.ai${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/agents" || route === "/skills" ? 0.9 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  const blogSlugs = await getPublishedBlogSlugsFresh();
  if (!blogSlugs.length) return baseRoutes;

  return [
    ...baseRoutes,
    {
      url: "https://www.frontiergtm.ai/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogSlugs.map(({ slug }) => ({
      url: `https://www.frontiergtm.ai/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
