import { RATE_ITEMS, RateItem } from './rateData';

export interface CatalogService {
  id: string;
  name: string;
  icon: string;
  rate: string;
  category: string;
  keywords: string;
  badge?: string;
  subtitle?: string;
  isPrimary?: boolean;
}

// Helper: Extract numeric price from rate string (e.g. 'From ₹119/item' -> 119)
export function extractBasePrice(rateStr?: string): number {
  if (!rateStr) return 0;
  const match = rateStr.match(/₹\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Helper: Check if service ID or Name matches target string flexibly
export function isServiceMatch(serviceIdOrName: string, target: string): boolean {
  if (!serviceIdOrName || !target) return false;
  const a = serviceIdOrName.toLowerCase().trim();
  const b = target.toLowerCase().trim();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const cleanA = a.replace(/[^a-z0-9]/g, '');
  const cleanB = b.replace(/[^a-z0-9]/g, '');
  if (cleanA && cleanB && (cleanA.includes(cleanB) || cleanB.includes(cleanA))) return true;

  // Match key phrase tokens (e.g. "Home Textiles & Upholstery Care" matches "Home Textiles & Sofa Cleaning")
  const tokensA = a.split(/[\s&,/–—\(\)]+/).filter((w) => w.length >= 4);
  const tokensB = b.split(/[\s&,/–—\(\)]+/).filter((w) => w.length >= 4);
  const overlap = tokensA.filter((w) => tokensB.includes(w));
  if (overlap.length >= 2) return true;
  if (overlap.length === 1 && (tokensA.length === 1 || tokensB.length === 1)) return true;

  return false;
}

// Helper: Given any service string, resolve its clean Title, Rate badge, Icon, and base price
export function getServiceDisplay(serviceNameOrId: string): { title: string; rate: string; icon: string; basePrice: number } {
  let title = (serviceNameOrId || '').trim();
  let rate = '';
  let icon = '🧺';

  // Check if string already contains rate like "Women's Ethnic & Saree — From ₹69/item"
  if (title.includes('—')) {
    const parts = title.split('—').map((s) => s.trim());
    title = parts[0];
    rate = parts[1] || '';
  }

  // Look up in PRIMARY_SERVICES or ALL_SERVICES_CATALOG
  const match =
    PRIMARY_SERVICES.find(
      (s) => isServiceMatch(s.id, title) || isServiceMatch(s.name, title)
    ) ||
    ALL_SERVICES_CATALOG.find(
      (s) => isServiceMatch(s.id, title) || isServiceMatch(s.name, title)
    );

  if (match) {
    title = match.name;
    if (!rate) rate = match.rate;
    icon = match.icon;
  }

  const basePrice = extractBasePrice(rate);

  return { title, rate, icon, basePrice };
}

// 1. The Primary Commercial Store Categories (Matching Homepage Grid 1:1)
export const PRIMARY_SERVICES: CatalogService[] = [
  {
    id: "Men's Suits & Ethnic",
    name: "Men's Suits & Ethnic",
    icon: '👔',
    rate: 'From ₹119/item',
    category: "Men's Wear",
    keywords: "men suits blazer ethnic sherwani tuxedo kurta dhoti coat indowestern wedding dry cleaning",
    badge: '⭐ Executive Care',
    subtitle: 'Suits, blazers & sherwanis',
    isPrimary: true,
  },
  {
    id: "Women's Ethnic & Saree Spa",
    name: "Women's Ethnic & Saree",
    icon: '🥻',
    rate: 'From ₹69/item',
    category: "Women's Ethnic",
    keywords: "women ethnic saree spa lehenga choli silk banarasi dupatta bridal festive dry cleaning",
    badge: '🥻 Silk & Zari Safe',
    subtitle: 'Sarees, lehengas & suits',
    isPrimary: true,
  },
  {
    id: 'Winterwear & Leather Care',
    name: 'Winterwear & Leather Care',
    icon: '🧥',
    rate: 'From ₹99/item',
    category: 'Winter & Leather',
    keywords: 'winterwear leather jacket coat sweater cardigan puffer fur overcoat dry cleaning',
    badge: '🧥 Gentle Cycle',
    subtitle: 'Jackets, sweaters & coats',
    isPrimary: true,
  },
  {
    id: 'Shirts, Pants & Steam Press',
    name: 'Shirts, Pants & Press',
    icon: '👕',
    rate: 'From ₹25/item',
    category: 'Laundry & Press',
    keywords: 'shirts pants steam press trousers jeans daily wear office charak creasing iron',
    badge: '💼 Daily Workwear',
    subtitle: 'Crisp charak steam crease',
    isPrimary: true,
  },
  {
    id: 'Wash & Fold Laundry',
    name: 'Wash & Fold Laundry',
    icon: '🧺',
    rate: '₹109/kg',
    category: 'Laundry & Press',
    keywords: 'wash fold laundry kg everyday clothes regular tshirts shirts pants shorts',
    badge: '🔥 Most Popular',
    subtitle: '~5-6 clothes/kg (avg ₹18/cloth)',
    isPrimary: true,
  },
  {
    id: 'Wash & Steam Iron',
    name: 'Wash & Steam Iron',
    icon: '👔',
    rate: '₹149/kg',
    category: 'Laundry & Press',
    keywords: 'wash iron steam pressed laundry kg shirts trousers formals',
    badge: '⭐ Ready to Wear',
    subtitle: 'Washed, ironed & folded',
    isPrimary: true,
  },
  {
    id: 'Footwear & Designer Shoe Spa',
    name: 'Footwear & Shoe Spa',
    icon: '👟',
    rate: 'From ₹349/pair',
    category: 'Footwear',
    keywords: 'shoe sneakers boots leather footwear spa sports white shoes restoration',
    badge: '👟 Deep Sanitized',
    subtitle: 'Sneakers, sports & leather',
    isPrimary: true,
  },
  {
    id: 'Home Textiles & Sofa Cleaning',
    name: 'Sofa & Carpet Care',
    icon: '🛋️',
    rate: 'From ₹30/sq.ft',
    category: 'Home Care',
    keywords: 'sofa couch carpet upholstery shampoo rug cushion living room',
    badge: '🛋️ Foam Deep Clean',
    subtitle: 'Carpets, sofas & mattresses',
    isPrimary: true,
  },
  {
    id: 'Lining Curtain — ₹45/sq. ft.',
    name: 'Curtains (Parda)',
    icon: '🪟',
    rate: '₹45/sq.ft',
    category: 'Home Care',
    keywords: 'curtain parda drape window door sheer lining blackout fabric',
    badge: '🪟 Free Unhook & Hang',
    subtitle: 'Steam refresh & dust extraction',
    isPrimary: true,
  },
  {
    id: 'Shawls, Pashmina & Ties',
    name: 'Shawls & Accessories',
    icon: '🧣',
    rate: 'From ₹25/item',
    category: 'Accessories',
    keywords: 'shawl pashmina toosh lohi muffler woolen cashmere scarf tie',
    badge: '🧣 Pure Pashmina Safe',
    subtitle: 'Ties, shawls & stoles',
    isPrimary: true,
  },
];

// 1.1 Category-Specific Service Collections with Human Psychology Pricing & Ranking (Cheap On Top)
export const WASH_FOLD_SERVICES: CatalogService[] = [
  {
    id: 'Undergarments & Socks — from ₹19',
    name: 'Undergarments & Socks',
    icon: '🧦',
    rate: 'From ₹19',
    category: 'Wash & Fold',
    keywords: 'undergarments underwear socks innerwear vests handkerchiefs',
    badge: '🧴 Lowest Price',
    subtitle: 'Antibacterial hygienic wash',
    isPrimary: true,
  },
  {
    id: 'Daily Wear (T-Shirts & Tops) — from ₹25',
    name: 'Daily T-Shirts & Tops',
    icon: '👕',
    rate: 'From ₹25',
    category: 'Wash & Fold',
    keywords: 'tshirts shirts tops polos casual daily wear cotton',
    badge: '⚡ Most Worn Daily',
    subtitle: 'Light wash & neat fold',
    isPrimary: true,
  },
  {
    id: 'Office Shirts & Trousers — from ₹25',
    name: 'Office Shirts & Trousers',
    icon: '👔',
    rate: 'From ₹25',
    category: 'Wash & Fold',
    keywords: 'shirts trousers formal pants jeans office regular wear',
    badge: '💼 Daily Workwear',
    subtitle: 'Wash with crisp charak press',
    isPrimary: true,
  },
  {
    id: 'Bedsheets, Linens & Towels — from ₹49',
    name: 'Bedsheets & Bath Towels',
    icon: '🛏️',
    rate: 'From ₹49',
    category: 'Wash & Fold',
    keywords: 'bedsheet bed cover pillow covers bath towels napkins linens',
    badge: '🏠 Home Essentials',
    subtitle: 'Fresh, soft & hygienic',
    isPrimary: true,
  },
  {
    id: 'Wash & Fold Laundry',
    name: 'Wash & Fold Laundry',
    icon: '🧺',
    rate: '₹109/kg',
    category: 'Wash & Fold',
    keywords: 'wash fold laundry kg everyday clothes regular tshirts shirts pants shorts',
    badge: '🔥 Most Popular (Per Kg)',
    subtitle: '~5-6 daily clothes/kg (approx ₹18/cloth)',
    isPrimary: true,
  },
  {
    id: 'Wash & Steam Iron',
    name: 'Wash & Steam Iron',
    icon: '✨',
    rate: '₹149/kg',
    category: 'Wash & Fold',
    keywords: 'wash iron steam pressed laundry kg shirts trousers formals',
    badge: '⭐ Ready-to-Wear',
    subtitle: 'Washed, ironed & folded',
    isPrimary: true,
  },
];

export const WASH_IRON_SERVICES: CatalogService[] = [
  {
    id: 'Wash & Steam Iron',
    name: 'Wash & Steam Iron',
    icon: '👔',
    rate: '₹149/kg',
    category: 'Wash & Iron',
    keywords: 'wash iron steam pressed laundry kg shirts trousers formals',
    badge: '🔥 Best Value',
    subtitle: 'Wash + steam press by kg',
    isPrimary: true,
  },
  {
    id: 'Steam Press Only — from ₹25',
    name: 'Steam Ironing (Charak)',
    icon: '💨',
    rate: 'From ₹25',
    category: 'Wash & Iron',
    keywords: 'steam press iron charak creasing wrinkle free shirts pants',
    badge: '⚡ Wrinkle-Free',
    subtitle: 'Sharp professional creases',
    isPrimary: true,
  },
  {
    id: 'Office Shirts & Trousers — from ₹25',
    name: 'Shirts & Trousers Press',
    icon: '👕',
    rate: 'From ₹25',
    category: 'Wash & Iron',
    keywords: 'shirts trousers pants daily office press',
    badge: '💼 Daily Workwear',
    subtitle: 'Crisp hanger or fold',
    isPrimary: true,
  },
  {
    id: 'Wash & Fold Laundry',
    name: 'Wash & Fold Laundry',
    icon: '🧺',
    rate: '₹109/kg',
    category: 'Wash & Iron',
    keywords: 'wash fold laundry kg regular clothes',
    badge: '🧺 Economy Option',
    subtitle: 'Clean everyday laundry',
    isPrimary: true,
  },
  {
    id: 'Saree & Kurta Steam Press — from ₹49',
    name: 'Sarees & Kurta Press',
    icon: '🥻',
    rate: 'From ₹49',
    category: 'Wash & Iron',
    keywords: 'saree kurta pajama steam press ethnic silk roll press',
    badge: '✨ Roll Press',
    subtitle: 'Gentle fabric care',
    isPrimary: true,
  },
  {
    id: 'Blazer & Coat Steam Press — from ₹99',
    name: 'Blazer & Coat Press',
    icon: '🧥',
    rate: 'From ₹99',
    category: 'Wash & Iron',
    keywords: 'blazer suit jacket coat steam press formals',
    badge: '👔 Executive Formals',
    subtitle: '3D mannequin steam finish',
    isPrimary: true,
  },
];

export const DRY_CLEANING_SERVICES: CatalogService[] = [
  {
    id: "Men's Suits & Ethnic",
    name: "Men's Suits & Ethnic",
    icon: '👔',
    rate: 'From ₹119/item',
    category: 'Dry Cleaning',
    keywords: 'men suits blazer ethnic sherwani tuxedo kurta dhoti coat',
    badge: '⭐ Executive Care',
    subtitle: 'Solvent dry clean & steam form',
    isPrimary: true,
  },
  {
    id: "Women's Ethnic & Saree Spa",
    name: "Women's Ethnic & Saree",
    icon: '🥻',
    rate: 'From ₹69/item',
    category: 'Dry Cleaning',
    keywords: 'women ethnic saree spa lehenga choli silk banarasi dupatta',
    badge: '🥻 Silk & Zari Safe',
    subtitle: 'Color-preserving gentle spa',
    isPrimary: true,
  },
  {
    id: 'Winterwear & Leather Care',
    name: 'Winterwear & Jackets',
    icon: '🧥',
    rate: 'From ₹99/item',
    category: 'Dry Cleaning',
    keywords: 'winterwear leather jacket coat sweater cardigan puffer fur',
    badge: '🧥 Deep De-pilling',
    subtitle: 'Odor & lint removal',
    isPrimary: true,
  },
  {
    id: 'Designer Gowns & Dresses — from ₹299',
    name: 'Designer Gowns & Dresses',
    icon: '✨',
    rate: 'From ₹299',
    category: 'Dry Cleaning',
    keywords: 'gown dress western maxi party evening wear cocktail dress',
    badge: '💃 Delicate Beaded',
    subtitle: 'Embellishment protection',
    isPrimary: true,
  },
  {
    id: 'Footwear & Designer Shoe Spa',
    name: 'Footwear & Shoe Spa',
    icon: '👟',
    rate: 'From ₹349/pair',
    category: 'Dry Cleaning',
    keywords: 'shoe sneakers boots leather footwear spa sports white shoes',
    badge: '👟 Soles & Upper Restored',
    subtitle: 'Deep cleaning & deodorizing',
    isPrimary: true,
  },
  {
    id: 'Shawls, Pashmina & Ties',
    name: 'Shawls & Pashmina Spa',
    icon: '🧣',
    rate: 'From ₹25/item',
    category: 'Dry Cleaning',
    keywords: 'shawl pashmina toosh lohi muffler woolen cashmere scarf tie',
    badge: '🧣 Pure Cashmere Safe',
    subtitle: 'Soft conditioning cycle',
    isPrimary: true,
  },
];

export const HOME_TEXTILES_SERVICES: CatalogService[] = [
  {
    id: 'Lining Curtain — ₹45/sq. ft.',
    name: 'Curtains & Drapes (Parda)',
    icon: '🪟',
    rate: 'From ₹45/sq.ft',
    category: 'Home Textiles',
    keywords: 'curtain parda drape window door sheer lining blackout fabric',
    badge: '🪟 Free Unhook & Hang',
    subtitle: 'Dust & allergen deep removal',
    isPrimary: true,
  },
  {
    id: 'Carpet & Rug Rotary Shampooing — ₹30/sq.ft',
    name: 'Carpet & Rug Washing',
    icon: '🧼',
    rate: 'From ₹30/sq.ft',
    category: 'Home Textiles',
    keywords: 'carpet rug floor mat kashmiri rotary shampoo deep suction',
    badge: '🧼 Rotary Injection',
    subtitle: 'Stain extraction & quick dry',
    isPrimary: true,
  },
  {
    id: 'Home Textiles & Sofa Cleaning',
    name: 'Sofa & Upholstery Care',
    icon: '🛋️',
    rate: 'From ₹199/seat',
    category: 'Home Textiles',
    keywords: 'sofa couch carpet upholstery shampoo rug cushion living room',
    badge: '🛋️ Foam Deep Clean',
    subtitle: 'Fabric & leather upholstery',
    isPrimary: true,
  },
  {
    id: 'Heavy Blankets & Kambal Washing — from ₹249',
    name: 'Blankets & Heavy Kambal',
    icon: '🧶',
    rate: 'From ₹249',
    category: 'Home Textiles',
    keywords: 'blanket kambal duvet comforter heavy winter rajai mink',
    badge: '🧶 100% Germ-Free',
    subtitle: 'Fluffing & hygienic sanitize',
    isPrimary: true,
  },
  {
    id: 'Mattress & Quilt Steam Sanitization — from ₹199',
    name: 'Mattress & Quilt Sanitization',
    icon: '🛏️',
    rate: 'From ₹199',
    category: 'Home Textiles',
    keywords: 'mattress quilt pillow steam sanitization anti allergen bed bug bacteria',
    badge: '🛏️ Anti-Dust Mite',
    subtitle: 'High-temperature steam kill',
    isPrimary: true,
  },
  {
    id: 'Bedsheets, Linens & Towels — from ₹49',
    name: 'Bedsheets & Pillow Covers',
    icon: '🏠',
    rate: 'From ₹49',
    category: 'Home Textiles',
    keywords: 'bedsheet linens bed cover pillow bath towel',
    badge: '✨ Crisp & Clean',
    subtitle: 'Fresh fragrant finish',
    isPrimary: true,
  },
];

export interface OrderCategoryTab {
  id: string;
  label: string;
  icon: string;
  services: CatalogService[];
}

export const ORDER_CATEGORIES: OrderCategoryTab[] = [
  { id: 'wash-fold', label: 'Wash & Fold', icon: '🧺', services: WASH_FOLD_SERVICES },
  { id: 'wash-iron', label: 'Wash & Iron', icon: '👔', services: WASH_IRON_SERVICES },
  { id: 'dry-cleaning', label: 'Dry Cleaning', icon: '✨', services: DRY_CLEANING_SERVICES },
  { id: 'home-textiles', label: 'Home Textiles', icon: '🛋️', services: HOME_TEXTILES_SERVICES },
];

// 2. High-Demand Specialized Store Categories & Services
const SPECIALIZED_SERVICES: CatalogService[] = [
  // Laundry & Ironing
  {
    id: 'Steam Press Only — from ₹25',
    name: 'Steam Ironing (Charak Press)',
    icon: '💨',
    rate: 'From ₹25',
    category: 'Laundry & Press',
    keywords: 'steam press iron charak creasing wrinkle free shirts pants',
  },
  {
    id: 'Daily Wear (Shirts & Trousers) — from ₹25',
    name: 'Shirts & Trousers Care',
    icon: '👕',
    rate: 'From ₹25',
    category: 'Laundry & Press',
    keywords: 'shirts trousers jeans pants dailywear office wear tshirts',
  },

  // Women's Ethnic & Luxury
  {
    id: "Silk Saree & Banarasi Spa — from ₹149",
    name: 'Silk Sarees & Banarasi',
    icon: '🥻',
    rate: 'From ₹149',
    category: "Women's Ethnic",
    keywords: 'saree silk banarasi zari paithani kanjivaram chiffon georgette women ethnic',
  },
  {
    id: 'Bridal Lehenga & Heavy Choli — from ₹499',
    name: 'Bridal Lehenga & Gowns',
    icon: '💃',
    rate: 'From ₹499',
    category: "Women's Ethnic",
    keywords: 'lehenga choli bridal wedding ghagra gown festive heavy stone work',
  },
  {
    id: 'Dupatta, Stoles & Chunni — from ₹69',
    name: 'Dupatta & Stoles Care',
    icon: '🧣',
    rate: 'From ₹69',
    category: "Women's Ethnic",
    keywords: 'dupatta chunni stole scarf organza net embroidered',
  },
  {
    id: 'Designer Gowns & Western Dresses — from ₹299',
    name: 'Designer Gowns & Dresses',
    icon: '✨',
    rate: 'From ₹299',
    category: "Women's Ethnic",
    keywords: 'gown dress western maxi party evening wear cocktail dress',
  },

  // Men's Wear & Ethnic
  {
    id: 'Sherwani & Kurta Pajama — from ₹249',
    name: 'Sherwani & Kurta Pajama',
    icon: '👑',
    rate: 'From ₹249',
    category: "Men's Wear",
    keywords: 'sherwani kurta pajama pyjama dhoti achkan indo western wedding groom',
  },
  {
    id: 'Leather & Suede Jacket — from ₹799',
    name: 'Leather Jacket & Suede Care',
    icon: '🏍️',
    rate: 'From ₹799',
    category: "Winter & Leather",
    keywords: 'jacket leather suede biker pure leather conditioning restoration',
  },
  {
    id: 'Winter Puffer & Faux Fur Coats — from ₹299',
    name: 'Winterwear & Puffer Jackets',
    icon: '⛷️',
    rate: 'From ₹299',
    category: "Winter & Leather",
    keywords: 'jacket puffer faux fur winter heavy coat parka cardigan sweater jumper',
  },
  {
    id: 'Woolen Sweaters & Overcoats — from ₹199',
    name: 'Sweaters & Woolen Overcoats',
    icon: '🧶',
    rate: 'From ₹199',
    category: "Winter & Leather",
    keywords: 'sweater woolen overcoat cardigan thermal pullover trench coat',
  },

  // Home Care & Sanitization
  {
    id: 'Mattress & Quilt Steam Sanitization — from ₹199',
    name: 'Mattress & Quilt Sanitization',
    icon: '🛏️',
    rate: 'From ₹199',
    category: 'Home Care',
    keywords: 'mattress quilt pillow steam sanitization anti allergen bed bug bacteria',
  },
  {
    id: 'Heavy Blankets & Kambal Washing — from ₹249',
    name: 'Blankets & Heavy Kambal',
    icon: '🧶',
    rate: 'From ₹249',
    category: 'Home Care',
    keywords: 'blanket kambal duvet comforter heavy winter rajai mink',
  },
  {
    id: 'Carpet & Rug Rotary Shampooing — ₹30/sq.ft',
    name: 'Carpet & Rug Washing',
    icon: '🧼',
    rate: '₹30/sq.ft',
    category: 'Home Care',
    keywords: 'carpet rug floor mat kashmiri rotary shampoo deep suction',
  },

  // Footwear & Accessories
  {
    id: 'Designer Sneakers & Sports Shoe Spa — ₹349',
    name: 'Designer Sneakers & Shoe Spa',
    icon: '👟',
    rate: 'From ₹349',
    category: 'Footwear',
    keywords: 'sneakers sports shoes nike adidas puma jordan canvas white sole shoe spa',
  },
  {
    id: 'Formal Leather Shoes & Boots — from ₹399',
    name: 'Formal Leather Shoes & Boots',
    icon: '👞',
    rate: 'From ₹399',
    category: 'Footwear',
    keywords: 'leather shoes formal boots oxfords brogues polishing conditioning',
  },
  {
    id: 'Shawls, Pashmina & Mufflers — from ₹99',
    name: 'Pashmina Shawls & Mufflers',
    icon: '🧣',
    rate: 'From ₹99',
    category: 'Accessories',
    keywords: 'shawl pashmina toosh lohi muffler woolen cashmere scarf',
  },
  {
    id: 'Caps, Ties & Belts Spa — from ₹49',
    name: 'Caps, Ties & Belts Care',
    icon: '🎩',
    rate: 'From ₹49',
    category: 'Accessories',
    keywords: 'cap tie belt pocket square turban handkerchief leather belt accessories',
  },
];

// 3. Map RATE_ITEMS (90 garment-level items) into individual searchable catalog services
const GARMENT_SERVICES: CatalogService[] = RATE_ITEMS.map((item: RateItem) => {
  let category = 'Men\'s Wear';
  if (item.categoryKey === 'women-ethnic' || item.categoryKey === 'women-coats' || item.categoryKey === 'women-accessories') {
    category = "Women's Ethnic";
  } else if (item.categoryKey === 'men-winter') {
    category = 'Winter & Leather';
  } else if (item.categoryKey === 'footwear') {
    category = 'Footwear';
  } else if (item.categoryKey === 'men-accessories') {
    category = 'Accessories';
  } else if (item.categoryKey === 'men-daily') {
    category = 'Laundry & Press';
  }

  return {
    id: `${item.name} — ₹${item.price}`,
    name: item.name,
    icon: item.icon || '👔',
    rate: `₹${item.price}`,
    category,
    keywords: `${item.name} ${item.categoryName} ${category} ${item.gender || ''}`.toLowerCase(),
  };
});

// Master Full Catalog (Combining Primary, Specialized Categories, and Individual Garments without duplicates)
const existingIds = new Set<string>();
export const ALL_SERVICES_CATALOG: CatalogService[] = [];

// Add Primary first
for (const item of PRIMARY_SERVICES) {
  if (!existingIds.has(item.id)) {
    existingIds.add(item.id);
    ALL_SERVICES_CATALOG.push(item);
  }
}

// Add Specialized second
for (const item of SPECIALIZED_SERVICES) {
  if (!existingIds.has(item.id)) {
    existingIds.add(item.id);
    ALL_SERVICES_CATALOG.push(item);
  }
}

// Add Garments third
for (const item of GARMENT_SERVICES) {
  if (!existingIds.has(item.id)) {
    existingIds.add(item.id);
    ALL_SERVICES_CATALOG.push(item);
  }
}

// Category filter tabs for the modal
export const CATALOG_CATEGORIES = [
  'All',
  'Laundry & Press',
  "Men's Wear",
  "Women's Ethnic",
  'Winter & Leather',
  'Home Care',
  'Footwear',
  'Accessories',
];

/**
 * Live search utility matching multi-word queries across name, category, rate, and keywords
 */
export function searchCatalog(query: string, categoryFilter: string = 'All'): CatalogService[] {
  const clean = (query || '').toLowerCase().trim();
  const tokens = clean ? clean.split(/\s+/) : [];

  return ALL_SERVICES_CATALOG.filter((srv) => {
    // 1. Category check
    if (categoryFilter !== 'All' && srv.category !== categoryFilter) {
      return false;
    }

    // 2. Query check
    if (!tokens.length) return true;

    const searchableText = `${srv.name} ${srv.category} ${srv.rate} ${srv.keywords}`.toLowerCase();
    return tokens.every((token) => searchableText.includes(token));
  });
}
