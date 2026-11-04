# Crear y cambiar cuestionarios

1. Crear usuario administrador local en terminal y otorgarle propiedad de la organización demo con `seed_demo --owner`.
2. Entrar en `/portal/`, crear una organización o abrir la existente.
3. Crear un estudio. Se crea su versión 1 en borrador.
4. Añadir preguntas desde el formulario. No hay que modificar React.
5. Publicar el protocolo demo; abrir su enlace `/?protocol=<uuid>`.
6. Para revisar un protocolo publicado: **Clone to new version**. La versión anterior y sus respuestas conservan su significado.

## Tipos disponibles

| Tipo | Respuesta | Reglas |
|---|---|---|
| `rank` | Orden A/B/C, sin diferencia o no puedo juzgar | Requiere audio. Tres letras únicas; aún no soporta empates parciales. |
| `single` | Una opción | Definir al menos dos opciones. |
| `multi` | Cero o más opciones distintas | Si es obligatoria exige alguna opción. |
| `text` | Texto libre | Hasta 1.000 caracteres. Evitar pedir datos personales. |
| `scale` | Valor 1–7 | Enunciado debe aclarar extremos; anclajes configurables son TODO. |

Opciones: una línea `clave|Texto visible`, sin repetir claves. La clave identifica el dato y no debería cambiar entre interpretaciones del mismo constructo. Ejemplo:

```text
performer|Performer or singer
producer|Producer or engineer
listener|Listener
```

La PoC permite agregar y eliminar preguntas de borradores. Para sustituir una pregunta de borrador puede eliminarse y crearse de nuevo; el editor de edición/reordenación directa está pendiente. Límite inicial: 30 preguntas. Las opciones se guardan en relaciones separadas, no en columnas repetidas.

El protocolo estático de Sites usa `public/questions.json`. Editarlo cambia la demo estática después de compilar; no modifica protocolos ya publicados en Django. La semilla sólo se aplica una vez. No editar datos históricos con la semilla.

## Reglas de autoría

Una pregunta debe medir una sola dimensión. Evitar “más claro y menos áspero”, preguntas con presuposición y opciones que sólo admiten la hipótesis. Incluir incertidumbre cuando tenga sentido. Marcar campos opcionales explícitamente. No usar el tiempo de respuesta como competición.

La configuración actual comparte un bloque de audio entre preguntas; se necesita un modelo de ensayos para estudios con varias canciones. No duplicar preguntas a mano para simular aleatorización de pistas en producción.

## Estudios en repositorios separados

`manage.py import_study /ruta/study/manifest.json [--owner TU_USUARIO]` admite manifiestos de esquema 1 en modo demo. Incluyen `organization` (UUID/nombre), `study` (UUID/título/retención), `protocol` (UUID/versión/demo=true/consent_version) y `questions` con el formato declarativo habitual. Valida antes de publicar, usa transacción y rechaza cambios sobre el mismo protocolo. El repositorio privado MPC contiene un ejemplo ejecutable. La aprobación científica y el modo real son trabajos separados.
