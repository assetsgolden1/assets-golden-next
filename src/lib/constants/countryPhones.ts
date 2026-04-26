export const PHONE_COUNTRIES = [
  { code: 'ES', name: 'España', prefix: '+34', flag: '🇪🇸' },
  { code: 'MX', name: 'México', prefix: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', prefix: '+54', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', prefix: '+57', flag: '🇨🇴' },
  { code: 'US', name: 'Estados Unidos', prefix: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'Reino Unido', prefix: '+44', flag: '🇬🇧' },
  { code: 'FR', name: 'Francia', prefix: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', prefix: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italia', prefix: '+39', flag: '🇮🇹' },
  { code: 'AE', name: 'EAU', prefix: '+971', flag: '🇦🇪' },
] as const

export const DEFAULT_COUNTRY = PHONE_COUNTRIES[0]
