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

// Helper: Check if service ID or Name matches target string accurately
export function isServiceMatch(serviceIdOrName: string, target: string): boolean {
  if (!serviceIdOrName || !target) return false;
  const a = serviceIdOrName.toLowerCase().trim();
  const b = target.toLowerCase().trim();
  if (a === b) return true;

  // Clean alphanumeric comparison
  const cleanA = a.replace(/[^a-z0-9]/g, '');
  const cleanB = b.replace(/[^a-z0-9]/g, '');
  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;

  // Distinctive keywords that MUST NOT cross-match between different items
  const distinctKeywords = [
    'tshirt',
    'tshirts',
    'trouser',
    'trousers',
    'suit',
    'suits',
    'saree',
    'sarees',
    'lehenga',
    'curtain',
    'curtains',
    'carpet',
    'carpets',
    'shoe',
    'shoes',
    'boot',
    'boots',
    'sofa',
    'quilt',
    'blanket',
    'kambal',
    'mattress',
    'undergarment',
    'undergarments',
    'socks',
    'iron',
    'fold',
    'press',
    'jeans',
    'kurti',
    'kurtis',
    'kurta',
    'gym',
    'activewear',
    'towel',
    'towels',
    'blazer',
    'jacket',
    'leather',
    'pashmina',
    'shawl',
    'comforter',
    'chair',
    'pillow',
    'bedsheet',
    'cushion',
    'sherwani',
    'gown',
    'dohar',
    'car',
  ];
  for (const kw of distinctKeywords) {
    const inA = cleanA.includes(kw);
    const inB = cleanB.includes(kw);
    if (inA !== inB) {
      // One has the distinctive keyword and the other doesn't, so they NEVER match!
      return false;
    }
  }

  // Exact substring match only if clean length is reasonably close (e.g. "washfold" in "washfoldlaundry")
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) {
    return true;
  }

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

// 1.1 Category-Specific Service Collections with Human Psychology Pricing & Ranking (Most-used & Cheap On Top)
export const WASH_FOLD_SERVICES: CatalogService[] = [
  {
    id: 'daily-tshirts-tops',
    name: 'Daily T-Shirts & Polos',
    icon: '👕',
    rate: 'From ₹25',
    category: 'Wash & Fold',
    keywords: 'tshirts tshirt tops polos casual daily wear cotton wash and fold',
    isPrimary: true,
  },
  {
    id: 'office-shirts-trousers',
    name: 'Office Shirts & Trousers',
    icon: '👔',
    rate: 'From ₹25',
    category: 'Wash & Fold',
    keywords: 'shirts trousers formal pants office regular wear wash and fold',
    isPrimary: true,
  },
  {
    id: 'undergarments-socks',
    name: 'Undergarments & Socks',
    icon: '🧦',
    rate: 'From ₹19',
    category: 'Wash & Fold',
    keywords: 'undergarments underwear socks innerwear vests handkerchiefs',
    isPrimary: true,
  },
  {
    id: 'jeans-denims-shorts',
    name: 'Jeans, Denims & Shorts',
    icon: '👖',
    rate: 'From ₹35',
    category: 'Wash & Fold',
    keywords: 'jeans denims shorts pants denim bermudas capris wash and fold',
    isPrimary: true,
  },
  {
    id: 'kurtis-daily-wear',
    name: 'Kurtis & Daily Wear',
    icon: '🥻',
    rate: 'From ₹29',
    category: 'Wash & Fold',
    keywords: 'kurtis kurti salwar suit dupatta daily ethnic wash and fold',
    isPrimary: true,
  },
  {
    id: 'gym-activewear',
    name: 'Gym Wear & Track Pants',
    icon: '🏃',
    rate: 'From ₹25',
    category: 'Wash & Fold',
    keywords: 'gym activewear track pants tights sports shorts jerseys wash and fold',
    isPrimary: true,
  },
  {
    id: 'towels-pillow-covers',
    name: 'Towels & Pillow Covers',
    icon: '🧖',
    rate: 'From ₹19',
    category: 'Wash & Fold',
    keywords: 'towels bath towel hand towel pillow covers napkins wash and fold',
    isPrimary: true,
  },
  {
    id: 'bedsheets-bath-towels',
    name: 'Bedsheets & Bath Linen',
    icon: '🛏️',
    rate: 'From ₹49',
    category: 'Wash & Fold',
    keywords: 'bedsheet bedsheets bed cover bath sheets linens wash and fold',
    isPrimary: true,
  },
  {
    id: 'dohar-light-blankets',
    name: 'Dohar & Light Quilts',
    icon: '🧶',
    rate: 'From ₹79',
    category: 'Wash & Fold',
    keywords: 'dohar light blanket quilt cover summer dohar wash and fold',
    isPrimary: true,
  },
  {
    id: 'wash-fold-laundry',
    name: 'Wash & Fold Laundry',
    icon: '🧺',
    rate: '₹109/kg',
    category: 'Wash & Fold',
    keywords: 'wash fold laundry kg everyday clothes regular per kg weight bulk',
    isPrimary: true,
  },
  {
    id: 'wash-steam-iron',
    name: 'Wash & Steam Iron',
    icon: '✨',
    rate: '₹149/kg',
    category: 'Wash & Fold',
    keywords: 'wash iron steam pressed laundry kg shirts trousers formals bulk',
    isPrimary: true,
  },
];

