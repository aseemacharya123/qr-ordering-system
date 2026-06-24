import paneerTikkaImg from '../assets/images/paneer-tikka.png';
import alooSamosaImg from '../assets/images/aloo-samosa.png';

export const categories = [
  {
    categoryId: 'starters',
    categoryName: 'Starters',
    displayOrder: 1,
    isActive: true,
  },
  {
    categoryId: 'main-course',
    categoryName: 'Main Course',
    displayOrder: 2,
    isActive: true,
  },
  {
    categoryId: 'drinks',
    categoryName: 'Drinks',
    displayOrder: 3,
    isActive: true,
  },
  {
    categoryId: 'sweets',
    categoryName: 'Sweets',
    displayOrder: 4,
    isActive: true,
  },
  {
    categoryId: 'snacks',
    categoryName: 'Snacks',
    displayOrder: 5,
    isActive: true,
  },
];

export const items = [

  // STARTERS

  {
    itemId: 'item_001',
    categoryId: 'starters',
    itemName: 'Paneer Tikka',
    description: 'Spicy grilled paneer cubes',
    price: 180,
    imageUrl: paneerTikkaImg,
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 1,
  },

  {
    itemId: 'item_002',
    categoryId: 'starters',
    itemName: 'Veg Spring Roll',
    description: 'Crispy vegetable rolls',
    price: 140,
    imageUrl: '',
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 2,
  },

  // MAIN COURSE

  {
    itemId: 'item_003',
    categoryId: 'main-course',
    itemName: 'Paneer Butter Masala',
    description: 'Creamy tomato paneer curry',
    price: 260,
    imageUrl: '',
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 3,
  },

  {
    itemId: 'item_004',
    categoryId: 'main-course',
    itemName: 'Veg Biryani',
    description: 'Aromatic rice with vegetables',
    price: 220,
    imageUrl: '',
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 4,
  },

  // DRINKS

  {
    itemId: 'item_005',
    categoryId: 'drinks',
    itemName: 'Cold Coffee',
    description: 'Chilled creamy coffee',
    price: 120,
    imageUrl: '',
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 5,
  },

  {
    itemId: 'item_006',
    categoryId: 'drinks',
    itemName: 'Fresh Lime Soda',
    description: 'Refreshing lime soda',
    price: 90,
    imageUrl: '',
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 6,
  },

  // SWEETS

  {
    itemId: 'item_007',
    categoryId: 'sweets',
    itemName: 'Gulab Jamun',
    description: 'Soft sweet dumplings',
    price: 80,
    imageUrl: '',
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 7,
  },

  {
    itemId: 'item_008',
    categoryId: 'sweets',
    itemName: 'Rasgulla',
    description: 'Soft Bengali sweet',
    price: 90,
    imageUrl: '',
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 8,
  },

  // SNACKS

  {
    itemId: 'item_009',
    categoryId: 'snacks',
    itemName: 'Aloo Samosa',
    description: 'Crispy potato stuffed samosa',
    price: 40,
    imageUrl: alooSamosaImg,
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 9,
  },

  {
    itemId: 'item_010',
    categoryId: 'snacks',
    itemName: 'French Fries',
    description: 'Crispy salted fries',
    price: 110,
    imageUrl: '',
    vegType: 'Veg',
    isAvailable: true,
    displayOrder: 10,
  },

];