# Publicar en la web desde el CRM (Inmoges)

Guía para Atilio. Desde ahora el CRM y la web están conectados: no hace falta volver
a cargar a mano una propiedad que ya está en el CRM.

## Cómo funciona

El CRM publica un fichero con los inmuebles marcados para el portal Kyero. La web lee
ese fichero **todos los días a las 07:00 de la mañana** y se actualiza sola.

## Qué hacer para que un inmueble aparezca en la web

1. Entrar en el CRM: `https://expertosgestion.com/inmoges4/inicio.php`
2. Abrir la ficha del inmueble.
3. Ir a la pestaña **Publicidad**.
4. Marcar la casilla **Kyero**. Guardar.
5. Ir al menú **Pasarelas → Exportar fichero en formato Kyero** y pulsar
   **Publicar inmuebles**.

A la mañana siguiente el inmueble está en la web. Si hace falta antes, se puede lanzar
la actualización a mano (ver más abajo).

## Qué se lleva la web y qué no

| Dato | ¿Lo trae del CRM? |
|---|---|
| Precio | Sí, y lo actualiza cada día |
| Fotos | Sí, en el alta |
| Ciudad, provincia, dormitorios, baños, metros | Sí |
| Descripción en español | Sí, en el alta |
| Descripción en inglés | No. El CRM no la tiene: hay que escribirla en el panel de la web |

**Importante**: si una propiedad ya estaba en la web y se editó allí (mejor título,
mejor descripción, fotos ordenadas), el CRM **no** la pisa. De esas solo se actualiza
el precio. Lo que se escribe en el panel de la web manda.

## Bajar un inmueble de la web

Desmarcar la casilla **Kyero** en el CRM no lo quita de la web. Para retirarlo hay que
ocultarlo desde el panel de administración de la web, como siempre.

## Lanzar la actualización a mano

En GitHub, pestaña **Actions** → **Sync Inmoges (CRM Expertos de Gestión)** →
botón **Run workflow**. Dos casillas opcionales:

- **Solo informe**: enseña lo que haría sin tocar la web. Útil para comprobar.
- **Completar galerías**: añade a la web las fotos que el CRM tiene de más.

## Si algo no aparece

1. Comprobar que la casilla Kyero está marcada en la ficha.
2. Comprobar que se pulsó **Publicar inmuebles** en Pasarelas después de marcarla.
3. Abrir `https://expertosgestion.com/XMLky/3440.xml` y buscar la referencia del
   inmueble. Si no está ahí, el problema está en el CRM, no en la web.
4. Si está en el fichero pero no en la web, lanzar el workflow con **Solo informe**
   y mirar qué dice.

## Detalle técnico

- Fichero: `https://expertosgestion.com/XMLky/3440.xml` (3440 = número de experto de AG).
- Script: `src/scripts/syncInmoges.ts`. Local: `npm run inmoges -- report`.
- Automatización: `.github/workflows/sync-inmoges.yml`.
- Las fotos se copian a Supabase para que entren en la copia de seguridad; la web no
  depende del servidor del CRM.