export const WASH_IRON_SERVICES: CatalogService[] = [
  {
    id: 'office-shirts-press',
    name: 'Office Shirts Press',
    icon: '👔',
    rate: 'From ₹25',
    category: 'Wash & Iron',
    keywords: 'shirts formal shirts office steam press charak creasing',
    isPrimary: true,
  },
  {
    id: 'trousers-pants-press',
    name: 'Trousers & Pants Press',
    icon: '👖',
    rate: 'From ₹25',
    category: 'Wash & Iron',
    keywords: 'trousers pants formals chinos creasing steam press',
    isPrimary: true,
  },
  {
    id: 'daily-tshirts-press',
    name: 'T-Shirts & Polos Press',
    icon: '👕',
    rate: 'From ₹25',
    category: 'Wash & Iron',
    keywords: 'tshirts polo casual wear steam press wrinkle free',
    isPrimary: true,
  },
  {
    id: 'jeans-denims-press',
    name: 'Jeans & Denims Press',
    icon: '👖',
    rate: 'From ₹30',
    category: 'Wash & Iron',
    keywords: 'jeans denims heavy press wrinkle free pants',
    isPrimary: true,
  },
  {
    id: 'kurti-salwar-press',
    name: 'Kurti & Salwar Press',
    icon: '🥻',
    rate: 'From ₹35',
    category: 'Wash & Iron',
    keywords: 'kurti salwar ladies suit daily ethnic steam press',
    isPrimary: true,
  },
  {
    id: 'saree-kurta-press',
    name: 'Sarees & Kurta Press',
    icon: '✨',
    rate: 'From ₹49',
    category: 'Wash & Iron',
    keywords: 'saree kurta pajama roll press steam iron ethnic silk',
    isPrimary: true,
  },
  {
    id: 'bedsheets-linens-press',
    name: 'Bedsheets & Linens Press',
    icon: '🛏️',
    rate: 'From ₹49',
    category: 'Wash & Iron',
    keywords: 'bedsheet bedsheets linens pillow covers flat steam iron',
    isPrimary: true,
  },
  {
    id: 'blazer-coat-press',
    name: 'Blazer & Coat Press',
    icon: '🧥',
    rate: 'From ₹99',
    category: 'Wash & Iron',
    keywords: 'blazer suit coat jacket 3d mannequin steam finish formals',
    isPrimary: true,
  },
  {
    id: 'two-piece-suit-press',
    name: 'Two-Piece Suit Press',
    icon: '🤵',
    rate: 'From ₹149',
    category: 'Wash & Iron',
    keywords: 'suit 2 piece executive formals suit press steam iron',
    isPrimary: true,
  },
  {
    id: 'wash-iron-kg',
    name: 'Wash & Steam Iron',
    icon: '👔',
    rate: '₹149/kg',
    category: 'Wash & Iron',
    keywords: 'wash iron steam pressed laundry kg bulk weight',
    isPrimary: true,
  },
  {
    id: 'wash-fold-kg',
    name: 'Wash & Fold Laundry',
    icon: '🧺',
    rate: '₹109/kg',
    category: 'Wash & Iron',
    keywords: 'wash fold laundry kg everyday clothes regular per kg',
    isPrimary: true,
  },
];

