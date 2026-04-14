export const cityImages: Record<string, string> = {
  // España
  'barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  'marbella': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'málaga': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
  'malaga': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
  'ibiza': 'https://images.unsplash.com/photo-1555631226-36f9a17e6f66?w=800&q=80',
  'mallorca': 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=800&q=80',
  'valencia': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80',
  'sitges': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'alicante': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  'granada': 'https://images.unsplash.com/photo-1548793852-dce813b7c5aa?w=800&q=80',
  'sevilla': 'https://images.unsplash.com/photo-1559582798-678dfc71ccd8?w=800&q=80',
  'almería': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80',
  'almeria': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80',
  'cádiz': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'cadiz': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  // México
  'tulum': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
  'cancún': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80',
  'cancun': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80',
  'ciudad de méxico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80',
  'playa del carmen': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80',
  // Dubai / EAU
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'abu dhabi': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&q=80',
  // Argentina
  'buenos aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80',
  'mendoza': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80',
  // EEUU
  'miami': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'nueva york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'los angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80',
  // Costa Rica
  'san josé': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
  'guanacaste': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
  // Reino Unido
  'londres': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  // Grecia
  'atenas': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
  'santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  'mykonos': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  // Ecuador
  'quito': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
  'guayaquil': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80',
}

export function getCityImage(city: string): string {
  const key = city.toLowerCase().trim()
  return cityImages[key] ??
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
}
