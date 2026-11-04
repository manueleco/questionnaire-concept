# Scroll Questionnaire

Plataforma reutilizable de cuestionarios con navegación por scroll, pruebas auditivas A/B/C y portal de investigación. Primer caso: Music Perception & Cognition (MPC).

## Ubicación y estado

- Carpeta definitiva: `/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire`.
- GitHub solicitado: https://github.com/manueleco/questionnaire-concept.
- Nombre del producto: **Scroll Questionnaire**. El nombre del repositorio conserva el enlace indicado por el usuario.
- Stack: Django 5.2 LTS, React, TypeScript; SQLite local, PostgreSQL en producción.
- Demo funcional; **no es todavía una plataforma aprobada para recoger datos de investigación**.
- La vista publicada con Sites es estática y guarda sólo en el navegador. El portal Django y su base de datos funcionan en el servidor local.

## Arranque

Requisitos: Python 3.12+ (probado con 3.14), Node 20+, npm; FFmpeg sólo para medir/preparar audio. No hay contraseñas predefinidas.

```sh
cd '/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire'
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npm ci
npm run build
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
.venv/bin/python manage.py createsuperuser
.venv/bin/python manage.py seed_demo --owner TU_USUARIO
.venv/bin/python manage.py runserver 127.0.0.1:8317
```

Abrir http://127.0.0.1:8317 para el cuestionario y http://127.0.0.1:8317/portal/ para organizaciones y estudios. El comando `createsuperuser` solicita la contraseña en tu terminal; no introducirla en el chat. No crear ni compartir cuentas demo con contraseñas conocidas.

`npm run dev` recompila React al editar; ejecutar `npm run build` tras cambios en CSS o `public/`. Django sirve `dist/`; el servidor de desarrollo nunca es el servidor de producción.

## Probar tus audios

En la aplicación local: **About the demo → Your supplied audio → elegir 3 versiones → Use these samples**. También puedes importar tres archivos propios. Todo se decodifica en el navegador. Los cuatro originales y sus extractos están en `data/stimuli/`, excluidos de Git y de la publicación.

La demo pública utiliza una composición sintética creada en código. No contiene las grabaciones aportadas. Los originales duran unos 202 s, mono, 22.050 Hz. Los extractos locales abarcan 40–60 s y conservan sus diferencias de nivel: no son estímulos validados de saturación.

## Mapa de contexto

- `CONTEXT.md`: requisitos y cambios de alcance.
- `DECISIONS.md`: decisiones con motivos y alternativas.
- `RESEARCH-PROTOCOL.md`: diseño experimental, variables y análisis.
- `ARCHITECTURE.md`: componentes y crecimiento.
- `DATA-MODEL.md`: entidades, dependencias y normalización.
- `PRIVACY-SECURITY.md`: amenazas, controles y condiciones para GDPR.
- `QUESTION-AUTHORING.md`: añadir preguntas sin tocar React.
- `TIMING.md`: definición exacta de tiempos registrados.
- `ACTIONS-TODO.md`: trabajo terminado y pendientes.
- `FUTURE-IDEAS.md`: evolución del producto.
- `ACTION-LOG.md`: acciones y comprobaciones.
- `Inputs/mpc-project-notes.md`: copia local íntegra de las notas aportadas; excluida de Git.
- `audio-inventory.json`, `audio-measurements.json`: mediciones de los archivos aportados.

Actualizar estos documentos cuando cambie una decisión; distinguir implementación, propuesta e hipótesis. No guardar secretos, respuestas reales ni identificadores de participantes en los MDs.
