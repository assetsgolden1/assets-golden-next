# Assets Golden — Documento de entrega de la web

**Para:** Atilio Montironi y Joan
**De:** Iván (IBott)
**Fecha:** 22 de septiembre de 2026

Este documento explica qué es lo que reciben, dónde vive cada pieza de la web, cuánto cuesta mantenerla, qué hace sola y qué hacer si algo falla. No hace falta saber programar para leerlo.

---

## 1. Qué reciben

La web **assetsgolden.com** completa y en funcionamiento, ahora alojada en cuentas que son de Assets Golden:

- El sitio público en español e inglés, con unas 2.700 propiedades publicadas en 13 países, blog, destinos, equipo y páginas legales.
- El **panel de administración** (`assetsgolden.com/admin`) para cargar y editar propiedades, destinos, blog, equipo, agentes y ver los contactos recibidos.
- El **portal de agentes** (`assetsgolden.com/portal`), donde los colaboradores buscan propiedades y descargan fichas en PDF.
- Los **6 formularios de contacto**, que guardan cada consulta en tres lugares a la vez: la base de datos, una hoja de Google y un aviso por email a `hola@assetsgolden.com`.
- Las automatizaciones: actualización semanal del catálogo de obra nueva, y recogida cada hora de los contactos que llegan por los anuncios de Meta, con su secuencia de emails.

Hasta ahora todo esto estaba en cuentas personales de Iván. Desde el 20 de septiembre de 2026 está en cuentas de Assets Golden. **Para los visitantes no cambió nada**: misma dirección, mismo contenido, sin cortes durante el traspaso.

---

## 2. Las cuentas

Todas se crearon con la cuenta de correo de Assets Golden que les entrega Iván junto con este documento. Con ese correo y su contraseña se entra a todo.

| Servicio | Para qué sirve | Plan | Dirección |
|---|---|---|---|
| **Vercel** | Es el "hosting": donde está publicada la web y conectado el dominio | Pro (de pago) | vercel.com |
| **Supabase** | La base de datos: propiedades, contactos, usuarios del panel y del portal, y todas las fotos propias | Pro (de pago) | supabase.com |
| **GitHub** | Donde se guarda el código de la web y su historial. Usuario: `assetsgolden1` | Gratuito | github.com |
| **Google Cloud + Google Sheets** | Las dos hojas de cálculo donde caen los contactos, y el "usuario robot" que escribe en ellas | Gratuito | console.cloud.google.com · drive.google.com |
| **Resend** | Envía los emails automáticos (avisos de contacto y secuencia a los interesados) | Gratuito | resend.com |
| **Upstash** | Protección del panel de administración contra abuso | Gratuito | upstash.com |
| **IONOS** | El dominio `assetsgolden.com` y los buzones de correo. Ya era de ustedes; no se tocó | El que ya tienen | ionos.es |
| **Google Analytics y Search Console** | Estadísticas de visitas y posicionamiento en Google. Ya estaban en `assetsgolden1@gmail.com` | Gratuito | analytics.google.com |

### Lo que sigue a nombre de Iván

**Meta (Facebook e Instagram):** el administrador comercial, el píxel de seguimiento y los formularios de anuncios siguen en la cuenta de Iván, porque Assets Golden todavía no tiene un administrador comercial propio. La web funciona igual. Queda pendiente crear el de Assets Golden y traspasarlo cuando se decida.

---

## 3. Cuánto cuesta al mes

| Concepto | Importe aproximado |
|---|---|
| Vercel Pro | 20 USD por cada persona con acceso al equipo |
| Supabase Pro | 25 USD (incluye el servidor de la base de datos y hasta 100 GB de archivos; hoy se usan unos 4 GB) |
| GitHub, Google, Resend, Upstash | 0 |
| **Total** | **unos 45 USD al mes**, más impuestos |

Dos cosas a tener en cuenta:

- En Vercel **cada usuario adicional es otro asiento de 20 USD**. Conviene que entren todos con la misma cuenta compartida en lugar de invitar a más personas.
- Ambos servicios cobran aparte si se superan los límites incluidos (muchísimas visitas, o cientos de GB de fotos). Con el uso actual se está muy lejos. En los dos paneles se puede poner un **tope de gasto** y es recomendable hacerlo.

Por qué no sirven los planes gratuitos: la web tiene unas 2.700 fichas que se regeneran periódicamente y más de 4 GB de fotos que se sirven optimizadas. El plan gratuito de Supabase admite 1 GB y no optimiza imágenes; el de Vercel ya se quedó corto dos veces este año.

---

## 4. Qué hace la web sola

