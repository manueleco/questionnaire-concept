# Almacenamiento, portal y ejecución local

Estado comprobado: 2026-11-04. No confundir el hosting de la demo con el servidor de investigación.

| Entorno | Respuestas | Audio | Portal |
|---|---|---|---|
| Demo privada de Sites | `localStorage` del navegador; no llegan a Django | Sintético o importado a IndexedDB local | No incluye servidor de administración |
| Django local | Borrador en navegador; envío explícito a SQLite | Extractos locales o importados al navegador | `/portal/`, `/admin/` con login |
| Producción propuesta | PostgreSQL + Redis, aún sin desplegar | Almacenamiento privado pendiente | Django con TLS y controles operativos pendientes |

Archivo SQLite actual: `/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire/data/scroll-questionnaire.sqlite3`. Excluido de Git. Se restringió `data/` a `0700` y la base a `0600` tras comprobar permisos `0755`/`0644`. Sólo el propietario del sistema accede mediante permisos POSIX ordinarios; esto no protege frente a su propia cuenta comprometida ni frente a administradores del equipo. SQLite **no está cifrado por la aplicación**. No se ha verificado FileVault ni el cifrado de copias.

La demo estática almacena respuestas legibles para scripts del mismo origen y personas con acceso al perfil del navegador. El acceso privado al sitio no equivale a cifrado de esos datos. No se guardan respuestas de estudio en GitHub ni en los Markdown.

## Arranque en este equipo

Las dependencias, migraciones, build y audios ya están preparados:

```sh
cd '/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire'
umask 077
.venv/bin/python manage.py runserver 127.0.0.1:8317
```

Cuestionario: http://127.0.0.1:8317/ · Portal: http://127.0.0.1:8317/portal/ · Administración de plataforma: http://127.0.0.1:8317/admin/.

El servidor se limita a loopback: no expone este equipo a Internet ni permite probar desde otro teléfono directamente. No usar `runserver` como servicio de producción. Para una instalación nueva, seguir `README.md` de esta carpeta.

Crear una cuenta sólo si aún no tienes una; la contraseña se escribe en tu terminal:

```sh
.venv/bin/python manage.py createsuperuser
.venv/bin/python manage.py seed_demo --owner TU_USUARIO
```

El segundo comando asigna tu usuario al estudio demo. No hay contraseñas predefinidas. El portal gestiona organizaciones, miembros, roles, estudios, protocolos/preguntas y exportaciones. `/admin/` es administración de plataforma; las respuestas de investigación no se exponen como tablas editables genéricas allí.

## Qué falta para afirmar preparación GDPR

Existen minimización de datos, validación, separación de organizaciones/roles, CSRF, límites básicos, borrado mediante clave privada y exportación autorizada. **No constituyen por sí solos cumplimiento GDPR.** El reglamento combina principios y medidas técnicas/organizativas: [Comisión Europea — principios del tratamiento](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en).

Antes de recoger respuestas reales hay que identificar responsable/base jurídica, aprobar información a participantes y plazos, seleccionar proveedores/región y contratos, configurar TLS/cifrado/backups, probar restauración y derechos, programar retención y revisar acceso/MFA. Usar hosting UE es una preferencia operativa útil, no una garantía automática ni el único requisito legal posible. Véanse `PRIVACY-SECURITY.md` y `ACTIONS-TODO.md`.

PostgreSQL está configurado como requisito para el modo producción, pero no hay instancia provisionada ni pruebas de concurrencia ejecutadas allí. Sheets sigue desconectado; el adaptador de agregados no debe convertirse en copia informal sin control de acceso, retención y evaluación de reidentificación.
