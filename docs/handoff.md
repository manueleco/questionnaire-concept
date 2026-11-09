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

## 2026-11-08T15:33:44+01:00 · feat/multilingual-demo · 20261108-153344-4a7735d8

- Rama: feat/multilingual-demo
- Commit observado: ae0dc48

## Objetivo
Demo multilingüe y conciliación con Team F

## Estado
Entrega: rama pública feat/multilingual-demo ae0dc48 y privada integration/team-f-demo 682218c subidas; main y web publicada sin cambios. Estudio privado fija plataforma ae0dc48 y tiene protocolo propuesto trilingüe con 3 s mínimos. Team F sólo leído, ningún commit/push/PR allí.

## Realizado
- Migración e importación privadas correctas; flujo completo catalán guardó y borró respuesta sintética; dos protocolos y cero sesiones en la base privada
- QC-Data/MULTILINGUAL.md y QC-Data/TEAM-F-RECONCILIATION.md documentan alcance, diferencias y pendientes

## Comprobaciones
- [passed] `Playwright`: 24 pruebas de plataforma y flujo privado completo adicional
- [passed] `manage.py test core`: 23 pruebas Django
- [passed] `npm test`: 7 pruebas JS
- [passed] `python -m unittest discover -s tests -v en estudio privado`: 3 pruebas del puente offline
- [passed] `gitleaks`: Sin hallazgos en cambios e historial de ambos repos propios
- [not_run] `Dispositivos físicos y revisión lingüística`: Pendientes; se verificó Chrome con tamaños móviles

## Pendientes
- Revisión nativa de traducciones, traducción del portal y equivalencia científica no completadas
- Servidor local de revisión del estudio en puerto 8318; servidor de QA de plataforma 8317 detenido

## Siguiente paso
Revisar demo privada local y acordar con el equipo protocolo y contrato de backend antes de integrar o reclutar

## Decisiones de este checkpoint
- Sin decisiones nuevas. Revisar `docs/decisions/` cuando sea relevante.

## 2026-11-08T15:50:03+01:00 · mpc · 20261108-155003-698d592e

- Rama: mpc
- Commit observado: ae0dc48

## Objetivo
Separar trabajo de plataforma Scroll Q y estudio MPC en dos chats

## Estado
Rama local y remota de plataforma renombrada a mpc. Cambios locales sin commit: ranking completa tercera opción tras dos elecciones, permite revisar sin avanzar automáticamente; estilos de controles y tipografía inspirados en Apple; audio conserva loop. Estudio privado sigue limpio en integration/team-f-demo con submódulo ae0dc48; todavía no contiene estos ajustes nuevos.

## Realizado
- Renombrada feat/multilingual-demo a mpc localmente y en remoto
- Implementados ranking automático editable, textos ES/EN/CA y acabado visual; pruebas de ranking y loop añadidas

## Comprobaciones
- [passed] `npm run typecheck, npm run build, npm test`: Verificados antes del checkpoint; 9 pruebas JavaScript correctas
- [passed] `Playwright suite`: Archivo .playwright/results/.last-run.json indicó passed y failedTests vacío tras la ejecución general
- [passed] `Playwright tests/browser/ranking.spec.ts`: Prueba reforzada posterior: 1 passed; escucha, auto-tercera, revisión, empate y ausencia de salto automático

## Pendientes
- Cambios de código y contexto todavía sin commit; no se ha actualizado el submódulo privado ni publicado main
- Actualizar QC-Data/BRANDBOOK.md, referencias vigentes a rama y guía de colaboración; revisión visual final pendiente
- Revisión lingüística, dispositivos físicos y acuerdo científico siguen pendientes. No se modificó ni publicó nada en el repositorio del compañero.

## Siguiente paso
En este chat de plataforma, finalizar revisión visual y documentación QC-Data, revisar cambios y entregar versión probada en mpc. Después, desde el chat privado MPC, actualizar el submódulo a esa versión y comprobar su demo.

## Decisiones de este checkpoint
- [20261108-155003-698d592e-1.md](decisions/20261108-155003-698d592e-1.md)

## 2026-11-09T12:23:35+01:00 · mpc · 20261109-122335-8af4f07c

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
