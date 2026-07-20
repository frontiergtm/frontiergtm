import { defineQuery } from "next-sanity";

const postProjection = `
  _id,
  title,
  "slug": slug.current,
  subtitle,
  excerpt,
  heroImage,
  body,
  publishedAt,
  updatedAt,
  tags,
  featured,
  "seoTitle": coalesce(seoTitle, title),
  "seoDescription": coalesce(seoDescription, excerpt),
  socialImage,
  "author": author->{
    _id,
    name,
    "slug": slug.current,
    role,
    image,
    bio
  }
`;

export const postsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    ${postProjection}
  }
`);

export const postBySlugQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    ${postProjection}
  }
`);

export const postSlugsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current
  }
`);
