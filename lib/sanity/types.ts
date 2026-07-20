import type { PortableTextBlock } from "sanity";

export type SanityImage = {
  asset?: { _ref: string; _type: "reference" };
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

export type BlogAuthor = {
  _id: string;
  name: string;
  slug: string;
  role?: string;
  image?: SanityImage;
  bio?: string;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  heroImage?: SanityImage;
  body: PortableTextBlock[];
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
  featured?: boolean;
  seoTitle: string;
  seoDescription: string;
  socialImage?: SanityImage;
  author: BlogAuthor;
};
