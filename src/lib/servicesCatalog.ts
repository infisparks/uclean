import { RATE_ITEMS, RateItem } from './rateData';

export interface CatalogService {
  id: string;
  name: string;
  icon: string;
  rate: string;
  category: string;
  keywords: string;
  isPrimary?: boolean;
}

// 1. The 6 Primary Default Services shown on initial load
export const PRIMARY_SERVICES: CatalogService[] = [
  {
    id: 'Wash & Fold — ₹109/kg',
    name: 'Wash & Fold',
    icon: '🧺',
    rate: '₹109/kg',
    category: 'Laundry & Press',
    keywords: 'wash fold laundry kg everyday clothes regular tshirts shirts pants shorts',
    isPrimary: true,
  },
  {
    id: 'Wash & Iron — ₹149/kg',
    name: 'Wash & Iron',
    icon: '👔',
    rate: '₹149/kg',
    category: 'Laundry & Press',
    keywords: 'wash iron steam pressed laundry kg shirts trousers formals',
    isPrimary: true,
  },
  {
    id: 'Dry Cleaning — from ₹149',
    name: 'Dry Cleaning & Suits',
    icon: '🧥',
    rate: 'From ₹149',
    category: "Men's Wear",
    keywords: 'dry clean suit blazer coat sherwani kurta saree lehenga jacket safari formal',
    isPrimary: true,
  },
  {
    id: 'Home Textiles & Sofa Cleaning',
    name: 'Sofa & Carpet Care',
    icon: '🛋️',
    rate: 'From ₹30/sq.ft',
    category: 'Home Care',
    keywords: 'sofa couch carpet upholstery shampoo rug cushion living room',
    isPrimary: true,
  },
  {
    id: 'Lining Curtain — ₹45/sq. ft.',
    name: 'Curtains (Parda)',
    icon: '🪟',
    rate: '₹45/sq.ft',
    category: 'Home Care',
    keywords: 'curtain parda drape window door sheer lining blackout fabric',
    isPrimary: true,
  },
  {
    id: 'Shoe Spa & Cleaning',
    name: 'Shoe Spa & Leather',
    icon: '👟',
    rate: 'Buy 2 Get 1',
    category: 'Footwear',
    keywords: 'shoe sneakers boots leather footwear spa sports white shoes running',
    isPrimary: true,
  },
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
