# Entrega de la prueba de concepto

Fecha: 2026-11-04.

- Producto: **Scroll Questionnaire**.
- Carpeta: `/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire`.
- GitHub: https://github.com/manueleco/questionnaire-concept.
- Demo privada publicada: https://questionnaire-sound-study-meco.inventiveflag.chatgpt.site.
- Commit de la versión web: `334ed90461ab609fa60d029e54d3fd3a6ca06638`.
- Publicación Sites confirmada como `succeeded`; no acceso público de reclutamiento.

## Qué puedes usar ahora

La demo privada permite recorrer preguntas, escuchar A/B/C sintético, importar tres archivos locales, guardar borrador, registrar tiempos, descargar y borrar datos en el navegador. La versión Django añade almacenamiento SQLite persistente, organizaciones, roles, invitaciones, creación de estudios/preguntas y exportaciones autorizadas. Incluye tus cuatro audios en la carpeta privada local y extractos comparables en duración.

El servidor Django no se ha desplegado en un proveedor externo. Para abrirlo:

```sh
cd '/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire'
.venv/bin/python manage.py runserver 127.0.0.1:8317
```

Cuestionario: http://127.0.0.1:8317/ · Portal: http://127.0.0.1:8317/portal/.

Para crear tu acceso, ejecuta `createsuperuser` y después `seed_demo --owner TU_USUARIO`, como explica `README.md`. No se han creado contraseñas predefinidas. `.venv`, `node_modules`, `dist`, la base de datos y los audios ya están presentes localmente. En otro equipo seguir la instalación del README.

## Validación

14 tests Django, 6 tests JS y 8 tests de navegador. Typecheck, build, comprobación de migraciones y `manage.py check` correctos. Se probó Chrome a 320/375/414/768/1280 px, envío/retirada, temporización y reanudación del audio importado. Los tests usan datos ficticios.

No se ha validado un despliegue PostgreSQL, configuración cloud, Google Sheets autenticado, dispositivos móviles físicos ni cumplimiento institucional. Los controles implementados no equivalen a certificación GDPR ni a validación científica. Los pasos restantes están en `ACTIONS-TODO.md`.

## Privacidad de la entrega

Audios, notas originales, respuestas locales, claves y dependencias están excluidos de Git. El artefacto publicado contiene sólo el frontend compilado. El adaptador Sheets está preparado pero desconectado. No se han enviado correos ni invitaciones a terceros.
