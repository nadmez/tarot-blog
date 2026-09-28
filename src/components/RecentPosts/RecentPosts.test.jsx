import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import RecentPosts from ".";

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

test("renders recent posts section with cards and structured data", () => {
  const { container } = render(<RecentPosts />);

  expect(
    screen.getByRole("heading", { level: 2, name: "Son Yazılar" })
  ).toHaveAttribute("id", "recent-posts-heading");

  const articles = screen.getAllByRole("article");
  expect(articles).toHaveLength(POSTS.length);

  const jsonLdScripts = container.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  expect(jsonLdScripts).toHaveLength(POSTS.length);

  POSTS.forEach((post, index) => {
    const article = articles[index];
    const articleScope = within(article);

    expect(
      articleScope.getByRole("heading", { level: 3, name: post.title })
    ).toBeInTheDocument();
    expect(articleScope.getByText(post.excerpt)).toBeInTheDocument();

    const titleLink = articleScope.getByRole("link", { name: post.title });
    expect(titleLink).toHaveAttribute("href", `/blog/${post.slug}`);

    const readMore = articleScope.getByRole("link", { name: /Devamını oku/i });
    expect(readMore).toHaveAttribute("href", `/blog/${post.slug}`);

    const timeEl = articleScope.getByText(formatDate(post.date));
    expect(timeEl.tagName).toBe("TIME");
    expect(timeEl).toHaveAttribute("dateTime", post.date);

    const ld = JSON.parse(jsonLdScripts[index].textContent);
    expect(ld["@type"]).toBe("Article");
    expect(ld.headline).toBe(post.title);
  });
});
