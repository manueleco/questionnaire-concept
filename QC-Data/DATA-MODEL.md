# Modelo de datos y cinco formas normales

## Alcance de la afirmación

Se ha diseñado el esquema de dominio para evitar dependencias parciales/transitivas y grupos multivaluados. **5FN no es una certificación automática del esquema.** Se sostiene únicamente bajo las dependencias funcionales, multivaluadas y de reunión aquí declaradas. Cambiar reglas de negocio obliga a reexaminarlo. El framework también aporta sus propias tablas de auth/sesiones, que no se presentan como un rediseño formal de su esquema.

Los arrays/objetos JSON son un formato de transporte y borrador, no el almacenamiento analítico principal. Rankings, opciones y eventos se descomponen en filas.

## Relaciones y claves

| Relación | Claves candidatas y dependencias del dominio |
|---|---|
| Organization | `id → name, created_at`; nombres no únicos globalmente. |
| Role | `code → label`; catálogo de rol, sin copia de etiqueta en miembros. |
| Membership | `(organization,user) → role`; un rol por persona y organización en v1. ID surrogate adicional. |
| Invitation | `id` y `token_hash` únicos → org, rol, caducidad y consumo. Sin correo duplicado. |
| Study | `id → organization, title, retention_days`. |
| Protocol | `id` y `(study,version)` → estado, modo, versión de consentimiento, creación. |
| Question | `id`, `(protocol,key)` y `(protocol,position)` → tipo, texto y atributos. |
| QuestionOption | `id` y `(question,key)` → label. |
| ParticipantSession | `id → protocol, withdrawal_hash, payload_hash, stimulus, headphones, background, background_details, consent_at, client_started_at, received_at`. Sin identidad del participante. |
| LabelAssignment | `(session,label)` y `(session,source)` → tiempo escuchado y hash de fuente. Mapeo uno-a-uno dentro del bloque. |
| Response | `id` y `(session,question)` → tipo de respuesta, valor tipado y tiempos. |
| RankItem | `(response,label)` y `(response,position)` → los demás atributos; posiciones 1–3. |
| SelectedOption | `(response,option)` único; relación binaria. |
| PlaybackEvent | `id → session, question, type, at, position, source_index`; evento observado, no deducible de pares. |
| ExportAudit | `id → protocol, actor, created_at, row_count`; no almacena copia de respuestas. |

## Comprobación por forma normal

1. **1FN:** campos escalares; no `rankA,rankB,rankC`, listas de miembros ni opciones separadas por comas en BD. Texto libre es un valor de la respuesta, no una lista codificada que el sistema consulte como entidades.
2. **2FN:** atributos dependen de la clave completa. Nombre del usuario/organización/rol no se copia a Membership; textos de opción no se copian a SelectedOption.
3. **3FN:** org se obtiene desde estudio/protocolo, no se repite en cada respuesta. Texto de pregunta se obtiene por FK. No almacenar edad derivada de fecha de nacimiento ni sumas/cuentas derivables del conjunto de respuestas.
4. **BCNF/4FN:** determinantes declarados son claves candidatas. Miembros, opciones elegidas, rankings y eventos son relaciones independientes. No mezclar dos conjuntos multivaluados independientes en una misma fila/cartesiano.
5. **5FN/PJNF:** no se ha declarado una dependencia de reunión no trivial no implicada por claves. Relaciones binarias como SelectedOption no necesitan descomposición adicional. Membership no puede descomponerse en org-usuario, usuario-rol y org-rol: el join generaría asociaciones espurias porque el rol es específico de la membresía. PlaybackEvent tampoco se reconstruye de pares sin perder identidad de evento.

Esta revisión no demuestra ausencia de toda dependencia imaginable. Particularmente, si se permiten varios roles por miembro o capacidades por estudio, se deberán crear relaciones independientes y estudiar sus join dependencies. No hacer una descomposición “hasta cinco tablas” para afirmar 5FN.

## Integridad y límites reales

FK, claves únicas y CHECK de rangos en migraciones. Servicios transaccionales validan que pregunta/opción pertenecen al protocolo, tipos coinciden, y A/B/C forman una permutación. El portal no expone escrituras directas de respuestas. Estas invariantes cruzadas no son todas FK compuestas en SQL: un administrador de BD o `bulk_update` fuera del servicio puede violarlas. Añadir restricciones/triggers PostgreSQL y revisión específica antes de un entorno con múltiples escritores.

Versiones publicadas bloqueadas en portal y saves de modelos. Las operaciones masivas/SQL directo de operadores siguen siendo privilegiadas; inmutabilidad no es almacenamiento WORM.

## Extensión siguiente

Antes del estudio real multi-pista: `Recording`, `Rendition`, `License`, `ProcessingRun`, `MeasuredAudio`, `Trial`, `TrialAssignment`, `ConsentDocument`. Cada metadato de audio residirá una vez por rendition/hash; la asignación referenciará la rendition. Actualmente `source_sha256` identifica el contenido local sin recopilar nombres de archivo personales.

Separar identidad/contacto de participantes si se incorpora seguimiento; no reutilizar cuentas de colaboradores como participantes. Mantener análisis tabular desnormalizado como vista/materialización/exportación, nunca como única copia del dato bruto.
