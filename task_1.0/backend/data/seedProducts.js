const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const sampleProducts = [
  {
    name: 'Generic: A4 Dye Sublimation Paper 100/120GSM',
    price: 22.00,
    description: 'High-quality dye sublimation transfer paper for cups, shirts, plates, mugs, etc. Delivers bright colors and precise detailing. Pack of 100 sheets.',
    image: 'https://makerbazar.in/cdn/shop/products/A4SublimationPaper.jpg?v=1661471358&width=260',
    category: 'Arts & Crafts',
    reviewsCount: 12,
    rating: 4.5,
    isClearance: true,
    stock: 120
  },
  {
    name: 'Silicone Waterproof Shoe Covers Pair',
    price: 89.00,
    description: 'Durable, high elastic silicone shoe cover shields shoes from rainwater, mud splashes, or dirt. Perfect for outdoor travel, cycling, camping, or walking.',
    image: 'https://makerbazar.in/cdn/shop/products/silicone-waterproof-shoe-covers.jpg?v=1685608547&width=260',
    category: 'Hardware',
    reviewsCount: 5,
    rating: 4.0,
    isClearance: true,
    stock: 50
  },
  {
    name: 'XH-M564 DC12-24V 2x50W Dual Channel TPA3116D2 Power Amplifier Board D Class 50W+50W',
    price: 449.00,
    description: 'High efficiency class-D stereo power amplifier with built-in TPA3116D2 chip. Dual channel 50W+50W power output, perfect for custom DIY Bluetooth speaker projects.',
    image: 'https://makerbazar.in/cdn/shop/products/XH-M564-amplifier-board.jpg?v=1635030421&width=260',
    category: 'Electronics',
    reviewsCount: 22,
    rating: 4.8,
    isClearance: true,
    stock: 45
  },
  {
    name: '4pcs 10cm Small Multipurpose Food Snack Plastic Bag Clip Sealer',
    price: 99.00,
    description: 'Durable, airtight sealing clips keep food products fresh and moisture-free for extended periods. Reusable and handy.',
    image: 'https://makerbazar.in/cdn/shop/products/plastic-clips-4pcs.jpg?v=1661471358&width=260',
    category: 'Hardware',
    reviewsCount: 3,
    rating: 3.5,
    isClearance: true,
    stock: 80
  },
  {
    name: 'Generic: 4in Metal Grinding Wheel Disc for Grinder Machine',
    price: 49.00,
    description: 'Tough abrasive grinding wheel designed for metal cutting, shaping, and surface grinding. Durable and optimized for high-speed performance.',
    image: 'https://makerbazar.in/cdn/shop/products/grinding-wheel-disc.jpg?v=1661471358&width=260',
    category: 'Hardware',
    reviewsCount: 8,
    rating: 4.2,
    isClearance: true,
    stock: 100
  },
  {
    name: 'Antistatic ESD Slipper Blue/Black',
    price: 249.00,
    description: 'Sleek, lightweight antistatic protective slippers designed for labs, electronics manufacturing, cleanrooms, and computer workstations. Dissipates electrostatic charge.',
    image: 'https://makerbazar.in/cdn/shop/products/esd-slippers.jpg?v=1661471358&width=260',
    category: 'Electronics',
    reviewsCount: 14,
    rating: 4.6,
    isClearance: true,
    stock: 65
  },
  {
    name: 'XYQ-2 Wooden Quadcopter DIY Drone Kit',
    price: 1899.00,
    description: 'A premium, educational Wooden Quadcopter Drone DIY Frame Kit! Roll over image gallery to zoom in. The ideal learning tool for aeromodelling enthusiasts, students, and hobbyists. Build your own flight controllers, hook up core motors, and pilot your very own customized creation.',
    image: 'https://makerbazar.in/cdn/shop/products/XYQ-2QuadcopterDIYKit.webp?v=1717829421&width=260',
    images: [
      'https://makerbazar.in/cdn/shop/products/XYQ-2QuadcopterDIYKit.webp?v=1717829421&width=260',
      'https://makerbazar.in/cdn/shop/files/wooden_drone_-_3.jpg?v=1717829056&width=260',
      'https://makerbazar.in/cdn/shop/files/Design-1.jpg?v=1717829408&width=260',
      'https://makerbazar.in/cdn/shop/files/wooden_drone_-_6.jpg?v=1717829055&width=260',
      'https://makerbazar.in/cdn/shop/files/wooden_drone_-_5.jpg?v=1717829055&width=260',
      'https://makerbazar.in/cdn/shop/files/wooden_drone_-_4.jpg?v=1717829056&width=260',
      'https://makerbazar.in/cdn/shop/files/DESIGN-2.webp?v=1717829408&width=260',
      'https://makerbazar.in/cdn/shop/files/Design2.jpg?v=1717829056&width=260',
      'https://makerbazar.in/cdn/shop/files/2nd_drone_3.jpg?v=1717829055&width=260'
    ],
    category: 'RC Planes & Drones',
    reviewsCount: 37,
    rating: 4.9,
    isClearance: false,
    stock: 25
  },
  // Additional typical items for other categories
  {
    name: 'Arduino Uno R3 Compatible Board with USB Cable',
    price: 389.00,
    description: 'The standard microcontroller board featuring the ATmega328P. Perfect for prototyping electronic circuits and coding automation sensors.',
    image: 'https://makerbazar.in/cdn/shop/products/uno-r3.jpg?v=1661471358&width=260',
    category: 'Robotics',
    reviewsCount: 104,
    rating: 4.8,
    isClearance: false,
    stock: 150
  },
  {
    name: 'Ultrasonic Distance Sensor HC-SR04',
    price: 79.00,
    description: 'Non-contact ultrasonic distance measuring module. Precise range detection from 2cm to 400cm, commonly integrated in obstacle avoidance robotics.',
    image: 'https://makerbazar.in/cdn/shop/products/hc-sr04.jpg?v=1661471358&width=260',
    category: 'Sensors',
    reviewsCount: 42,
    rating: 4.5,
    isClearance: false,
    stock: 200
  },
  {
    name: 'Creality 3D Ender 3 V2 Printer',
    price: 15999.00,
    description: 'Reliable, entry-level FDM 3D printer with glass platform bed, silent motherboard, and resume printing function.',
    image: 'https://makerbazar.in/cdn/shop/products/ender-3-v2.jpg?v=1661471358&width=260',
    category: '3D printing',
    reviewsCount: 15,
    rating: 4.7,
    isClearance: false,
    stock: 12
  },
  {
    name: 'STEM Hydropower Generation Educational Toy Kit',
    price: 499.00,
    description: 'Learn the basic science of renewable clean energy. A physical water turbine model that powers a mini LED bulb through hydropower.',
    image: 'https://makerbazar.in/cdn/shop/products/hydropower-kit.jpg?v=1661471358&width=260',
    category: 'STEM Learing Toys',
    reviewsCount: 9,
    rating: 4.3,
    isClearance: false,
    stock: 35
  }
];

const seedDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/makerbazar';
    console.log('Connecting to database for seeding...');
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
      console.log('Successfully connected to local MongoDB for seeding.');
    } catch (connErr) {
      console.warn('Local MongoDB connection failed. Seeding on dynamic in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
    
    // Clear old products
    console.log('Clearing old product catalog...');
    await Product.deleteMany({});
    
    // Insert new product list
    console.log(`Inserting ${sampleProducts.length} premium products...`);
    await Product.insertMany(sampleProducts);
    
    console.log('Database successfully seeded with MakerBazar products!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('Seeding failure:', err.message);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

module.exports = { sampleProducts, seedDB };

if (require.main === module) {
  seedDB();
}

