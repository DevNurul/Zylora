require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('./config/db')

const Category = require('./models/Category')
const Product = require('./models/Product')
const Coupon = require('./models/Coupon')
const Settings = require('./models/Settings')
const Banner = require('./models/Banner')

const CATEGORIES = [
  { name: 'Women', description: 'Women\'s clothing and fashion', displayOrder: 1,
    image: { url: 'https://picsum.photos/seed/catwomen/600/800', publicId: 'seed-women' } },
  { name: 'Men', description: 'Men\'s clothing and fashion', displayOrder: 2,
    image: { url: 'https://picsum.photos/seed/catmen/600/800', publicId: 'seed-men' } },
  { name: 'Accessories', description: 'Bags, belts, sunglasses and more', displayOrder: 3,
    image: { url: 'https://picsum.photos/seed/catacc/600/800', publicId: 'seed-acc' } },
  { name: 'Footwear', description: 'Heels, sneakers, boots and more', displayOrder: 4,
    image: { url: 'https://picsum.photos/seed/catfoot/600/800', publicId: 'seed-foot' } },
]

const buildProducts = (categories) => {
  const byName = {}
  categories.forEach((c) => { byName[c.name] = c._id })

  return [
    // Women
    { name: 'Floral Wrap Dress', category: byName['Women'], price: 2499,
      description: 'A beautifully crafted wrap dress with a delicate floral print. Perfect for summer occasions, this dress features a flattering V-neckline and adjustable waist tie.',
      images: [
        { url: 'https://picsum.photos/seed/wdress1a/600/800', publicId: 'seed-w1a' },
        { url: 'https://picsum.photos/seed/wdress1b/600/800', publicId: 'seed-w1b' },
        { url: 'https://picsum.photos/seed/wdress1c/600/800', publicId: 'seed-w1c' },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Beige'],
      stock: 45, rating: 4.7, reviewCount: 214, isFeatured: true, isNew: true, isSale: false },

    { name: 'Silk Slip Dress', category: byName['Women'], price: 1899, originalPrice: 2799,
      description: 'Luxuriously smooth silk slip dress with adjustable spaghetti straps. An effortless piece that transitions from day to night.',
      images: [
        { url: 'https://picsum.photos/seed/wdress2a/600/800', publicId: 'seed-w2a' },
        { url: 'https://picsum.photos/seed/wdress2b/600/800', publicId: 'seed-w2b' },
        { url: 'https://picsum.photos/seed/wdress2c/600/800', publicId: 'seed-w2c' },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'Beige', 'Navy'],
      stock: 28, rating: 4.5, reviewCount: 178, isFeatured: true, isNew: false, isSale: true },

    { name: 'Linen Cropped Top', category: byName['Women'], price: 999,
      description: 'Breathable linen cropped top with a relaxed fit. A wardrobe essential that pairs perfectly with high-waisted bottoms.',
      images: [
        { url: 'https://picsum.photos/seed/wtop3a/600/800', publicId: 'seed-w3a' },
        { url: 'https://picsum.photos/seed/wtop3b/600/800', publicId: 'seed-w3b' },
        { url: 'https://picsum.photos/seed/wtop3c/600/800', publicId: 'seed-w3c' },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Beige', 'Black'],
      stock: 60, rating: 4.3, reviewCount: 92, isFeatured: false, isNew: true, isSale: false },

    { name: 'Pleated Midi Skirt', category: byName['Women'], price: 1599, originalPrice: 2199,
      description: 'Elegant pleated midi skirt with a flowing silhouette. Crafted from lightweight fabric that moves beautifully with every step.',
      images: [
        { url: 'https://picsum.photos/seed/wskirt4a/600/800', publicId: 'seed-w4a' },
        { url: 'https://picsum.photos/seed/wskirt4b/600/800', publicId: 'seed-w4b' },
        { url: 'https://picsum.photos/seed/wskirt4c/600/800', publicId: 'seed-w4c' },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Beige'],
      stock: 35, rating: 4.6, reviewCount: 143, isFeatured: true, isNew: false, isSale: true },

    // Men
    { name: 'Oxford Button-Down Shirt', category: byName['Men'], price: 1799,
      description: 'A timeless Oxford button-down shirt crafted from premium cotton. Features a regular fit with a subtle texture weave.',
      images: [
        { url: 'https://picsum.photos/seed/mshirt1a/600/800', publicId: 'seed-m1a' },
        { url: 'https://picsum.photos/seed/mshirt1b/600/800', publicId: 'seed-m1b' },
        { url: 'https://picsum.photos/seed/mshirt1c/600/800', publicId: 'seed-m1c' },
      ],
      sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Navy', 'Beige'],
      stock: 50, rating: 4.8, reviewCount: 287, isFeatured: true, isNew: false, isSale: false },

    { name: 'Slim Fit Chinos', category: byName['Men'], price: 2199,
      description: 'Modern slim-fit chinos in a versatile neutral tone. Made from stretch cotton for all-day comfort.',
      images: [
        { url: 'https://picsum.photos/seed/mchino2a/600/800', publicId: 'seed-m2a' },
        { url: 'https://picsum.photos/seed/mchino2b/600/800', publicId: 'seed-m2b' },
        { url: 'https://picsum.photos/seed/mchino2c/600/800', publicId: 'seed-m2c' },
      ],
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'Navy', 'Black'],
      stock: 40, rating: 4.4, reviewCount: 156, isFeatured: false, isNew: true, isSale: false },

    { name: 'Merino Crew Neck Sweater', category: byName['Men'], price: 3299, originalPrice: 4499,
      description: 'Luxuriously soft merino wool crew neck sweater. A refined classic that layers effortlessly.',
      images: [
        { url: 'https://picsum.photos/seed/msweater3a/600/800', publicId: 'seed-m3a' },
        { url: 'https://picsum.photos/seed/msweater3b/600/800', publicId: 'seed-m3b' },
        { url: 'https://picsum.photos/seed/msweater3c/600/800', publicId: 'seed-m3c' },
      ],
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Navy', 'Beige', 'Black'],
      stock: 20, rating: 4.9, reviewCount: 301, isFeatured: true, isNew: false, isSale: true },

    { name: 'Tailored Blazer', category: byName['Men'], price: 5499,
      description: 'A sharp tailored blazer with a modern silhouette. Two-button closure with structured shoulders.',
      images: [
        { url: 'https://picsum.photos/seed/mblazer4a/600/800', publicId: 'seed-m4a' },
        { url: 'https://picsum.photos/seed/mblazer4b/600/800', publicId: 'seed-m4b' },
        { url: 'https://picsum.photos/seed/mblazer4c/600/800', publicId: 'seed-m4c' },
      ],
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy'],
      stock: 15, rating: 4.7, reviewCount: 89, isFeatured: false, isNew: false, isSale: false },

    // Accessories
    { name: 'Structured Tote Bag', category: byName['Accessories'], price: 3499,
      description: 'A sophisticated structured tote in premium vegan leather. Spacious interior with multiple compartments.',
      images: [
        { url: 'https://picsum.photos/seed/abag1a/600/800', publicId: 'seed-a1a' },
        { url: 'https://picsum.photos/seed/abag1b/600/800', publicId: 'seed-a1b' },
        { url: 'https://picsum.photos/seed/abag1c/600/800', publicId: 'seed-a1c' },
      ],
      sizes: ['M'], colors: ['Black', 'Beige', 'White'],
      stock: 25, rating: 4.6, reviewCount: 198, isFeatured: true, isNew: true, isSale: false },

    { name: 'Woven Leather Belt', category: byName['Accessories'], price: 899, originalPrice: 1299,
      description: 'Handcrafted woven leather belt with a classic pin buckle.',
      images: [
        { url: 'https://picsum.photos/seed/abelt2a/600/800', publicId: 'seed-a2a' },
        { url: 'https://picsum.photos/seed/abelt2b/600/800', publicId: 'seed-a2b' },
        { url: 'https://picsum.photos/seed/abelt2c/600/800', publicId: 'seed-a2c' },
      ],
      sizes: ['S', 'M', 'L'], colors: ['Black', 'Beige'],
      stock: 55, rating: 4.3, reviewCount: 67, isFeatured: false, isNew: false, isSale: true },

    { name: 'Aviator Sunglasses', category: byName['Accessories'], price: 1999,
      description: 'Classic aviator sunglasses with UV400 protection. Metal frame with gradient lenses.',
      images: [
        { url: 'https://picsum.photos/seed/asun3a/600/800', publicId: 'seed-a3a' },
        { url: 'https://picsum.photos/seed/asun3b/600/800', publicId: 'seed-a3b' },
        { url: 'https://picsum.photos/seed/asun3c/600/800', publicId: 'seed-a3c' },
      ],
      sizes: ['M'], colors: ['Black', 'Navy'],
      stock: 30, rating: 4.5, reviewCount: 134, isFeatured: false, isNew: false, isSale: false },

    { name: 'Mini Crossbody Bag', category: byName['Accessories'], price: 2199,
      description: 'A chic mini crossbody bag with an adjustable strap. Perfect for carrying your essentials.',
      images: [
        { url: 'https://picsum.photos/seed/abag4a/600/800', publicId: 'seed-a4a' },
        { url: 'https://picsum.photos/seed/abag4b/600/800', publicId: 'seed-a4b' },
        { url: 'https://picsum.photos/seed/abag4c/600/800', publicId: 'seed-a4c' },
      ],
      sizes: ['M'], colors: ['Black', 'White', 'Beige'],
      stock: 22, rating: 4.7, reviewCount: 223, isFeatured: false, isNew: false, isSale: false },

    // Footwear
    { name: 'Block Heel Mules', category: byName['Footwear'], price: 2799, originalPrice: 3499,
      description: 'Elegant block heel mules in smooth faux leather. A comfortable heel height that works from desk to dinner.',
      images: [
        { url: 'https://picsum.photos/seed/fheel1a/600/800', publicId: 'seed-f1a' },
        { url: 'https://picsum.photos/seed/fheel1b/600/800', publicId: 'seed-f1b' },
        { url: 'https://picsum.photos/seed/fheel1c/600/800', publicId: 'seed-f1c' },
      ],
      sizes: ['S', 'M', 'L'], colors: ['Black', 'Beige', 'White'],
      stock: 18, rating: 4.4, reviewCount: 112, isFeatured: true, isNew: false, isSale: true },

    { name: 'Minimalist Leather Sneakers', category: byName['Footwear'], price: 3999,
      description: 'Clean, minimalist leather sneakers with cushioned insoles. Designed for all-day wear.',
      images: [
        { url: 'https://picsum.photos/seed/fsneak2a/600/800', publicId: 'seed-f2a' },
        { url: 'https://picsum.photos/seed/fsneak2b/600/800', publicId: 'seed-f2b' },
        { url: 'https://picsum.photos/seed/fsneak2c/600/800', publicId: 'seed-f2c' },
      ],
      sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Black'],
      stock: 32, rating: 4.8, reviewCount: 267, isFeatured: true, isNew: true, isSale: false },

    { name: 'Chelsea Ankle Boots', category: byName['Footwear'], price: 4499,
      description: 'Classic Chelsea ankle boots with elastic side panels. Crafted from genuine leather.',
      images: [
        { url: 'https://picsum.photos/seed/fboot3a/600/800', publicId: 'seed-f3a' },
        { url: 'https://picsum.photos/seed/fboot3b/600/800', publicId: 'seed-f3b' },
        { url: 'https://picsum.photos/seed/fboot3c/600/800', publicId: 'seed-f3c' },
      ],
      sizes: ['S', 'M', 'L'], colors: ['Black', 'Beige'],
      stock: 3, rating: 4.9, reviewCount: 189, isFeatured: false, isNew: false, isSale: false },

    { name: 'Strappy Stiletto Heels', category: byName['Footwear'], price: 3299,
      description: 'Glamorous strappy stiletto heels with an ankle strap closure. A bold statement piece.',
      images: [
        { url: 'https://picsum.photos/seed/fstil4a/600/800', publicId: 'seed-f4a' },
        { url: 'https://picsum.photos/seed/fstil4b/600/800', publicId: 'seed-f4b' },
        { url: 'https://picsum.photos/seed/fstil4c/600/800', publicId: 'seed-f4c' },
      ],
      sizes: ['S', 'M', 'L'], colors: ['Black', 'Beige', 'White'],
      stock: 12, rating: 4.2, reviewCount: 54, isFeatured: false, isNew: false, isSale: false },
  ]
}

const COUPONS = [
  { code: 'FIRST10', discountType: 'percentage', discountValue: 10,
    minOrderValue: 500, maxUses: null, isActive: true },
  { code: 'SAVE20', discountType: 'percentage', discountValue: 20,
    minOrderValue: 1500, maxUses: 100, isActive: true },
]

const BANNERS = [
  {
    title: 'Timeless Elegance,\nMade for *You*',
    subtitle: 'NEW COLLECTION',
    description: 'Discover our fine 925 silver jewellery crafted to shine every day.',
    image: { url: '/banner1.png', publicId: 'seed-banner1' },
    ctaText: 'SHOP NEW ARRIVALS',
    ctaLink: '/products',
    displayOrder: 1,
    isActive: true
  },
  {
    title: 'Handcrafted Luxury,\nFor Every *Moment*',
    subtitle: 'ESSENTIAL RINGS',
    description: 'Explore our collection of sterling silver rings and bracelets made to last.',
    image: { url: '/banner2.png', publicId: 'seed-banner2' },
    ctaText: 'EXPLORE RINGS',
    ctaLink: '/products?category=Accessories',
    displayOrder: 2,
    isActive: true
  },
  {
    title: 'The Art of Giving,\nPerfected by *Us*',
    subtitle: 'CURATED GIFTING',
    description: 'Find the perfect token of appreciation from our luxury gift sets.',
    image: { url: '/banner3.png', publicId: 'seed-banner3' },
    ctaText: 'SHOP THE GIFT GUIDE',
    ctaLink: '/products',
    displayOrder: 3,
    isActive: true
  }
]

const DEFAULT_SETTINGS = {
  storeName: 'LUXORA',
  tagline: 'Jewellery & Elegance',
  contactEmail: 'official@luxora.co.in',
  contactPhone: '+91 98765 43210',
  address: '42, Elegance Street, Bandra West, Mumbai, Maharashtra 400050',
  socialLinks: {
    instagram: 'https://instagram.com/luxorajewellery',
    facebook: 'https://facebook.com/luxorajewellery',
    twitter: 'https://twitter.com/luxorajewellery',
  },
  shippingCharge: 99,
  freeShippingThreshold: 999,
  currency: 'INR',
  isMaintenanceMode: false,
}

const seed = async () => {
  try {
    await connectDB()

    console.log('\n🗑️  Clearing existing data...')
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Settings.deleteMany({}),
      Banner.deleteMany({}),
    ])
    console.log('   Done.')

    console.log('\n📁 Seeding categories...')
    const categoriesWithSlugs = CATEGORIES.map(c => ({
      ...c,
      slug: c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))
    const categories = await Category.insertMany(categoriesWithSlugs)
    console.log(`   Created ${categories.length} categories.`)

    console.log('\n👗 Seeding products...')
    const productData = buildProducts(categories).map(p => ({
      ...p,
      slug: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))
    const products = await Product.insertMany(productData)
    console.log(`   Created ${products.length} products.`)

    console.log('\n🎟️  Seeding coupons...')
    const coupons = await Coupon.insertMany(COUPONS)
    console.log(`   Created ${coupons.length} coupons.`)

    console.log('\n🖼️  Seeding banners...')
    const banners = await Banner.insertMany(BANNERS)
    console.log(`   Created ${banners.length} banners.`)

    console.log('\n⚙️  Seeding settings...')
    await Settings.create(DEFAULT_SETTINGS)
    console.log('   Settings created.')

    console.log('\n✅ Seed complete!\n')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message)
    process.exit(1)
  }
}

seed()
