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
