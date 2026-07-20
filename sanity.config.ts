import { presentationTool } from "sanity/presentation";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { resolve } from "./sanity/presentation/resolve";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_URL
  || (process.env.NODE_ENV === "production" ? "https://www.frontiergtm.ai" : "http://127.0.0.1:3000");

export default defineConfig({
  name: "frontiergtm",
  title: "FrontierGTM Blog",
  projectId: projectId || "suh0nxjv",
  dataset,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve,
      previewUrl: {
        origin: previewOrigin,
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
