import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "publishing", title: "Publishing" },
    { name: "seo", title: "Search & sharing" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "publishing",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      description: "Optional supporting line shown beneath the title.",
      type: "string",
      group: "content",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      description: "A concise summary for the blog index, search results, and email previews.",
      type: "text",
      rows: 4,
      group: "content",
      validation: (rule) => rule.required().min(80).max(320),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required().warning("Describe meaningful images for readers using assistive technology."),
        }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) => rule.required().uri({ scheme: ["http", "https", "mailto"] }),
                  }),
                  defineField({ name: "blank", title: "Open in a new tab", type: "boolean", initialValue: false }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              validation: (rule) => rule.required().warning("Describe meaningful images for readers using assistive technology."),
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      group: "publishing",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "publishing",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Substantially updated at",
      description: "Leave empty for ordinary copy edits.",
      type: "datetime",
      group: "publishing",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "publishing",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (rule) => rule.unique().max(8),
    }),
    defineField({
      name: "featured",
      title: "Featured post",
      type: "boolean",
      group: "publishing",
      initialValue: false,
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      description: "Optional override. The article title is used by default.",
      type: "string",
      group: "seo",
      validation: (rule) => rule.max(70).warning("Search results may truncate titles longer than roughly 60 characters."),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      description: "Optional override. The excerpt is used by default.",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(180).warning("Search results may truncate descriptions longer than roughly 160 characters."),
    }),
    defineField({
      name: "socialImage",
      title: "Social sharing image",
      description: "Optional override for link previews. The hero image is used by default.",
      type: "image",
      group: "seo",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Publication date, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "heroImage" },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Unscheduled draft",
        media,
      };
    },
  },
});
