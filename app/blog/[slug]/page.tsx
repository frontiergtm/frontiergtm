import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { BlogFooter } from "@/components/blog/blog-footer";
import { PortableArticle } from "@/components/blog/portable-article";
import { Header } from "@/components/header";
import { getPostSocialImage } from "@/lib/blog/editorial-art";
import { getBlogPost, getPublishedBlogPostFresh, getPublishedBlogSlugsFresh } from "@/lib/sanity/posts";
import styles from "../blog.module.css";

type PostPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export async function generateStaticParams() {
  return getPublishedBlogSlugsFresh();
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostFresh(slug);
  if (!post) return {};
  const socialImage = getPostSocialImage(post);
  return {
    title: `${post.seoTitle} | FrontierGTM`,
    description: post.seoDescription,
    alternates: { canonical: `https://www.frontiergtm.ai/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle,
      description: post.seoDescription,
      url: `https://www.frontiergtm.ai/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: socialImage ? [socialImage] : undefined,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title: post.seoTitle,
      description: post.seoDescription,
      images: socialImage ? [socialImage.url] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const previewEnabled = (await draftMode()).isEnabled;
  const post = previewEnabled ? await getBlogPost(slug) : await getPublishedBlogPostFresh(slug);
  if (!post) notFound();

  const publishedDate = dateFormatter.format(new Date(post.publishedAt));
  const updatedDate = post.updatedAt ? dateFormatter.format(new Date(post.updatedAt)) : null;
  const socialImage = getPostSocialImage(post);
  const canonicalUrl = `https://www.frontiergtm.ai/blog/${post.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: canonicalUrl,
    author: { "@type": "Person", name: post.author?.name || "Ryan Pollock" },
    publisher: { "@type": "Organization", name: "FrontierGTM", url: "https://www.frontiergtm.ai" },
    image: socialImage?.url,
  };

  return (
    <main className={styles.page}>
      <Header />
      <article>
        <header className={styles.articleHero}>
          <div className={styles.articleHeroInner}>
            <Link className={styles.backLink} href="/blog">← FrontierGTM Blog</Link>
            {post.tags?.length ? <p className={styles.eyebrow}>{post.tags.slice(0, 3).join(" · ")}</p> : <p className={styles.eyebrow}>FrontierGTM</p>}
            <h1>{post.title}</h1>
            {post.subtitle ? <p className={styles.subtitle}>{post.subtitle}</p> : null}
            <div className={styles.articleMeta}>
              <span>By <strong>{post.author?.name || "Ryan Pollock"}</strong></span>
              <time dateTime={post.publishedAt}>{publishedDate}</time>
              {updatedDate ? <span>Updated {updatedDate}</span> : null}
            </div>
          </div>
        </header>

        <div className={styles.articleMain}>
          <PortableArticle post={post} />
          <div className={styles.articleEnd}><Link href="/blog">← Back to the FrontierGTM Blog</Link></div>
        </div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <BlogFooter />
    </main>
  );
}
