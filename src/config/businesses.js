const businesses = {
  'cafe-99': {
    businessId: 'cafe-99',
    businessName: 'Cafe 99',
    logoUrl: 'https://via.placeholder.com/80x80.png?text=Cafe+99',
    themeColor: '#4f46e5',
    currency: '₹',
    apiUrl: 'https://script.google.com/macros/s/AKfycbyoRNyevDjygJo3Hn0tCvegmrSdXUx6gaH3As2ii83-PSXLdZOdYOh2sSzUPNPRfenxEg/exec',
    reviewLink: 'https://g.page/r/Cafe99/review',
    ownerPhone: '+919000000000',
    isActive: true,
  },
  'sharma-sweets': {
    businessId: 'sharma-sweets',
    businessName: 'Sharma Sweets',
    logoUrl: 'https://via.placeholder.com/80x80.png?text=Sweets',
    themeColor: '#b91c1c',
    currency: '₹',
    apiUrl: 'https://placeholder-apps-script-url.example.com/execute',
    reviewLink: 'https://g.page/r/SharmaSweets/review',
    ownerPhone: '+919111111111',
    isActive: true,
  },
};

export function getBusinessBySlug(slug) {
  return businesses[slug] || null;
}

export default businesses;
