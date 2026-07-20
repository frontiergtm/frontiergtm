import { hasSanityConfig } from "./env";
import { sanityFetch } from "./live";
import { postBySlugQuery, postSlugsQuery, postsQuery } from "./queries";
import type { BlogPost } from "./types";

export async function getBlogPosts() {
  if (!hasSanityConfig) return [] as BlogPost[];
  const { data } = await sanityFetch({ query: postsQuery });
  return data as BlogPost[];
}

export async function getBlogPost(slug: string) {
  if (!hasSanityConfig) return null;
  const { data } = await sanityFetch({ query: postBySlugQuery, params: { slug } });
  return data as BlogPost | null;
}

export async function getPublishedBlogSlugs() {
  if (!hasSanityConfig) return [] as Array<{ slug: string }>;
  const { data } = await sanityFetch({
    query: postSlugsQuery,
    perspective: "published",
    stega: false,
  });
  return data as Array<{ slug: string }>;
}