export const DRY_CLEANING_SERVICES: CatalogService[] = [
  {
    id: 'dc-shirts-trousers',
    name: 'Office Shirts & Trousers',
    icon: '👔',
    rate: 'From ₹69',
    category: 'Dry Cleaning',
    keywords: 'shirts trousers formal workwear dry cleaning spot removal',
    isPrimary: true,
  },
  {
    id: 'dc-silk-saree',
    name: 'Silk Sarees & Saree Spa',
    icon: '🥻',
    rate: 'From ₹119',
    category: 'Dry Cleaning',
    keywords: 'saree silk banarasi zari paithani kanjivaram chiffon dry cleaning',
    isPrimary: true,
  },
  {
    id: 'dc-mens-suit',
    name: "Men's Suits & Blazers",
    icon: '🤵',
    rate: 'From ₹149',
    category: 'Dry Cleaning',
    keywords: 'suit suits blazer coat tuxedo indowestern formals dry clean',
    isPrimary: true,
  },
  {
    id: 'dc-kurta-sherwani',
    name: 'Kurta Pajama & Sherwani',
    icon: '👑',
    rate: 'From ₹119',
    category: 'Dry Cleaning',
    keywords: 'kurta pyjama pajama sherwani dhoti ethnic wedding groom dry cleaning',
    isPrimary: true,
  },
  {
    id: 'dc-winter-jacket',
    name: 'Jackets & Winterwear',
    icon: '🧥',
    rate: 'From ₹99',
    category: 'Dry Cleaning',
    keywords: 'jacket jackets winterwear sweaters cardigans coats overcoats',
    isPrimary: true,
  },
  {
    id: 'dc-designer-gown',
    name: 'Designer Gowns & Dresses',
    icon: '💃',
    rate: 'From ₹199',
    category: 'Dry Cleaning',
    keywords: 'gown dress western maxi party evening wear cocktail dress dry cleaning',
    isPrimary: true,
  },
  {
    id: 'dc-bridal-lehenga',
    name: 'Bridal & Heavy Lehenga',
    icon: '✨',
    rate: 'From ₹499',
    category: 'Dry Cleaning',
    keywords: 'lehenga choli bridal wedding ghagra heavy stone zari work dry clean',
    isPrimary: true,
  },
  {
    id: 'dc-shawl-pashmina',
    name: 'Shawls & Pashmina Spa',
    icon: '🧣',
    rate: 'From ₹99',
    category: 'Dry Cleaning',
    keywords: 'shawl pashmina toosh lohi muffler woolen cashmere scarf stoles',
    isPrimary: true,
  },
  {
    id: 'dc-footwear-sneaker',
    name: 'Footwear & Sneaker Spa',
    icon: '👟',
    rate: 'From ₹349/pair',
    category: 'Dry Cleaning',
    keywords: 'shoe sneakers boots leather footwear spa sports white shoes restoration',
    isPrimary: true,
  },
  {
    id: 'dc-leather-jacket-bag',
    name: 'Leather Jackets & Bags',
    icon: '👜',
    rate: 'From ₹299',
    category: 'Dry Cleaning',
    keywords: 'leather jacket suede handbag purse briefcase restoration conditioning',
    isPrimary: true,
  },
];

