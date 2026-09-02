export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  productCode?: string;
  price: number;
  primaryImageUrl?: string;
  image: string;
  imageAlt: string;
  quantity: number;
  available?: boolean;
}


