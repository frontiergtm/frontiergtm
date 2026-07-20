import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    post: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (document) => ({
        locations: [
          {
            title: document?.title || "Untitled post",
            href: document?.slug ? `/blog/${document.slug}` : "/blog",
          },
          { title: "All posts", href: "/blog" },
        ],
      }),
    }),
  },
};
