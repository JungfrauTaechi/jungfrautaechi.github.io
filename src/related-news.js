export function relatedNews(items, article, limit = 4) {
  const candidates = items.filter((item) => item.slug !== article.slug);
  const ordered = [
    ...candidates.filter((item) => item.category === article.category),
    ...candidates.filter((item) => item.category !== article.category),
  ];
  return [...new Map(ordered.map((item) => [item.slug, item])).values()].slice(0, limit);
}
