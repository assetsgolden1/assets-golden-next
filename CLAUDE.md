# ⚠️ PROTOCOLO DE SESIÓN — LEER PRIMERO (obligatorio para cualquier agente IA)

Este proyecto mantiene su contexto en 3 archivos. Su uso NO es opcional:

1. **ESTADO.md** — Foto del estado ACTUAL del proyecto. Leelo al ARRANCAR para tener contexto inmediato. Es la verdad vigente (no el historial).
2. **PENDIENTES.md** — Backlog vivo de tareas. Leelo al ARRANCAR para saber qué falta. Es la fuente de qué hacer a continuación.
3. **DAILY_LOG.md** — Historial cronológico. Solo se le AGREGA; nunca se reescribe lo viejo.

## Al ARRANCAR cualquier sesión:
- Leer ESTADO.md y PENDIENTES.md ANTES de actuar. Con eso tenés el contexto vigente y el backlog.
- DAILY_LOG.md solo si necesitás reconstruir cómo se llegó a algo.
- Reportar al usuario en tu primera respuesta:
  - Cuántos pendientes activos hay y en qué categorías (de PENDIENTES.md).
  - Cuál fue el último trabajo hecho (entrada más reciente de DAILY_LOG.md).
  - Cuál es el "próximo paso sugerido" anotado.
  - Si detectás conflicto entre lo que pide el usuario y los pendientes activos, mencionalo.

## Al CERRAR cualquier sesión en la que se hizo un cambio:
1. **DAILY_LOG.md** → agregar una entrada NUEVA arriba (append-only) con:
   - Fecha (formato YYYY-MM-DD)
   - Título descriptivo de la sesión
   - Contexto: qué pidió el usuario
   - Trabajo hecho: bullets de cambios concretos
   - Archivos tocados: CREATED/MODIFIED/DELETED
   - Commits: hashes y mensajes (si los hubo)
   - Próximo paso sugerido: qué hacer la próxima sesión
   - NO borres ni modifiques entradas viejas — solo se agrega arriba.
2. **PENDIENTES.md** → tachar/quitar lo resuelto (mover a "Hecho reciente" o borrar) y agregar lo nuevo que haya surgido.
3. **ESTADO.md** → actualizar números/estado si cambiaron (catálogo, deploys, features).

Mantener estos 3 archivos al día es parte de "terminar la tarea". Una tarea sin sus .md actualizados NO está cerrada.

## Reglas de honestidad
- NO marques como hecho un item si no lo terminaste de verdad.
- Si un item quedó parcial, dejalo pendiente y anotá el progreso parcial en la entrada del DAILY_LOG.
- Si surgió un blocker que impide completar un item, marcalo en PENDIENTES.md con sufijo `(BLOQUEADO: razón)` y mencionalo en el historial.
- Si un commit no llegó a hacerse (porque el usuario no dio OK), anotalo como "(pendiente de OK del usuario)".

## Cuándo NO actualizar la bitácora
- Sesiones puramente de diagnóstico/lectura sin modificar código → no requiere entrada en DAILY_LOG.
- Tareas triviales de < 5 minutos sin cambios persistentes → no requiere entrada.
- Si el usuario explícitamente dice "no actualices el log" → respetar.

---

# Assets Golden Next — Instrucciones para Claude Code

@AGENTS.md
