export interface Property {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  price: number | null
  currency: string | null
  location: string | null
  destination_id: string | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  image_url: string | null
  gallery_urls: string[] | null
  features: string[] | null
  property_type: string | null
  status: 'active' | 'inactive' | 'sold'
  featured: boolean
  created_by: string | null
  idealista_url: string | null
}

export interface TeamMember {
  id: string
  name: string
  role_es: string | null
  role_en: string | null
  title_es: string | null
  title_en: string | null
  bio_es: string | null
  bio_en: string | null
  specialties_es: string[] | null
  specialties_en: string[] | null
  image_url: string | null
  linkedin_url: string | null
  member_type: 'founder' | 'partner' | 'team'
  sort_order: number
  visible: boolean
  country: string | null
}

export interface CountryDestination {
  id: string
  country_name: string
  tagline: string | null
  tagline_en: string | null
  description: string | null
  description_en: string | null
  hero_image_url: string | null
  card_image_url: string | null
  highlights: Record<string, unknown>[] | null
  highlights_en: Record<string, unknown>[] | null
  market_info: Record<string, unknown> | null
  market_info_en: Record<string, unknown> | null
}

export interface BlogPost {
  id: string
  created_at: string
  title: string | null
  title_en: string | null
  content: string | null
  content_en: string | null
  excerpt: string | null
  excerpt_en: string | null
  image_url: string | null
  slug: string | null
  published: boolean
  category: string | null
}

export interface Lead {
  name: string
  email: string
  phone?: string
  interest?: string
  message: string
  location?: string
  source?: string
}