| Tarea | Cuándo | Qué hace |
|---|---|---|
| Actualización del catálogo de obra nueva | Lunes a las 5:00 (hora de España) | Lee el catálogo del proveedor (HabiHub), añade las propiedades nuevas, actualiza precios y **oculta** las que ya no están. Nunca borra. |
| Alta de propiedades desde el CRM | Todos los días a las 7:00 (hora de España) | Lee los inmuebles que ustedes marcan con la casilla **Kyero** en Inmoges y los publica en la web con sus fotos. A los que ya estaban publicados solo les actualiza el precio: no toca el título, la descripción ni las fotos que se hayan editado en el panel. |
| Recogida de contactos de Meta | Cada hora | Trae los contactos nuevos de los anuncios y los añade a la hoja "Leads Meta". No duplica. |
| Secuencia de emails | Todos los días a las 11:00 | Envía el siguiente email a cada interesado de Meta. **Si en la pestaña CRM de la hoja el contacto figura como "en conversación", "visita", "ganado", "perdido", etc., deja de escribirle.** |
| Copia de seguridad | Todas las noches (y los domingos, también las fotos) | Guarda una copia de la base de datos fuera de Supabase. Las copias se conservan 90 días. |
| Publicación de cambios | Cuando Iván sube una mejora | La web se actualiza sola en unos 5 minutos, sin corte. |

**Importante sobre las hojas de Google:** no cambien el nombre de las pestañas (`Hoja 1`, `LEADS`, `CRM`) ni el orden de las columnas. La web escribe en ellas por posición. Pueden añadir columnas a la derecha, filtrar, colorear y anotar sin problema.

---

## 5. Tareas habituales

**Cargar o editar una propiedad:** `/admin` → Propiedades → Nueva propiedad, o el lápiz sobre una existente. Las fotos se comprimen solas al subirlas. El cambio se ve en la web pública en unos minutos; la portada y los listados pueden tardar hasta 12 horas en refrescarse por completo.

**Dar de alta a un agente colaborador:** `/admin` → Agentes → Nuevo agente. El panel genera una contraseña temporal que hay que pasarle al agente; con ella entra por `/portal`. Si la olvida, desde la misma pantalla se le envía un email para restablecerla. Desde ahí también se le puede desactivar.

**Ver los contactos recibidos:** `/admin` → Leads, o directamente la hoja de Google "Contactos Web". La regla de la casa es **no borrar contactos**: se marcan como descartados.

**Publicar en la web una propiedad del CRM:** en Inmoges, abrir la ficha → pestaña **Publicidad** → marcar **Kyero** → guardar. Después, menú **Pasarelas → Exportar fichero en formato Kyero** → **Publicar inmuebles**. A la mañana siguiente está en la web. El paso a paso completo, con qué datos se traen y qué hacer si algo no aparece, está en `docs/inmoges-crm-web.md`.

**Ocultar una propiedad vendida:** editarla y marcar "Oculta" o "Vendida". No hace falta borrarla.

---

## 6. Si algo falla

| Síntoma | Qué mirar primero |
|---|---|
| La web no carga | vercel-status.com y status.supabase.com. Si ambos están en verde, avisar a Iván. |
| Un formulario da error al enviar | Avisar a Iván de inmediato: significa que no se están guardando contactos. |
| Llegan contactos al panel pero no a la hoja de Google | Comprobar que nadie haya renombrado la pestaña ni quitado el acceso al usuario robot (`assets-golden-sheets@…`) en el botón Compartir de la hoja. |
| No llegan los emails de aviso | Entrar a Resend → Emails y ver si figuran como enviados. Revisar también la carpeta de spam de `hola@`. |
| Un agente no puede entrar al portal | `/admin` → Agentes → comprobar que está activo → "Enviar restablecimiento de contraseña". |
| Faltan fotos en una propiedad | Suele ser una foto original de más de 25 MB. Volver a subirla desde el panel, que la comprime. |
| Aviso de pago fallido de Vercel o Supabase | Actualizar la tarjeta en el panel correspondiente cuanto antes. Si la cuenta se suspende, la web se cae. |

**Contacto de soporte:** Iván (IBott).

---

## 7. Seguridad: tres cosas que conviene hacer esta semana

1. **Cambiar la contraseña** de la cuenta de correo compartida y de cada servicio una vez recibida, y guardarlas en un gestor de contraseñas.
2. **Activar la verificación en dos pasos** en todos los servicios, con un método al que puedan acceder los dos (una aplicación de autenticación y los códigos de respaldo guardados en lugar seguro). Si se pierde el acceso a Vercel o a Supabase, se pierde el control de la web.
3. **Poner un tope de gasto** en Vercel (Settings → Billing → Spend Management) y en Supabase (Organization → Billing → Spend cap).

Durante el traspaso se renovó la clave maestra de la base de datos y se desactivó la anterior, de modo que ninguna copia antigua da acceso.

---

## 8. Qué acceso conserva Iván

Iván sigue entrando con la misma cuenta compartida para dar mantenimiento y hacer mejoras. Si en el futuro se quiere que deje de tener acceso, basta con cambiar las contraseñas.

---

## 9. Pendientes conocidos

- Crear el administrador comercial de Meta de Assets Golden y traspasar el píxel y los formularios de anuncios.
- Aceptar los acuerdos de tratamiento de datos (DPA) en los paneles de Supabase, Vercel, Google, Resend y Upstash, ahora que las cuentas son de Assets Golden. Es lo que respalda la política de privacidad publicada.
- Mejoras de posicionamiento y contenido ya identificadas (informe de agosto de 2026), a ritmo normal de trabajo.
