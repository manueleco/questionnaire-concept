# Demo multilingüe

2026-11-08. Idiomas confirmados por el usuario: inglés (`en`), español (`es`) y catalán (`ca`). Rama de plataforma: `mpc` (renombrada desde `feat/multilingual-demo` por petición del usuario). Alcance: recorrido participante, navegación, guía, información/privacidad de demo, importación de audio, errores conocidos, preguntas y cierre. El portal Django administrativo sigue en inglés; no afirmar que toda la administración está traducida.

## Selección y persistencia

Selector con nombres propios de cada idioma, sin banderas. Prioridad: `?lang=...` válido, preferencia guardada, idioma principal del navegador compatible, inglés. El selector actualiza la URL conservando otros parámetros como `protocol`, el atributo `html.lang` y la preferencia del navegador. No remonta el motor de audio ni reinicia IDs, respuestas, mapeo A/B/C o temporización. La preferencia de interfaz es independiente de los datos exportados de una sesión ya completada.

`src/locales.ts` contiene mensajes propios ES/CA con inglés como clave de origen; `src/i18n.ts` resuelve idioma e interpolación. Frases con contadores usan marcadores. No se traducen respuestas libres, identificadores, condiciones ni valores de las opciones. No hay servicio externo de traducción ni nueva dependencia de ejecución.

## Preguntas versionadas

Inglés permanece como texto base. Cada pregunta admite `translations.es` y `translations.ca`, con `title`, `description`, `direction` y `options` (diccionario de ID de opción a etiqueta). Una traducción presente debe cubrir todos los textos y opciones de la pregunta; el importador rechaza opciones desconocidas o traducciones incompletas. Un idioma ausente muestra el texto inglés y un aviso explícito, no una traducción inventada.

SQL: `QuestionTranslation(question, language)` y `OptionTranslation(option, language)` con unicidad por par y borrado en cascada. Se conserva la normalización relacional; no se almacenan mapas de idiomas en JSON de la BD. Las traducciones publicadas son inmutables por los mismos flujos de aplicación que las preguntas; clonar crea traducciones independientes. Autoría actual mediante manifiesto; el editor visual de traducciones queda pendiente.

`seed_demo` crea una nueva versión 2 con traducciones, sin reescribir la versión publicada anterior. La API sin ID selecciona el protocolo demo publicado más reciente; para estudios compartidos usar siempre URL con `?protocol=UUID`. Mantener el protocolo fijo durante recogida.

## Idioma en datos

- `Session.language` / `ParticipantSession.language`: idioma de interfaz al enviar.
- `Session.consentLanguage` / `consent_language`: idioma en que se confirmó la información de demo.
- `Answer.language` / `Response.language`: idioma efectivo de la pregunta al modificar por última vez esa respuesta; si no había traducción, inglés.
- CSV local y del portal incluyen los tres campos. IDs, rangos, tiempos en ms y timestamps ISO no cambian según idioma.

La migración asigna `en` a registros antiguos porque la interfaz anterior era inglesa. No se registra el historial completo de cambios de idioma. Una respuesta revisada en otro idioma sin modificarla conserva su idioma de última modificación. Evaluar este comportamiento en el plan estadístico; no asumir equivalencia psicométrica de las traducciones. Revisión por hablantes y piloto de comprensión pendientes.

## Integración configurable

`protocol.min_seconds_per_version` en manifiestos / `minSecondsPerVersion` en API permite escucha mínima entre 0.25 y 30 segundos. Se verifica tanto en cliente como en servidor. Demo general 1.2 s; propuesta del estudio privado 3 s. No representa un criterio científico aprobado.

## Validación y límites

Pruebas cubren los tres idiomas, ancho interno a 320 px, cambio durante reproducción, persistencia y envío; regresiones existentes cubren 375/414/768/1280 px. Migración/importación/clonación/idiomas inválidos y umbral de escucha se comprueban en Django. Dispositivos físicos, revisión lingüística, portal traducido y equivalencia de instrumentos pendientes.
