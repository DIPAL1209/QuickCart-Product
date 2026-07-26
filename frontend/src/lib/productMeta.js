// Deterministic mock rating/badge/discount generator based on product id
// (deterministic so no hydration mismatch between server & client)
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProductMeta(id, price) {
  const hash = hashCode(id);
  const rating = (3.5 + ((hash % 15) / 10)).toFixed(1);
  const reviewCount = 20 + (hash % 480);
  const hasDiscount = hash % 3 === 0;
  const discountPercent = hasDiscount ? 10 + (hash % 30) : 0;
  const mrp = hasDiscount ? Math.round(price / (1 - discountPercent / 100)) : null;

  const badgeTypes = ['Bestseller', 'New', null, 'Trending'];
  const badge = badgeTypes[hash % 4];

  return { rating, reviewCount, discountPercent, mrp, badge };
}