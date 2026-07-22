import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/blog-footer";
import { Header } from "@/components/header";
import { getEditorialArt } from "@/lib/blog/editorial-art";
import { getPublishedBlogPostsFresh } from "@/lib/sanity/posts";
import { urlForSanityImage } from "@/lib/sanity/image";
import type { BlogPost } from "@/lib/sanity/types";
import styles from "./blog.module.css";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function postDate(post: BlogPost) {
  return dateFormatter.format(new Date(post.publishedAt));
}

function PostImage({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const className = featured ? styles.featuredImage : styles.cardImage;
  if (post.heroImage?.asset) {
    const objectPosition = post.heroImage.hotspot
      ? `${post.heroImage.hotspot.x * 100}% ${post.heroImage.hotspot.y * 100}%`
      : featured
        ? "35% 50%"
        : "50% 50%";

    return (
      <div className={className}>
        <Image
          src={urlForSanityImage(post.heroImage).width(featured ? 1200 : 900).height(featured ? 900 : 506).url()}
          alt={post.heroImage.alt || ""}
          fill
          style={{ objectPosition }}
          sizes={featured ? "(max-width: 760px) 100vw, 54vw" : "(max-width: 760px) 100vw, 50vw"}
          priority={featured}
        />
      </div>
    );
  }

  const editorialArt = getEditorialArt(post.slug);
  return editorialArt ? (
    <div className={className}>
      <Image
        src={editorialArt.cardSrc}
        alt={editorialArt.alt}
        fill
        sizes={featured ? "(max-width: 760px) 100vw, 54vw" : "(max-width: 760px) 100vw, 50vw"}
        priority={featured}
      />
    </div>
  ) : (
    <div className={className}><div className={styles.imageFallback}>FrontierGTM</div></div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPublishedBlogPostsFresh();
  return {
    title: "FrontierGTM Blog | Ideas for the AI frontier",
    description: "Ideas, arguments, and field notes on taking frontier AI, infrastructure, cloud, and developer technology to market.",
    alternates: {
      canonical: "https://www.frontiergtm.ai/blog",
      types: { "application/rss+xml": "https://www.frontiergtm.ai/blog/rss.xml" },
    },
    openGraph: {
      title: "FrontierGTM Blog | Ideas for the AI frontier",
      description: "Ideas, arguments, and field notes on taking frontier AI, infrastructure, cloud, and developer technology to market.",
      url: "https://www.frontiergtm.ai/blog",
      images: [{ url: "https://www.frontiergtm.ai/blog/infrastructure-frontier-social.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "FrontierGTM Blog | Ideas for the AI frontier",
      description: "Ideas, arguments, and field notes on taking frontier AI, infrastructure, cloud, and developer technology to market.",
      images: ["https://www.frontiergtm.ai/blog/infrastructure-frontier-social.jpg"],
    },
    robots: posts.length ? undefined : { index: false, follow: false },
  };
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPostsFresh();
  const featured = posts.find((post) => post.featured) || posts[0];
  const remaining = featured ? posts.filter((post) => post._id !== featured._id) : [];

  return (
    <main className={styles.page}>
      <Header />
      <section className={styles.masthead}>
        <div className={`${styles.shell} ${styles.mastheadInner}`}>
          <div>
            <p className={styles.eyebrow}>The FrontierGTM Blog</p>
            <h1>Ideas for the AI frontier.</h1>
          </div>
          <p className={styles.mastheadDescription}>
            Arguments, field notes, and practical thinking about building markets for AI infrastructure, agents, cloud, and developer technology.
          </p>
        </div>
      </section>

      <section className={styles.postsSection}>
        <div className={styles.shell}>
          {featured ? (
            <>
              <Link className={styles.featuredCard} href={`/blog/${featured.slug}`}>
                <PostImage post={featured} featured />
                <div className={styles.featuredCopy}>
                  <p className={styles.sectionLabel}>Featured essay</p>
                  <div className={styles.meta}><span>{postDate(featured)}</span><span>{featured.author?.name || "FrontierGTM"}</span></div>
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                  <span className={styles.readLink}>Read the essay <span aria-hidden="true">→</span></span>
                </div>
              </Link>
              {remaining.length ? (
                <div className={styles.postGrid}>
                  {remaining.map((post) => (
                    <Link className={styles.postCard} href={`/blog/${post.slug}`} key={post._id}>
                      <PostImage post={post} />
                      <div className={styles.postCardCopy}>
                        <div className={styles.meta}><span>{postDate(post)}</span><span>{post.author?.name || "FrontierGTM"}</span></div>
                        <h2>{post.title}</h2>
                        <p>{post.excerpt}</p>
                        <span className={styles.readLink}>Read <span aria-hidden="true">→</span></span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.sectionLabel}>FrontierGTM</p>
              <h2>The first essay is in the works.</h2>
              <p>The blog is ready. Publishing begins when the first piece is ready to earn attention.</p>
            </div>
          )}
        </div>
      </section>
      <BlogFooter />
    </main>
  );
}
