import Link from "next/link";
import Image from "next/image";
import { MapPin, Maximize, Building2, BedDouble, Bath } from "lucide-react";
import { cn } from "@/lib/utils";
import { translatePropertyType, translatePropertyTitle } from "@/lib/propertyTypes";

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
  className?: string;
}

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return "Precio a consultar";
  const formatted = price.toLocaleString("es-ES");
  if (currency === "EUR") return `${formatted} €`;
  if (currency === "USD") return `$${formatted}`;
  if (currency === "GBP") return `£${formatted}`;
  return `${formatted} ${currency ?? ""}`;
}

export default function PropertyCard({
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
  className,
}: PropertyCardProps) {
  void id;
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
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Gradient overlay — ligero, solo para legibilidad del badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-40" />

        {/* Featured badge */}
        {featured && (
          <span className="absolute top-4 right-4 rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-gold border border-gold/30">
            Destacada
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Tipo de inmueble */}
        {property_type && (
          <p className="text-sm text-gold font-medium mb-0.5">
            {translatePropertyType(property_type)}
          </p>
        )}

        {/* Título */}
        <h3 className="font-display text-base text-foreground mb-1 line-clamp-1 group-hover:text-gold transition-colors">
          {translatePropertyTitle(title)}
        </h3>

        {/* Ubicación */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 shrink-0 text-gold" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Precio — prominente en gold */}
        <p className="font-display text-xl font-medium text-gold mb-3">
          {formatPrice(price, currency)}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm border-t border-border pt-3">
          {area_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {area_sqm} m²
            </span>
          )}
          {bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {bedrooms}
            </span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {bathrooms}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
