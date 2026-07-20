export const sanityApiVersion = "2026-07-01";
export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "suh0nxjv";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const sanityStudioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "https://frontiergtm-blog.sanity.studio";
export const hasSanityConfig = Boolean(sanityProjectId && sanityDataset);
