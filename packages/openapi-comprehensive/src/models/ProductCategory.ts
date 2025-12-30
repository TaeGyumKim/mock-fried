/**
 * Product category enum (comprehensive)
 */
export const ProductCategory = {
  Electronics: 'ELECTRONICS',
  Clothing: 'CLOTHING',
  Books: 'BOOKS',
  HomeGarden: 'HOME_GARDEN',
  Sports: 'SPORTS',
  Toys: 'TOYS',
  Health: 'HEALTH',
  Beauty: 'BEAUTY',
  Automotive: 'AUTOMOTIVE',
  Food: 'FOOD',
  Music: 'MUSIC',
  Movies: 'MOVIES',
  Games: 'GAMES',
  Software: 'SOFTWARE',
  Office: 'OFFICE',
  Pet: 'PET',
  Baby: 'BABY',
  Industrial: 'INDUSTRIAL',
  Art: 'ART',
  Other: 'OTHER',
} as const

export type ProductCategory = typeof ProductCategory[keyof typeof ProductCategory]

export function ProductCategoryFromJSON(json: unknown): ProductCategory {
  return ProductCategoryFromJSONTyped(json)
}

export function ProductCategoryFromJSONTyped(json: unknown): ProductCategory {
  return json as ProductCategory
}

export function ProductCategoryToJSON(value: ProductCategory): string {
  return value
}
