import { createClient } from "next-sanity";
import { sanityApiVersion, sanityDataset, sanityProjectId, sanityStudioUrl } from "./env";

export const sanityClient = createClient({
  apiVersion: sanityApiVersion,
  dataset: sanityDataset,
  projectId: sanityProjectId || "projectid",
  useCdn: true,
  perspective: "published",
  stega: { studioUrl: sanityStudioUrl },
});
