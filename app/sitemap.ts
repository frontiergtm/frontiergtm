import type { MetadataRoute } from "next";

const routes = ["", "/agents", "/skills", "/agent-builds", "/scan", "/signal", "/launch"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://www.frontiergtm.ai${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/agents" || route === "/skills" ? 0.9 : 0.8,
  }));
}
