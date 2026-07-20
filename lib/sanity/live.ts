import { defineLive } from "next-sanity/live";
import { sanityClient } from "./client";
import { sanityApiVersion } from "./env";

export const { sanityFetch, SanityLive } = defineLive({
  client: sanityClient.withConfig({ apiVersion: sanityApiVersion }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
});
