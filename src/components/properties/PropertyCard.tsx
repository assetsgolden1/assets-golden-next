import Link from "next/link";
import Image from "next/image";
import { MapPin, Maximize, Building2, BedDouble, Bath } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { translatePropertyType, translatePropertyTitle } from "@/lib/propertyTypes";
import { formatPrice } from "@/lib/utils/format";
import { toSentenceCase } from "@/lib/utils/normalizeText";

interface PropertyCardProps {
  id: string;
  title: string;
  slug: string;
  location: string;
  price: number | null;
  currency: string | null;
  area_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string | null;
  image_url: string | null;
  featured?: boolean;
  sold?: boolean | null;
  className?: string;
}

export default async function PropertyCard({
  id,
  title,
  slug,
  location,
  price,
  currency,
  area_sqm,
  bedrooms,
  bathrooms,
  property_type,
  image_url,
  featured,
  sold,
  className,
}: PropertyCardProps) {
  void id;
  const locale = await getLocale();
  const t = await getTranslations("Properties");

  return (
    <Link
      href={`/propiedades/${slug}`}
      className={cn(
        "group block card-premium rounded-xl overflow-hidden",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image_url ? (
          <Image
            src={image_url}
            alt={title}
            fill
            unoptimized
            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${sold ? 'opacity-60' : ''}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-40" />

        {/* Featured badge */}
        {featured && !sold && (
          <span className="absolute top-4 right-4 rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-gold border border-gold/30">
            {t("featured_label")}
          </span>
        )}

        {/* SOLD band */}
        {sold && (
          <div className="absolute top-0 right-0 z-10 overflow-hidden" style={{ width: 90, height: 90 }}>
            <div style={{
              position: 'absolute',
              top: 20,
              right: -22,
              width: 96,
              backgroundColor: '#dc2626',
              color: 'white',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textAlign: 'center',
              transform: 'rotate(45deg)',
              padding: '4px 0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
            }}>
              {t("sold_badge")}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5">
        {/* Property type */}
        {property_type && (
          <p className="text-xs sm:text-sm text-gold font-medium mb-0.5">
            {translatePropertyType(property_type, locale)}
          </p>
        )}

        {/* Title */}
        <h3 className="font-display text-sm sm:text-base text-foreground mb-1 line-clamp-2 leading-tight group-hover:text-gold transition-colors">
          {toSentenceCase(translatePropertyTitle(title, locale))}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-gold" />
          <span className="truncate">{location}</span>
        </div>

        {/* Price */}
        <p className="font-display text-lg sm:text-xl font-medium text-gold mb-2 sm:mb-3">
          {formatPrice(price, currency, locale)}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground text-xs sm:text-sm border-t border-border pt-2 sm:pt-3">
          {area_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {area_sqm} m²
            </span>
          )}
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {bedrooms}
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {bathrooms}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
