import Image from "next/image";

export function BlogFooter() {
  return (
    <footer>
      <p>© {new Date().getFullYear()} FrontierGTM</p>
      <div className="footer-links">
        <a href="/blog/rss.xml">RSS</a>
        <a href="mailto:ryan@frontiergtm.ai">ryan@frontiergtm.ai</a>
        <a
          className="footer-social-link"
          href="https://www.linkedin.com/company/frontiergtm/"
          target="_blank"
          rel="noreferrer"
          aria-label="FrontierGTM on LinkedIn"
        >
          <Image src="/linkedin.svg" alt="" width={21} height={21} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
