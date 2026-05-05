# Assets Golden Next — Instrucciones para Claude Code

## 🔄 DAILY_LOG.md — Lectura obligatoria al inicio y cierre

Este proyecto usa una bitácora operativa en `DAILY_LOG.md`.
Tu trabajo como agente DEBE empezar y terminar interactuando con
ese archivo.

### Al INICIAR cada sesión

1. Leer DAILY_LOG.md completo
2. Reportar al usuario en tu primera respuesta:
   - Cuántos pendientes activos hay y en qué categorías
   - Cuál fue el último trabajo hecho (sección "Historial de sesiones")
   - Cuál es el "próximo paso sugerido" anotado
   - Si detectás conflicto entre lo que pide el usuario y los
     pendientes activos, mencionalo

### Al CERRAR cada sesión (cuando el usuario indique fin o pidás "haz
el cierre" / "actualiza el log")

1. Marcar con `[x]` los items terminados en "Pendientes activos"
2. Si descubriste pendientes nuevos durante la sesión, agregarlos
   a la sección que corresponda
3. Agregar una entrada NUEVA arriba en "Historial de sesiones" con:
   - Fecha (formato YYYY-MM-DD)
   - Título descriptivo de la sesión
   - Contexto: qué pidió el usuario
   - Trabajo hecho: bullets de cambios concretos
   - Archivos tocados: CREATED/MODIFIED/DELETED
   - Commits: hashes y mensajes (si los hubo)
   - Próximo paso sugerido: qué hacer la próxima sesión
4. NO borres entradas viejas del historial — es append-only
5. NO modifiques entradas pasadas — solo agregar arriba

### Reglas de honestidad

- NO marques `[x]` un item si no lo terminaste de verdad
- Si un item quedó parcial, dejalo `[ ]` y anotá el progreso parcial
  en el historial de la sesión
- Si surgió un blocker que impide completar un item, marcalo en el
  item con sufijo `(BLOQUEADO: razón)` y mencionalo en el historial
- Si un commit no llegó a hacerse (porque el usuario no dio OK),
  anotalo como "(pendiente de OK del usuario)"

### Cuándo NO actualizar el log

- Sesiones puramente de diagnóstico/lectura sin modificar código →
  no requiere entrada en historial
- Tareas triviales de < 5 minutos sin cambios persistentes → no
  requiere entrada
- Si el usuario explícitamente dice "no actualices el log" → respetar

---

@AGENTS.md
