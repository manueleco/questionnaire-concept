# Privacidad, seguridad y preparación GDPR

## Estado honesto

Prueba de concepto con controles de aplicación y tests; no auditoría completa, pentest ni certificación GDPR. La skill `security-audit` se utilizó en modo de orientación. Las comprobaciones de desarrollo se ejecutan sobre código nuevo y datos ficticios; no se ha probado ninguna infraestructura ajena ni desplegada.

El GDPR exige principios de finalidad/minimización/retención, información, base jurídica y medidas proporcionales al riesgo. La investigación no exime automáticamente del reglamento. Los datos seudonimizados pueden seguir siendo personales; no prometer anonimato por quitar nombres. La institución debe decidir la base del tratamiento y, si procede, condiciones para categorías especiales. [Texto oficial GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

## Fronteras de confianza y controles implementados

| Frontera | Control |
|---|---|
| Participante → API | JSON limitado a 96 KiB, validación de tipos, enumeraciones, pertenencia y rangos; transacción completa. |
| Sitio externo → sesión | CSRF de Django en mutaciones, mismo origen, cookies HttpOnly/SameSite; no CORS abierto. |
| Colaborador → otra organización | Comprobación de membresía y rol en cada vista/acción, no sólo enlaces ocultos. Tests de lectura, modificación y exportación cruzadas. |
| Viewer → datos de respuestas | Sólo metadatos. Export requiere owner/admin/researcher/analyst. |
| Invitación → cuenta | 256 bits de aleatoriedad, hash SHA-256 almacenado, un uso, caducidad 72 h, consumo transaccional. Enlace es credencial de portador; compartirlo con destinatario concreto. |
| Respuesta → hoja de cálculo | Escape CSV contra fórmulas. Sheets usa `valueInputOption=RAW`. |
| Navegador → sistema de archivos | Allowlist fija de assets; no rutas arbitrarias ni exposición de `data/`, `.env`, fuentes o SQLite. |
| Retirada → datos | Clave aleatoria privada; hash y comparación constante en servidor; cascada de respuestas, rankings, opciones y eventos. |
| Publicación → material privado | `data/`, notas originales, entornos y resultados temporales excluidos de Git. Sites recibe sólo `dist/` y manifest. |
| Despliegue → configuración insegura | Producción requiere secreto fuerte, hosts explícitos, PostgreSQL y Redis. Cookies Secure, redirección HTTPS, HSTS y cabeceras. |
| Abuso → login/envío | Límites básicos de 30 intentos de auth o 60 envíos por minuto por digest de dirección; TTL 60 s. Redis compartido obligatorio en producción; dev usa memoria. |

CSP limita scripts/conexiones a mismo origen; `style-src 'unsafe-inline'` se mantiene por estilos de forma de onda y administración. No analítica, píxeles, fuentes externas, grabación de micrófono ni huella de dispositivo. No persistir IP/User-Agent en tablas de estudio. El proxy/hosting puede producir logs: revisarlos, redactarlos y definir retención es tarea de despliegue, no garantía del frontend.

Contraseñas con validadores de Django y hashing del framework; no credenciales por defecto. No guardar tokens en repo ni chat. Separar DB user de aplicación con privilegios mínimos del usuario de migraciones.

## Inventario de datos

Participantes: UUID, versión de protocolo, respuestas, perfil musical simplificado, tipo de auriculares, consentimiento demo, tiempos, mapeo A/B/C y eventos de reproducción. Texto libre puede incluir datos personales pese a la instrucción de no hacerlo; limitarlo y revisar antes de compartir. Hash de audio local no contiene nombre de archivo, pero sigue siendo metadato que debe justificarse.

Colaboradores: usuario y hash de contraseña de Django; membresías/roles; registro de exportación. Invitaciones no guardan correo. Si se activa comunicación por email, habrá que añadir proveedor, finalidad y retención.

Almacenamiento local: borrador con TTL lógico 90 días al reabrir, clave de retirada y respuestas. La demo puede borrarlo desde el cierre. La eliminación del navegador no garantiza por sí sola borrar la BD. Nunca usar el mismo navegador compartido para identidades distintas sin borrar la sesión.

## Antes de reclutar participantes reales

- Identificar responsable del tratamiento (UPF/equipo, según determine la institución), contacto y DPO; no inventar estos datos en una política.
- Validar finalidad, base jurídica, consentimiento de participación separado del tratamiento cuando corresponda, criterios de edad y retirada.
- Publicar información comprensible con destinatarios, plazos, derechos y procedimiento. No prometer “no se comparte con empresas” si se usan proveedores cloud.
- Evaluar si procede DPIA; no afirmar que es obligatoria o innecesaria sin evaluar población/escala/datos.
- Seleccionar hosting/BD/backups en región aprobada, DPA y subencargados; evaluar transferencias internacionales. Cifrado en tránsito y en reposo depende del despliegue.
- MFA/SSO para administradores, recuperación segura, revocación de sesiones y revisión de acceso. Aún no implementado.
- Probar permisos con PostgreSQL y roles reales; valorar RLS como defensa adicional. Actualmente el aislamiento es de aplicación, no RLS.
- Configurar proxy confiable, límites de peticiones/cuerpo en borde, protección antiabuso, monitorización sin datos sensibles y parcheo automatizado.
- Probar backup/restauración, ejercicio de retirada, incidentes y comunicación institucional.
- Revisar accesibilidad, Safari/iOS, privacidad del dispositivo y consentimiento con equipo docente/ética.

## Retención y retirada

Default demo: 90 días en Study. `manage.py purge_expired` muestra candidatos; `--apply` elimina. Requiere programación por infraestructura y seguimiento operativo; no se ha creado tarea periódica externa. Borrar en BD no borra backups/exportaciones: gestionar su ciclo y restauraciones con lista de retiradas.

CSV descargado pertenece a su destinatario autorizado y no se puede revocar remotamente. El espejo opcional de Sheets exporta sólo agregados con grupos >=5; esto **no garantiza anonimización**, especialmente frente a diferencias entre exportaciones. Mantener Sheet privado, restringido, aprobado y fuera del repositorio. Después de retirar datos, ejecutar sincronización para limpiar valores anteriores; no hay sincronización automática configurada.

## Límites de los tests

Cubren fronteras funcionales relevantes, no disponibilidad, configuración de proveedores, navegación móvil física ni seguridad completa del navegador/host. Los tiempos y evidencia de escucha son controlados por cliente; no demuestran atención real. La clave de retirada es de portador y debe protegerse.

Referencia operativa: [checklist de despliegue Django](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/).

Audio importado: se conserva mediante IndexedDB en el dispositivo para reanudar la demo. No se sube al backend; la retirada local elimina también esa copia. La caducidad del borrador se comprueba al volver a abrir la aplicación, no mediante un proceso que se ejecute con el navegador cerrado.
