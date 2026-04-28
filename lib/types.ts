export type IdentifiedProduct = {
  productType: string;
  brandGuess?: string;
  color?: string;
  styleKeywords: string[];
  searchQuery: string;
};

export type ShoppingResult = {
  title: string;
  price?: string;
  extractedPrice?: number;
  source?: string;
  link: string;
  image?: string;
  reason?: string;
  dealRating?: number;
  cheapTrustRating?: number;
  isLiveResult?: boolean;
};
