# Registro de decisiones

| ID | Decisión | Motivo y alcance |
|---|---|---|
| D01 | Django 5.2 LTS + React/TypeScript | Backend maduro con autenticación/ORM/migraciones; frontend mantenible para audio y estados. Python facilita análisis científico. Aceptado por usuario. Laravel también sería viable; no hay necesidad de migrar por escalabilidad. |
| D02 | Monolito modular inicial | Evita coordinación prematura de microservicios. Separar aplicaciones de dominio al crecer. |
| D03 | PostgreSQL producción; SQLite desarrollo | Migraciones de Django compartidas. SQLite permite probar inmediatamente; no usarlo como backend multinstancia de producción. |
| D04 | Base de datos como fuente de verdad | Sheets es una vista/exportación; no debe gobernar transacciones, permisos ni el orden de respuestas. |
| D05 | Protocolos publicados inmutables | Cada sesión referencia una versión concreta; se clona para cambiar preguntas. |
| D06 | Organización determina el alcance | Los roles son por organización; no son privilegios globales del usuario. |
| D07 | Preguntas declarativas | Ranking, elección única/múltiple, texto y escala 1–7 se añaden desde el portal. |
| D08 | Scroll tras responder + alternativa explícita | No avanzar por escoger accidentalmente una opción; continuar por scroll o botón. Permitir volver y cambiar antes de enviar. |
| D09 | A/B/C neutros y mapeo aleatorio | No colorear condiciones ni mostrar procesamiento durante la comparación. Se conserva el mapeo para analizar. |
| D10 | Reloj de audio único | Tres buffers sincronizados; crossfade lineal de 15 ms. Evita reiniciar el fragmento y reduce clics. Debe probarse perceptualmente antes del estudio. |
| D11 | Claridad y aspereza separadas | Una versión puede ser clara y áspera a la vez. No usar “clear (less harsh)”. |
| D12 | Emoción expresada por la música | Elección provisional informada por notas, pendiente de cerrar con equipo. No mezclar con emoción sentida. |
| D13 | Gamificación por participación | Progreso, final de sesión y agradecimiento; sin puntuación de oído, aciertos, ranking ni etiquetas de personalidad. |
| D14 | Tiempos discretos y no visibles | Activo, transcurrido y escucha separados; no mostrar cuenta atrás al participante. |
| D15 | Demo sintética públicamente; MP3 localmente | Derechos de redistribución no confirmados. Los archivos privados no entran en Git/Sites. |
| D16 | Sin servicios externos en cliente | Fuentes locales, sin analítica, píxeles ni audio remoto de terceros. React se empaqueta localmente. |
| D17 | Roles owner/admin/researcher/analyst/viewer | Owner crea org; admin gestiona colaboradores; researcher edita; analyst exporta; viewer sólo metadatos. |
| D18 | Invitaciones manuales, de un uso y 72 h | Token aleatorio, sólo hash en BD; no se envían correos automáticamente. |
| D19 | Vista privada Sites separada del backend | Sites ejecuta la demo estática. No soporta este servidor Python; desplegar Django requiere proveedor de aplicaciones y PostgreSQL aprobados. |
| D20 | No declarar “GDPR compliant” ni “5FN certificada” | Requieren definición de dependencias, configuración real, responsabilidades institucionales y revisión. Se entregan controles y evidencia, con límites explícitos. |

Fuentes de arquitectura: [escalado de Django](https://docs.djangoproject.com/en/5.2/faq/general/#does-django-scale), [soporte de versiones](https://www.djangoproject.com/download/), [React y frameworks](https://react.dev/learn/creating-a-react-app), [Laravel deployment](https://laravel.com/docs/12.x/deployment). Fecha de consulta: 2026-11-04.

## 2026-11-04 · Quiet Current y navegación móvil

- Adoptar petróleo/menta/neutros, tipografía del sistema y botones tinta sin sombra dura; brandbook en `BRANDBOOK.md`. Comodidad es hipótesis de UX, no una afirmación psicológica universal.
- Cuatro destinos inferiores: Home, Listen, Progress, Info. Progreso real y revisión de pasos desbloqueados; no premios por rapidez.
- Secciones del alto disponible con snap nativo y tarjetas largas desplazables dentro de él. Evita que una tarjeta alta elimine el siguiente punto de ajuste; navegación explícita al inicio de la tarjeta.
- Conservar backend local SQLite y futuro PostgreSQL. La publicación Sites sólo entrega frontend, sin centralizar respuestas. No declarar cumplimiento GDPR ni cifrado de SQLite.
- Mantener frontend servido mediante lista explícita de archivos; añadir únicamente `app-shell.css`. Restringir permisos locales de `data/` y SQLite.

## 2026-11-04 · Separación y nueva referencia visual

- Usuario elige plataforma pública + estudio MPC privado; el repo de clase fija un commit de plataforma. No se crean dos ramas permanentes de producto.
- Manifiesto importable con validación, idempotencia e inmutabilidad; SQLite local separado mediante `SCROLL_DATA_DIR`.
- Grassfeld sustituye la dirección de Quiet Current. Clear Listening usa titulares compactos, panel azul claro y guía opcional de tres pasos. Fuentes OFL autohospedadas; no imágenes ni fuentes comerciales copiadas.
- Hosting: recomendación documentada en HOSTING-OPTIONS; ninguna compra ni recurso cloud creado. El presupuesto completo incluye caché/almacenamiento, no sólo el contenedor.

## 2026-11-04 · Coste y claridad móvil

- Droplet elegido por el usuario; App Platform queda como alternativa futura, no recomendación activa. Sin contratar servicios.
- Orgs/personal para ambos repositorios y futuros trabajos de este contexto.
- UI 0.4: preguntas sobrias, menos ornamento y redundancia, dock compacto y CTA accesible en tarjetas largas.
- Corregir el mínimo intrínseco de la waveform; comprobar scrollWidth por tarjeta y diálogo, no sólo por documento.
