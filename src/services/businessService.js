const businesses = {

  'cafe-99': {

    businessId: 'cafe-99',

    businessName: 'Cafe 99',

    logoUrl:
      'https://placehold.co/80x80?text=Cafe+99',

    apiUrl:
      'https://script.google.com/macros/s/AKfycbyiz0qCGwLLXhKoD_nSj8R-iHPD64-hehN-DAE3UkJBNx1rwhxgCSLb1svD4smAYFHcYA/exec',

    currency: '₹',

    isActive: true,
  },

};

export function getBusiness(slug) {

  return businesses[slug] || null;
}