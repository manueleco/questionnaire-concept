# Historial de trabajo

Las entradas automáticas se agregan al final, con fecha y rama.

## 2026-11-08T15:15:33+01:00 · feat/multilingual-demo · 20261108-151533-a31bca9a

- Rama: feat/multilingual-demo
- Commit observado: 03721bb

## Objetivo
Demo multilingüe y conciliación con Team F

## Estado
Ramas feat/multilingual-demo en plataforma e integration/team-f-demo en estudio privado. Revisión externa exclusivamente de lectura; Team F tiene 13 idiomas y envío configurable sin persistencia por defecto.

## Realizado
- Revisado código local y referencia externa

## Comprobaciones
- [not_run] `Pruebas de esta revisión`: Implementación aún no iniciada

## Pendientes
- Implementación y pruebas

## Siguiente paso
Implementar catálogos y almacenamiento del idioma; preparar conciliación privada y pruebas

## Decisiones de este checkpoint
- [20261108-151533-a31bca9a-1.md](decisions/20261108-151533-a31bca9a-1.md)
- [20261108-151533-a31bca9a-2.md](decisions/20261108-151533-a31bca9a-2.md)

## 2026-11-08T15:29:49+01:00 · feat/multilingual-demo · 20261108-152949-fb70c0d4

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
