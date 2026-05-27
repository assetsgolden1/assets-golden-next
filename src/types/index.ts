// ─── Property ────────────────────────────────────────────────
export interface Property {
  id: string
  created_at: string
  updated_at: string
  title: string
  slug: string | null
  external_id: string | null
  description: string | null
  description_en: string | null
  price: number | null
  currency: string | null
  location: string | null
  province: string | null
  country: string | null
  destination_id: string | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  image_url: string | null
  gallery_urls: string[] | null
  features: string[] | null
  property_type: string | null
  classification: string | null
  status: 'active' | 'inactive' | 'sold' | 'available' | 'reserved'
  is_development: boolean
  featured: boolean
  created_by: string | null
  idealista_url: string | null
  nestseekers_url: string | null
  ref_code: string | null
  sold: boolean | null
  hidden: boolean | null
  external_source: string | null
  last_synced_at: string | null
  featured_order: number | null
}

// ─── TeamMember ───────────────────────────────────────────────
export interface TeamMember {
  id: string
  created_at: string
  name: string
  role_es: string | null
  role_en: string | null
  bio_es: string | null
  bio_en: string | null
  specialties: string[] | null
  photo_url: string | null
  linkedin_url: string | null
  country: string | null
  member_type: 'founder' | 'partner' | 'team'
  order_index: number
  active: boolean
}

// ─── CountryDestination ───────────────────────────────────────
export interface CountryDestination {
  id: string
  created_at: string
  country_name: string
  slug: string | null
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
  sort_order: number
  active: boolean
  city_images: Record<string, string> | null
}

// ─── BlogPost ─────────────────────────────────────────────────
export interface BlogPost {
  id: string
  created_at: string
  updated_at: string
  title: string
  title_en: string | null
  slug: string | null
  content: string | null
  content_en: string | null
  excerpt: string | null
  excerpt_en: string | null
  cover_image: string | null
  banner_image_url: string | null
  category: string | null
  language: string | null
  meta_description: string | null
  published: boolean
  published_at: string | null
  read_time: number | null
  /** Array de referencias schema.org (CreativeWork / GovernmentService) para el bloque citation del JSON-LD */
  citations: Record<string, unknown>[] | null
}

// ─── Lead ─────────────────────────────────────────────────────
export interface Lead {
  name: string
  email: string
  phone?: string
  interest?: string
  message?: string
  location?: string
  source?: string
}

// ─── LeadData (form captación vender-tu-piso) ─────────────────
export interface LeadData {
  name: string
  email: string
  phone: string
  is_owner: boolean
  neighborhood: string
  property_value_range: string
  sale_timeline: string
  source?: string
}
