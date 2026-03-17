export default function getVariantId(search: string): string {
  const variantId = search.match(/\?variantId=(.*)/);
  return variantId && variantId[1] ? variantId[1].toString() : '';
}
