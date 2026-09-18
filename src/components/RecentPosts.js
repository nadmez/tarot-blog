import Link from "next/link";
import { CardsIcon } from "./icons";

const POSTS = [
  {
    slug: "lorem-ipsum-dolor",
    title: "Lorem ipsum dolor sit amet",
    excerpt:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    date: "2026-08-10",
  },
  {
    slug: "consectetur-adipiscing",
    title: "Consectetur adipiscing elit",
    excerpt:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea.",
    date: "2026-07-28",
  },
  {
    slug: "sed-do-eiusmod",
    title: "Sed do eiusmod tempor incididunt",
    excerpt:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.",
    date: "2026-07-15",
  },
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function RecentPosts() {
  return (
    <section
      aria-labelledby="recent-posts-heading"
      className="bg-primary/5 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Blog
          </p>
          <h2
            id="recent-posts-heading"
            className="mt-3 font-heading text-3xl font-semibold text-primary sm:text-4xl"
          >
            Son Yazılar
          </h2>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => (
            <li key={post.slug}>
              <article className="flex h-full flex-col rounded-2xl border border-primary/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Article",
                      headline: post.title,
                      datePublished: post.date,
                      description: post.excerpt,
                    }),
                  }}
                />
                <div
                  className="mb-4 flex h-32 items-center justify-center rounded-xl bg-primary/10"
                  aria-hidden="true"
                >
                  <CardsIcon className="h-10 w-10 text-primary/50" />
                </div>
                <time
                  dateTime={post.date}
                  className="text-xs font-medium uppercase tracking-wide text-accent"
                >
                  {formatDate(post.date)}
                </time>
                <h3 className="mt-2 font-heading text-xl font-semibold text-primary">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/70">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Devamını oku →
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
