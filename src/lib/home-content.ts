// Static storefront content: marketing copy, navigation and the curated
// homepage rows. Products live in the database; this module only names which
// slugs appear in which row, so curation stays reviewable in git.

const unsplash = (photoId: string, width: number) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=${width}`;

export type NavLink = { label: string; href: string };

export type Collection = {
  title: string;
  eyebrow: string;
  href: string;
  image: string;
  alt: string;
};

export const navLinks: NavLink[] = [
  { label: "New In", href: "/new" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Accessories", href: "/accessories" },
  { label: "Gifts", href: "/gifts" },
];

export const hero = {
  eyebrow: "Autumn / Winter",
  title: "The Quiet Season",
  image: unsplash("1662532577856-e8ee8b138a8b", 2400),
  alt: "Model in a red outfit seated against a clear blue sky",
};

export const collections: Collection[] = [
  {
    title: "Women",
    eyebrow: "Ready-to-wear",
    href: "/women",
    image: unsplash("1659522761084-79196b64abe4", 1000),
    alt: "Black-and-white portrait of a model in a sculpted white jacket",
  },
  {
    title: "Men",
    eyebrow: "Tailoring",
    href: "/men",
    image: unsplash("1645035828708-789028bb9782", 1000),
    alt: "Black-and-white portrait of two men in dark tailoring",
  },
  {
    title: "Accessories",
    eyebrow: "Leather goods",
    href: "/accessories",
    image: unsplash("1566534335938-05f1f2949435", 1000),
    alt: "Model in a cream cape and pink trousers carrying a small structured bag",
  },
];

export const newArrivalSlugs = [
  "woven-leather-tote",
  "top-handle-bag-cream",
  "browline-sunglasses",
  "hand-stitched-card-wallet",
];

export const edit = {
  eyebrow: "The Atelier Edit",
  title: "Tailoring, softened",
  body: "Considered cuts in rich, tactile fabrics, designed to move from the studio to the evening and worn season after season.",
  href: "/women",
  cta: "Discover the edit",
  image: unsplash("1580478491436-fd6a937acc9e", 1400),
  alt: "Model in a deep red blazer seated on stone steps",
};

export const bestsellerSlugs = [
  "woven-leather-pump",
  "braided-leather-belt",
  "printed-silk-scarf",
  "cashmere-crew-knit",
];

export const campaign = {
  eyebrow: "Menswear",
  title: "Shadow & Line",
  href: "/men",
  cta: "Shop menswear",
  image: unsplash("1700150662401-9b96a5fedfbb", 2400),
  alt: "Black-and-white portrait of a man in loose dark knitwear",
};

export const services = [
  {
    title: "Complimentary shipping",
    body: "On every order over $200, delivered in signature packaging.",
  },
  {
    title: "Easy returns",
    body: "Return any unworn piece within 30 days, free of charge.",
  },
  {
    title: "Gift wrapping",
    body: "Hand-wrapped with a handwritten note on request.",
  },
  {
    title: "Client service",
    body: "Our advisors are available Monday to Saturday, 9am to 7pm.",
  },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Client Services",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns & exchanges", href: "/returns" },
      { label: "Care guide", href: "/care" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Craftsmanship", href: "/craftsmanship" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Shop",
    links: navLinks,
  },
];

export { formatPrice, type Product } from "@/lib/catalogue";
