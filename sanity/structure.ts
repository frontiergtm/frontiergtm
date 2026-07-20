import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("FrontierGTM Blog")
    .items([
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("author").title("Authors"),
    ]);
