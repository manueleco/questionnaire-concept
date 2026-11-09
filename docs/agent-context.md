# Contexto del proyecto

- Actualizado: 2026-11-09T12:23:35+01:00
- Rama: mpc
- Commit observado: ae0dc48

## Objetivo
Cerrar la revisión y entrega de Scroll Questionnaire en mpc

## Estado
Plataforma verificada: ranking completa tercera opción tras dos elecciones, conserva revisión sin navegación automática y audio en loop. Brandbook 0.5 actualizado con acabado nativo, ES/EN/CA conservados. Corregido pie de pregunta que tapaba respuestas a 320 px. Trabajo limitado a este repositorio.

## Realizado
- QC-Data/BRANDBOOK.md actualizado y QC-Data/UI-REVIEW-2026-11-09.md creado con evidencia y límites
- QC-Data/COLLABORATION-WORKFLOW.md documenta separación de chats y consumo de commits fijados

## Comprobaciones
- [passed] `npm run typecheck`: Sin errores
- [passed] `npm run build`: Compilación final correcta tras ajuste de pie móvil
- [passed] `npm test`: 9 pruebas correctas
- [passed] `Playwright`: 26 pruebas correctas tras ajuste final; recorrido, idioma, persistencia, retirada y regresión de solapamiento
- [passed] `Revisión visual Chrome`: Inspeccionadas capturas 320, 375, 414, 768 y 1280 px y guía; tarjetas largas usan scroll interno
- [not_run] `Suite Django`: Backend sin cambios en esta revisión

## Pendientes
- Safari/iOS/Android físicos, lector de pantalla, zoom ampliado y revisión lingüística pendientes
- No se ha modificado el estudio privado ni repositorios de colaboradores; main y demo alojada quedan fuera de esta entrega

## Siguiente paso
Revisar y guardar commit de la entrega en mpc; publicar sólo esa rama. El chat privado podrá adoptar el commit probado posteriormente.

## Decisiones de este checkpoint
- Sin decisiones nuevas. Revisar `docs/decisions/` cuando sea relevante.
