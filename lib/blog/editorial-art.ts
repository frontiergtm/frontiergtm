import type { BlogPost } from "@/lib/sanity/types";
import { urlForSanityImage } from "@/lib/sanity/image";

const siteUrl = "https://www.frontiergtm.ai";

type EditorialArt = {
  cardSrc: string;
  socialSrc: string;
  alt: string;
};

const editorialArtBySlug: Record<string, EditorialArt> = {
  "frontier-ai-deserves-frontiergtm": {
    cardSrc: "/blog/infrastructure-frontier.jpg",
    socialSrc: "/blog/infrastructure-frontier-social.jpg",
    alt: "An abstract evergreen frontier landscape connected by restrained gold pathways",
  },
};

export function getEditorialArt(slug: string) {
  return editorialArtBySlug[slug];
}

export function getPostSocialImage(post: BlogPost) {
  const sanityImage = post.socialImage?.asset ? post.socialImage : post.heroImage;
  if (sanityImage?.asset) {
    return {
      url: urlForSanityImage(sanityImage).width(1200).height(630).url(),
      width: 1200,
      height: 630,
    };
  }

  const editorialArt = getEditorialArt(post.slug);
  return editorialArt
    ? { url: `${siteUrl}${editorialArt.socialSrc}`, width: 1200, height: 630 }
    : undefined;
}
