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