export const HOME_TEXTILES_SERVICES: CatalogService[] = [
  {
    id: 'ht-bedsheets-linens',
    name: 'Bedsheets & Pillow Covers',
    icon: '🛏️',
    rate: 'From ₹49',
    category: 'Home Textiles',
    keywords: 'bedsheet bedsheets linens pillow covers bed cover fresh finish',
    isPrimary: true,
  },
  {
    id: 'ht-curtains-parda',
    name: 'Curtains & Drapes (Parda)',
    icon: '🪟',
    rate: 'From ₹45/sq.ft',
    category: 'Home Textiles',
    keywords: 'curtain parda drape window sheer blackout lining dust extraction',
    isPrimary: true,
  },
  {
    id: 'ht-blankets-kambal',
    name: 'Blankets & Heavy Kambal',
    icon: '🧶',
    rate: 'From ₹199',
    category: 'Home Textiles',
    keywords: 'blanket kambal duvet comforter heavy winter rajai mink fluffing',
    isPrimary: true,
  },
  {
    id: 'ht-quilts-comforters',
    name: 'Quilts & Comforters (Rajai)',
    icon: '🛌',
    rate: 'From ₹199',
    category: 'Home Textiles',
    keywords: 'quilt comforter rajai duvet summer ac quilt hygienic wash',
    isPrimary: true,
  },
  {
    id: 'ht-sofa-cleaning',
    name: 'Sofa & Upholstery Care',
    icon: '🛋️',
    rate: 'From ₹199/seat',
    category: 'Home Textiles',
    keywords: 'sofa couch upholstery shampoo rug cushion living room foam deep clean',
    isPrimary: true,
  },
  {
    id: 'ht-carpet-rugs',
    name: 'Carpet & Rug Washing',
    icon: '🧼',
    rate: 'From ₹30/sq.ft',
    category: 'Home Textiles',
    keywords: 'carpet rug floor mat rotary shampoo deep suction stain removal',
    isPrimary: true,
  },
  {
    id: 'ht-mattress-sanitization',
    name: 'Mattress Steam Sanitization',
    icon: '🛏️',
    rate: 'From ₹199',
    category: 'Home Textiles',
    keywords: 'mattress steam sanitization anti allergen bed bug bacteria high temp',
    isPrimary: true,
  },
  {
    id: 'ht-cushions-pillows',
    name: 'Cushions & Pillow Care',
    icon: '🛋️',
    rate: 'From ₹69',
    category: 'Home Textiles',
    keywords: 'cushion cushions pillow pillows sofa cushions wash re fluff',
    isPrimary: true,
  },
  {
    id: 'ht-dining-chair',
    name: 'Dining Chair Shampoo',
    icon: '🪑',
    rate: 'From ₹99/seat',
    category: 'Home Textiles',
    keywords: 'dining chair ottoman upholstery shampoo fabric seat deep wash',
    isPrimary: true,
  },
  {
    id: 'ht-car-upholstery',
    name: 'Car Upholstery Cleaning',
    icon: '🚗',
    rate: 'From ₹499',
    category: 'Home Textiles',
    keywords: 'car interior upholstery seats floor mats interior deep clean',
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

// Master Full Catalog (Combining Primary, Category Services, Specialized, and Individual Garments without duplicates)
const existingIds = new Set<string>();
export const ALL_SERVICES_CATALOG: CatalogService[] = [];

const pushUnique = (items: CatalogService[]) => {
  for (const item of items) {
    if (!existingIds.has(item.id)) {
      existingIds.add(item.id);
      ALL_SERVICES_CATALOG.push(item);
    }
  }
};

// Add Primary and Category collections first
pushUnique(PRIMARY_SERVICES);
pushUnique(WASH_FOLD_SERVICES);
pushUnique(WASH_IRON_SERVICES);
pushUnique(DRY_CLEANING_SERVICES);
pushUnique(HOME_TEXTILES_SERVICES);

// Add Specialized next
pushUnique(SPECIALIZED_SERVICES);

// Add Garments last
pushUnique(GARMENT_SERVICES);

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
