import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlForSanityImage } from "@/lib/sanity/image";
import type { BlogPost, SanityImage } from "@/lib/sanity/types";
import styles from "@/app/blog/blog.module.css";

type ArticleImageProps = { value: SanityImage };
type ArticleLinkProps = {
  children: React.ReactNode;
  value?: { href?: string; blank?: boolean };
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  marks: {
    link: ({ children, value }: ArticleLinkProps) => {
      if (!value?.href) return <>{children}</>;
      const external = value.href.startsWith("http");
      const newTab = value.blank || external;
      return (
        <a href={value.href} target={newTab ? "_blank" : undefined} rel={newTab ? "noreferrer" : undefined}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: ArticleImageProps) => {
      if (!value?.asset) return null;
      return (
        <figure>
          <Image
            src={urlForSanityImage(value).width(1440).height(900).url()}
            alt={value.alt || ""}
            width={1440}
            height={900}
            sizes="(max-width: 900px) 100vw, 780px"
          />
          {value.caption ? <figcaption>{value.caption}</figcaption> : null}
        </figure>
      );
    },
  },
};

export function PortableArticle({ post }: { post: BlogPost }) {
  return (
    <div className={styles.articleBody}>
      <PortableText value={post.body} components={components} />
    </div>
  );
}
