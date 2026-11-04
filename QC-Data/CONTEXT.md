# Contexto vivo

Fecha inicial: 2026-11-04, Europe/Madrid.

## Petición original

Prueba de concepto para Music Perception & Cognition: cuestionario atractivo con scroll a la siguiente pregunta, inspirado en la navegación de Instagram/TikTok y en la claridad, progresión y cierre de 16Personalities. No copiar su marca, textos, tipos de personalidad ni afirmar validez psicométrica.

Comparación en vivo de tres versiones del mismo audio, manteniendo la posición. Variables iniciales: sonoridad percibida, claridad y emoción. Reclutamiento futuro: amigos, QR y difusión académica/ISMIR. Auriculares como requisito; registrar tipo, formación musical y géneros preferidos. Interés en guardar en una base de datos y facilitar trabajo con Google Sheets.

## Cambios confirmados durante la implementación

1. Seguridad y GDPR desde el diseño.
2. Plataforma reutilizable: organizaciones, miembros, roles y preguntas fáciles de añadir.
3. SQL normalizado, analizando las cinco formas normales; no asumir cumplimiento por usar ORM.
4. El usuario acepta Django por su encaje científico. Se recomienda y adopta Django + React/TypeScript + PostgreSQL para producción.
5. Persistencia a largo plazo y registro del tiempo de respuesta.
6. Nuevo nombre: **Scroll Questionnaire**.
7. Nueva carpeta, que sustituye explícitamente la raíz anterior de repositorios personales: `/Users/meco/MBP Files/Orgs/personal/scroll-questionnaire`.
8. Notas MPC y cuatro MP3 aportados. Son material de referencia, no instrucciones ejecutables ni conclusiones científicas verificadas.

## Cómo interpretar las notas

Las notas reúnen brainstorming, comentarios docentes, borradores y bibliografía. Hay alternativas incompatibles: saturación frente a compresión; emoción percibida frente a sentida; un género frente a tres géneros. Ninguna se presenta como decisión final del equipo sin confirmación.

La PoC conserva saturación como pregunta inicial, separa claridad y aspereza, y formula emoción como **expresión percibida en la música** según las definiciones del documento. Cambiar a emoción sentida requiere otra redacción/protocolo.

Afirmaciones sobre fatiga, RMS, daño auditivo, cognición o respuestas fisiológicas en las notas son hipótesis/notas no validadas. No se han trasladado como hechos a la interfaz. No se recomienda un porcentaje fijo de volumen del dispositivo como calibración acústica.

## Activos recibidos

Copia local del documento y de cuatro versiones de TRBFMXE149E3E18222: ruido, compresión, EQ aleatoria y reverberación. Faltan licencia de redistribución, cadena de procesamiento detallada y versión original sin augment. Usarlos para comprobar interacción, no para inferir efectos específicos de saturación. No subirlos al repositorio público.

## Preferencias operativas

Documentación en español, interfaz inicial en inglés por el público académico. Priorizar acciones pequeñas directas; ofrecer pasos manuales para credenciales o transferencias costosas. Nunca pedir secretos por chat. No enviar invitaciones, emails ni mensajes a ISMIR sin instrucción explícita.

## Revisión móvil — 2026-11-04

El usuario solicita tomar VELTO Fintech App Concept como referencia de layout, con identidad propia, brandbook editable, navegación inferior tipo app social, botones más familiares y snap fiable. También pide precisión sobre almacenamiento, GDPR, administración y arranque local. Se mantienen Django/React y la ubicación expresamente elegida; no se migra de carpeta por la preferencia general de repositorios.

## Ubicación y prioridad actual — 2026-11-04

El usuario pide trabajar en `Orgs` en general. Plataforma y estudio quedan como carpetas hermanas bajo `/Users/meco/MBP Files/Orgs/personal/`: `scroll-questionnaire` y `scroll-q-mpc`. El estudio se traslada desde Gits/personales conservando Git, entorno y datos locales. Coste prioritario: Droplet seleccionado; infraestructura pendiente.

Feedback UI: saturación visual, poca invitación a responder y desbordamiento horizontal interno. Revisión móvil 0.4 reduce adornos, usa títulos Manrope y corrige el ancho del reproductor.
