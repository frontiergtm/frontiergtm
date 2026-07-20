import { hasSanityConfig } from "./env";
import { sanityClient } from "./client";
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

export async function getPublishedBlogPostsFresh() {
  if (!hasSanityConfig) return [] as BlogPost[];
  return sanityClient.withConfig({ useCdn: false }).fetch<BlogPost[]>(postsQuery, {}, {
    cache: "no-store",
    perspective: "published",
  });
}

export async function getPublishedBlogPostFresh(slug: string) {
  if (!hasSanityConfig) return null;
  return sanityClient.withConfig({ useCdn: false }).fetch<BlogPost | null>(postBySlugQuery, { slug }, {
    cache: "no-store",
    perspective: "published",
  });
}

export async function getPublishedBlogSlugsFresh() {
  if (!hasSanityConfig) return [] as Array<{ slug: string }>;
  return sanityClient.withConfig({ useCdn: false }).fetch<Array<{ slug: string }>>(postSlugsQuery, {}, {
    cache: "no-store",
    perspective: "published",
  });
}
