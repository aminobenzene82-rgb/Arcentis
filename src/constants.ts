/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Watch {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  badge?: string;
  category: string;
}

export const WATCHES: Watch[] = [
  {
    id: "1",
    name: "Royal Chronograph Gold",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop",
    price: 12500,
    originalPrice: 15500,
    rating: 4.9,
    reviews: 124,
    badge: "Bestseller",
    category: "Luxury"
  },
  {
    id: "2",
    name: "Classic Silver Edition",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop",
    price: 8900,
    originalPrice: 11000,
    rating: 4.8,
    reviews: 89,
    badge: "New Arrival",
    category: "Classic"
  }
];

export const REVIEWS = [
  { name: "Redowan Ahmed", location: "Gulshan", text: "Premium quality watch! Highly recommended.", rating: 5, lang: "En" },
  { name: "Sultana Farhana", location: "Banani", text: "Looks very classy and minimal. Loved it!", rating: 5, lang: "En" },
  { name: "Nafis Fuad", location: "Dhanmondi", text: "Fast delivery in Gulshan. Worth every taka.", rating: 4, lang: "En" },
  { name: "Tanvir Hasan", location: "Baridhara", text: "Darun quality, chobi thekeo beshi shundor.", rating: 5, lang: "Bn" },
  { name: "Maliha Islam", location: "Uttara", text: "Gifted my husband and he loved it immediately.", rating: 5, lang: "En" }
];

export const SALES_ALERTS = [
  { name: "Redowan", location: "Gulshan", product: "Royal Chronograph Gold" },
  { name: "Farhan", location: "Banani", product: "Classic Silver Edition" },
  { name: "Nafis", location: "Dhanmondi", product: "Royal Chronograph Gold" },
  { name: "Habib", location: "Baridhara", product: "Classic Silver Edition" },
  { name: "Anik", location: "Uttara", product: "Classic Silver Edition" },
  { name: "Eti", location: "Gulshan", product: "Royal Chronograph Gold" }
];
