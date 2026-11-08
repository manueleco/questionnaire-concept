# Contexto del proyecto

- Actualizado: 2026-11-08T15:29:49+01:00
- Rama: feat/multilingual-demo
- Commit observado: 03721bb

## Objetivo
Demo multilingüe y conciliación con Team F

## Estado
Recorrido participante EN/ES/CA implementado en feat/multilingual-demo. Catálogos propios, preguntas traducidas en tablas relacionales, idioma por sesión/consentimiento/respuesta, escucha mínima configurable. Propuesta y adaptador offline en repo privado; externo sólo lectura.

## Realizado
- 24 pruebas navegador, 23 Django y 7 JS aprobadas; typecheck/build y migraciones sin drift
- 3 pruebas del puente privado aprobadas

## Comprobaciones
- [passed] `npm run typecheck y npm run build`: Compilación sin errores
- [passed] `manage.py test core`: 23 pruebas
- [passed] `Playwright`: 24 pruebas; cambio de idioma durante audio conserva datos
- [passed] `npm test`: 7 pruebas de audio/modelo/catálogos
- [failed] `impeccable detect`: Advertencias de texto pequeño y eyebrow existentes; se elevaron controles a 11px y se revisó móvil, no se rehízo la identidad

## Pendientes
- Portal administrativo en inglés; revisión lingüística y acuerdo científico del equipo pendientes

## Siguiente paso
Fijar submódulo privado a versión probada, importar propuesta y comprobar arranque; guardar ramas sin mezclar main

## Decisiones de este checkpoint
- Sin decisiones nuevas. Revisar `docs/decisions/` cuando sea relevante.
