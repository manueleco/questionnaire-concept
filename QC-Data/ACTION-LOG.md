# Registro de acciones

## 2026-11-04

- Registrada la petición original y todas las ampliaciones: portal, GDPR, normalización, stack, temporización, nombre y carpeta final.
- Consultadas las skills Hallmark, Sites y security-audit (orientación). Revisadas referencias oficiales de Django, React, CC, BS.1770, GDPR y screening auditivo.
- Confirmado que GitHub `manueleco/questionnaire-concept` ya existía, público y vacío; se prepara publicación sólo de código/documentación no sensible.
- Creada vista privada Sites y actualizado título a Scroll Questionnaire. La publicación sólo incluye frontend estático; no despliega Django.
- Construidos frontend React/TypeScript, motor Web Audio, persistencia de borrador, almacenamiento local de audio y portal Django.
- Añadidas organizaciones, membresías, roles, invitaciones, versiones, preguntas/opciones, respuestas, rankings, asignaciones, tiempos y auditoría de exportación.
- Copiadas notas originales y cuatro MP3 a carpetas locales excluidas de Git. Preparados extractos 40–60 s; medidos LUFS/true peak. No normalizados ni redistribuidos.
- Construida integración opcional de resúmenes a Sheets. No conectada a ninguna cuenta ni hoja.
- Superadas comprobaciones TypeScript, build, migraciones y tests de servicio/permiso. Validado el flujo de escucha/envío/retirada en Chrome.
- Verificado diseño a 320, 375, 414, 768 y 1280 px. Se corrigió el espacio móvil y el desbordamiento vertical en pantallas bajas.
- Detectada y corregida una posible posición negativa de audio durante los 35 ms previos al arranque programado; añadida prueba de regresión.
- No se crearon cuentas con contraseña por defecto, ni se enviaron invitaciones/correos. El usuario debe crear su administrador local.

## Validación y límites

- Tests Python: 14 casos (aislamiento, roles, consentimiento, validación, CSRF, persistencia, export, invitaciones, inmutabilidad, retención y retirada).
- Tests JS: 6 casos (ranking, permutación, fórmulas CSV, reloj de audio/crossfade y posición no negativa).
- Tests navegador: 8 casos (cinco tamaños, flujo completo, audios proporcionados y conservación tras recarga).
- TypeScript y build pasan; migraciones sin cambios pendientes.
- Entorno de prueba: macOS, Chrome, Python 3.14/Django 5.2.19; runtime de Node 24 para Playwright.
- No probado PostgreSQL real, Safari/iOS/Android físico, Google Sheets autenticado, carga de producción ni configuración de proveedor.
- No equivale a auditoría de seguridad completa, validación científica o conformidad legal.
- El conector GitHub rechazó escritura (403); el usuario inició sesión mediante GitHub CLI. Verificado acceso de `manueleco` para completar el push sin exponer credenciales.
- GitHub: primer push completado en `main`, commit de implementación `334ed90461ab609fa60d029e54d3fd3a6ca06638`.
- Sites: publicación privada confirmada `succeeded`; URL registrada en `DELIVERY.md`.
- Proyecto, Git, dependencias, base local, notas y audios copiados a la carpeta definitiva; `manage.py check` pasa desde ella.

## Revisión 0.2 · Layout móvil y brandbook

- Inspeccionada referencia Awwwards y prototipo Velto; aplicada jerarquía de app con marca propia Quiet Current.
- Añadidos `app-shell.css`, navegación inferior funcional, listado de progreso y tarjetas ajustadas al alto disponible. Se mantiene navegación nativa por rueda/touch; el teclado permite leer tarjetas largas.
- Revisión visual detectó CSS no servido por la lista explícita de Django: añadido el archivo a la lista y pruebas de estilos/layout real.
- Corregida lectura con PageDown en tarjetas largas; pruebas finales de navegación pasan a 320/414/1280 px.
- Validación: 12 tests de navegador (8 de flujo/layout + 4 de navegación/modo estático), 14 Django, 6 JS; typecheck/build correctos. Las 4 pruebas de navegación se repitieron tras el ajuste final de teclado.
- Contrastes de texto medidos; capturas de bienvenida, comparación y setup inspeccionadas. Pendiente móvil físico/Safari, no cubierto por Chrome responsive.
- Permisos de `data/` y SQLite corregidos de 0755/0644 a 0700/0600. No se ha añadido cifrado ni desplegado PostgreSQL.
- Confirmados cero administradores y cero sesiones de participantes en la base local tras pruebas. No se crearon contraseñas ni se recogieron respuestas reales.
- Documentados brandbook, almacenamiento/local, decisiones, TODOs y límites de GDPR en QC-Data.

## Revisión 0.3 · Grassfeld, guía y separación de estudios

- Inspeccionada Grassfeld en navegador; dirección Clear Listening, tipografías OFL locales e ilustración propia. Guía opcional de tres pasos validada con cierre, avance, Escape y reapertura.
- 14 pruebas de navegador pasan y 18 Django (incluyendo importador nuevo); typecheck, build y check correctos. Audio/JS se mantiene con las 6 pruebas previas aprobadas.
- Importador `import_study`: valida manifiestos, rechaza edición de protocolos existentes, evita habilitar recogida real y revierte el conjunto ante errores.
- Añadido `SCROLL_DATA_DIR` para separar bases locales de distintos estudios.
- Usuario confirmó dos repos y creó `scroll-q-mpc`; se verificó PUBLIC y se cambió a PRIVATE según su elección antes de subir material.
- Primera revisión de Gitleaks: tres commits, sin secretos detectados. Se reforzaron exclusiones de archivos privados; no equivale a garantía absoluta.
- Estudiadas opciones oficiales de hosting, costes completos y requisitos operativos; no se adquirieron recursos.
