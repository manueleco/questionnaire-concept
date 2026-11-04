# Plataforma pública y estudio privado

Decisión del usuario, 2026-11-04: **dos repositorios**, sin duplicar el desarrollo de la aplicación.

| Repositorio | Función | No contiene |
|---|---|---|
| `manueleco/questionnaire-concept` (público) | Scroll Questionnaire reutilizable, demo de audio sintético, UI/portal, tests, importador de estudios y documentación técnica | Secretos, `.env` reales, bases locales, grabaciones restringidas, respuestas de participantes |
| `manueleco/scroll-q-mpc` (privado) | Manifiesto de estudio MPC, protocolo, configuración de lanzamiento y contexto de clase; plataforma como submódulo fijado a un commit | Contraseñas, claves, exportaciones de participantes ni audio sin derechos de distribución |

El usuario creó el segundo repositorio público; tras su elección explícita de repositorio de clase privado se cambió a PRIVATE antes de subir archivos. No se añadieron colaboradores.

Un submódulo fija exactamente el código utilizado. Actualizarlo es una acción explícita con revisión y tests, no seguir `main` automáticamente durante la recogida. Publicar código y publicar datos son decisiones separadas. Ni siquiera un repo privado debe convertirse en base de datos de participantes.

El estudio declara organización, estudio, protocolo y preguntas en JSON. `manage.py import_study ruta/manifest.json` valida y crea una versión demo inmutable. Reimportar el mismo manifiesto es idempotente; cambiarlo obliga a crear nueva versión/ID. `--owner` asigna una cuenta ya existente, sin contraseñas compartidas. No habilita por sí mismo recogida científica.

`SCROLL_DATA_DIR` permite que cada checkout de estudio tenga su propia carpeta de SQLite/estímulos. En producción, usar bases/usuarios y secretos de despliegue separados. No copiar `.openai/hosting.json` de la demo como identidad del despliegue de clase: el submódulo la contiene sólo como referencia histórica del producto.

## Control de publicación

`.env.example` es una plantilla de nombres y valores ficticios; Django no carga `.env` automáticamente. `.gitignore` excluye datos, exportaciones, claves privadas, credenciales de servicio y audio. No es una garantía: antes de publicar, revisar archivos indexados e historial con `gitleaks git --redact --no-banner --log-opts='--all' .`. En la revisión inicial, Gitleaks no encontró secretos en los tres commits existentes. Registrar de nuevo la comprobación al cerrar la separación.

El repo público conserva documentación general del caso MPC como ejemplo de investigación. El estudio privado es la autoridad de su protocolo operativo y aprobaciones. Cualquier resultado público futuro debe pasar por revisión de anonimización, licencia y autorización.

## Ubicación local vigente

- Plataforma: `/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire`.
- Estudio: `/Users/meco/MBP Files/Orgs/personal/scroll-q-mpc`.

Traslado autorizado por la preferencia explícita de trabajar en Orgs. Cada carpeta conserva su `.git`; `platform/` sigue siendo submódulo. Datos y entornos locales se conservaron, sin copiarlos a Git.
