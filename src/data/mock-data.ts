import type {
  Product,
  Order,
  OrderItem,
  Customer,
  ProductStatus,
  OrderStatus,
  CustomerStatus,
} from "@/types";
import { BRANDS, CATEGORIES } from "@/lib/constants";

// in-memory data, resets on every server restart

// seeded PRNG so every start generates the same data
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20240607);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
// n distinct items, order randomised (used for tags)
const sample = <T>(arr: readonly T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let k = 0; k < n && copy.length; k++) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
};
const int = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const money = (min: number, max: number) =>
  Math.round((rng() * (max - min) + min) * 100) / 100;
const daysAgoISO = (days: number) =>
  new Date(Date.now() - days * 86_400_000 - int(0, 86_400_000)).toISOString();

const FIRST = ["Alice","Brian","Carla","David","Emma","Frank","Grace","Henry","Ivy","Jack","Karen","Liam","Mia","Noah","Olivia","Paul","Quinn","Ruby","Sam","Tina","Uma","Victor","Wendy","Xander","Yara","Zane"]; // prettier-ignore
const LAST = ["Anderson","Brooks","Chen","Diaz","Evans","Foster","Garcia","Hughes","Ito","Johnson","Khan","Lopez","Miller","Nguyen","Owens","Patel","Reed","Singh","Torres","Walker"]; // prettier-ignore
const ADJ = ["Pro","Max","Lite","Ultra","Eco","Smart","Classic","Premium","Mini","Plus"]; // prettier-ignore
const NOUN = ["Headphones","Sneakers","Backpack","Blender","Lamp","Keyboard","Bottle","Jacket","Watch","Speaker","Charger","Notebook","Mug","Camera","Chair"]; // prettier-ignore
const TAG_POOL = ["new","bestseller","sale","limited","eco","featured","clearance","popular"]; // prettier-ignore

// Weighted pools (repeats bias the distribution toward common statuses).
const PRODUCT_STATUS_POOL: ProductStatus[] = ["active","active","active","draft","archived","out_of_stock"]; // prettier-ignore
const ORDER_STATUS_POOL: OrderStatus[] = ["pending","paid","processing","shipped","delivered","delivered","cancelled","refunded"]; // prettier-ignore
const CUSTOMER_STATUS_POOL: CustomerStatus[] = ["active","active","active","inactive","blocked"]; // prettier-ignore

const VARIANT_SIZES = ["Small", "Medium", "Large", "X-Large"];

function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const status = pick(PRODUCT_STATUS_POOL);
    const id = `PROD-${1000 + i}`;
    const adj = pick(ADJ);
    const noun = pick(NOUN);
    const brand = pick(BRANDS);
    const category = pick(CATEGORIES);
    const price = money(8, 600);

    // most products carry a couple of size variants, some carry none
    const variantCount = pick([0, 0, 2, 3]);
    const variants = sample(VARIANT_SIZES, variantCount).map((size, v) => ({
      name: size,
      sku: `SKU-${1000 + i}-${size[0]}`,
      price: Math.round((price + v * 5) * 100) / 100,
      stock: status === "out_of_stock" ? 0 : int(0, 80),
    }));

    return {
      id,
      name: `${adj} ${noun}`,
      description: `The ${brand} ${adj} ${noun} is a ${category.toLowerCase()} essential, built for everyday use and backed by a one-year warranty.`,
      sku: `SKU-${1000 + i}`,
      brand,
      category,
      tags: sample(TAG_POOL, int(1, 3)),
      // deterministic placeholder images, seeded by product id
      images: Array.from(
        { length: 3 },
        (_, n) => `https://picsum.photos/seed/${id}-${n}/600/600`,
      ),
      variants,
      price,
      stock: status === "out_of_stock" ? 0 : int(0, 240),
      status,
      createdAt: daysAgoISO(int(0, 300)),
    };
  });
}

function makeCustomers(count: number): Customer[] {
  return Array.from({ length: count }, (_, i) => {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    return {
      id: `CUST-${100 + i}`,
      name,
      email: `${name.toLowerCase().replace(/ /g, ".")}.${i}@example.com`,
      totalOrders: 0, // backfilled below
      totalSpent: 0,
      status: pick(CUSTOMER_STATUS_POOL),
      joinedAt: daysAgoISO(int(10, 720)),
      recentOrders: [],
    };
  });
}

function makeOrders(
  count: number,
  customerList: Customer[],
  productList: Product[],
): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const customer = pick(customerList);
    const items: OrderItem[] = Array.from({ length: int(1, 4) }, () => {
      const product = pick(productList);
      return { name: product.name, quantity: int(1, 3), price: product.price };
    });
    const total =
      Math.round(
        items.reduce((sum, it) => sum + it.price * it.quantity, 0) * 100,
      ) / 100;
    return {
      id: `ORD-${2000 + i}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      date: daysAgoISO(int(0, 30)),
      total,
      status: pick(ORDER_STATUS_POOL),
      items,
    };
  });
}

export const products = makeProducts(60);
export const customers = makeCustomers(48);
export const orders = makeOrders(90, customers, products);

// Backfill customer totals + recent orders from the generated orders.
for (const customer of customers) {
  const theirs = orders
    .filter((order) => order.customerId === customer.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  customer.totalOrders = theirs.length;
  customer.totalSpent =
    Math.round(theirs.reduce((sum, o) => sum + o.total, 0) * 100) / 100;
  customer.recentOrders = theirs.slice(0, 5).map((o) => ({
    id: o.id,
    date: o.date,
    total: o.total,
    status: o.status,
  }));
}
