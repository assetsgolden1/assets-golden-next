/**
 * Portales externos a los que el asesor accede desde su sección del portal.
 *
 * Nota sobre el autorelleno: el login de Expertos de Gestión NO admite prellenar
 * el Nº de experto por URL. Su formulario trae `value=""` fijo y se envía por AJAX
 * (`index.php?accion=identificar`) sin leer nunca la query string — verificado
 * sobre su `js/index.js`. Por eso el número se muestra junto al botón con un
 * "copiar", que es el sustituto práctico del autorelleno.
 */
export const EXPERTOS_GESTION = {
  name: 'Expertos de Gestión',
  description: 'Gestoría y trámites para operaciones inmobiliarias',
  url: 'https://expertosgestion.com/inmoges4/inicio.php',
  /** Nº de experto de Assets Golden. Es el mismo para todos los asesores. */
  expertNumber: '3440',
} as const
