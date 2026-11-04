# Entrega de la prueba de concepto

Fecha: 2026-11-04.

- Producto: **Scroll Questionnaire**.
- Carpeta: `/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire`.
- GitHub: https://github.com/manueleco/questionnaire-concept.
- Demo privada publicada: https://questionnaire-sound-study-meco.inventiveflag.chatgpt.site.
- Commit de la primera versión web: `334ed90461ab609fa60d029e54d3fd3a6ca06638`.
- Publicación Sites confirmada como `succeeded`; no acceso público de reclutamiento.

## Qué puedes usar ahora

La revisión 0.3 incorpora identidad Clear Listening y guía breve, navegación inferior y ajuste de tarjetas al viewport; ver `BRANDBOOK.md`. Para ubicación de datos y administración, ver `STORAGE-AND-LOCAL.md`.

La demo privada permite recorrer preguntas, escuchar A/B/C sintético, importar tres archivos locales, guardar borrador, registrar tiempos, descargar y borrar datos en el navegador. La versión Django añade almacenamiento SQLite persistente, organizaciones, roles, invitaciones, creación de estudios/preguntas y exportaciones autorizadas. Incluye tus cuatro audios en la carpeta privada local y extractos comparables en duración.

El servidor Django no se ha desplegado en un proveedor externo. Para abrirlo:

```sh
cd '/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire'
.venv/bin/python manage.py runserver 127.0.0.1:8317
```

Cuestionario: http://127.0.0.1:8317/ · Portal: http://127.0.0.1:8317/portal/.

Para crear tu acceso, ejecuta `createsuperuser` y después `seed_demo --owner TU_USUARIO`, como explica `README.md`. No se han creado contraseñas predefinidas. `.venv`, `node_modules`, `dist`, la base de datos y los audios ya están presentes localmente. En otro equipo seguir la instalación del README.

## Validación

18 tests Django, 6 tests JS y 14 tests de navegador en la revisión 0.3. Typecheck, build, comprobación de migraciones y `manage.py check` correctos. Se probó Chrome a 320/375/414/768/1280 px, envío/retirada, temporización y reanudación del audio importado. Los tests usan datos ficticios.

No se ha validado un despliegue PostgreSQL, configuración cloud, Google Sheets autenticado, dispositivos móviles físicos ni cumplimiento institucional. Los controles implementados no equivalen a certificación GDPR ni a validación científica. Los pasos restantes están en `ACTIONS-TODO.md`.

## Privacidad de la entrega

Audios, notas originales, respuestas locales, claves y dependencias están excluidos de Git. El artefacto publicado contiene sólo el frontend compilado. El adaptador Sheets está preparado pero desconectado. No se han enviado correos ni invitaciones a terceros.

## Entrega final de revisión 0.3

Interfaz publicada con éxito desde `e29831b284358403ca91c30fc5bc482816afcf28`: Clear Listening, referencia Grassfeld y guía opcional. La audiencia de Sites continúa privada.

Estudio separado: `https://github.com/manueleco/scroll-q-mpc` (PRIVATE), carpeta `/Users/meco/MBP Files/Gits/personales/scroll-q-mpc`. Commit inicial `9f5caff`; submódulo fijado al mismo commit de plataforma de la publicación visual. Arranque independiente probado en 8318, con base propia, un protocolo y cero respuestas. Sigue en modo demo hasta aprobar condiciones científicas y de privacidad.

Gitleaks no detectó secretos en los cinco commits de plataforma ni en el commit inicial de clase; tampoco se versionaron bases, `.env` reales, notas originales o audios. Las fuentes gráficas incluidas son OFL y sus licencias acompañan los archivos. No se crearon recursos de DigitalOcean ni se desplegó el backend en Atlas.

Los servidores temporales de verificación se detienen al cerrar la entrega. Para volver a ejecutar el estudio: `cd '/Users/meco/MBP Files/Gits/personales/scroll-q-mpc'` y `./scripts/manage.sh runserver 127.0.0.1:8318`. La demo web publicada permanece disponible.
