# Acciones y TODO

## Implementado

- [x] React + TypeScript, Django, migraciones SQLite y configuración PostgreSQL.
- [x] Scroll por pregunta, botones alternativos, regreso y borrador persistente.
- [x] A/B/C sincronizado, crossfade y versiones ciegas permutadas.
- [x] Audio sintético y carga local de tres archivos.
- [x] Cuatro MP3 aportados conservados localmente; extractos de 20 s y mediciones.
- [x] Tipos declarativos: ranking, single, multi, texto y escala.
- [x] Portal: organizaciones, miembros, roles e invitación manual de un solo uso.
- [x] Protocolos inmutables al publicar, clonación y creación de preguntas desde formulario.
- [x] Persistencia transaccional, idempotencia y retirada mediante clave privada.
- [x] Tiempos por pregunta, escucha por versión y eventos de reproducción.
- [x] CSV/JSON, CSV del portal autorizado y adaptador opcional agregado de Sheets.
- [x] Controles CSRF, validación, cabeceras, límites y tests de roles/aislamiento.
- [x] Documentación de contexto, decisiones, normalización, investigación y privacidad.

- [x] Brandbook propio, botones simplificados y navegación inferior con cuatro acciones funcionales.
- [x] Ajuste de tarjetas al viewport, scroll nativo y revisión desde Progreso.
- [x] Documentación explícita de almacenamiento navegador/SQLite/PostgreSQL y acceso local.
- [x] Permisos locales de carpeta de datos y SQLite restringidos al propietario.

## Antes del piloto científico

- [ ] Cerrar pregunta: saturación o compresión; emoción percibida o sentida; variable primaria.
- [ ] Elegir género(s), número de pistas y material con licencia documentada.
- [ ] Preparar tres niveles reales de saturación a LUFS comparable y medir true peak.
- [ ] Implementar modelo multi-pista/ensayos y contrabalanceo servidor.
- [ ] Redactar y validar información/consentimiento institucional; responsable, derechos y retención.
- [ ] Decidir duración, mínimo de escucha, práctica y screening de auriculares.
- [ ] Piloto de comprensión y viabilidad; calcular muestra por simulación, no número arbitrario.
- [ ] Revisar estadística y plan de exclusiones/multiplicidad; prerregistrar cuando corresponda.

## Antes de producción reutilizable

- [ ] Elegir hosting Django y PostgreSQL/Redis, región, DPA y copias.
- [ ] Probar migraciones, concurrencia y aislamiento en PostgreSQL.
- [ ] MFA/SSO, recuperación de cuenta, revocación de invitaciones y sesiones.
- [ ] Configurar retención periódica y restauración con borrados; verificar copias externas.
- [ ] Editor de preguntas existente/reordenación, múltiples idiomas, anclajes de escala.
- [ ] Subida privada de audio con cuotas, validación y almacenamiento de objetos.
- [ ] Revisar Safari/iOS/Android reales, lector de pantalla y accesibilidad ampliada.
- [ ] Configurar Sheets aprobado si se decide usarlo; no está conectado todavía.

## Decisiones que corresponden al usuario/equipo

- Usuario administrador: crearlo con `createsuperuser` en su terminal.
- Responsable del tratamiento/base jurídica y hosting: concretarlos con institución.
- Derechos de los audios y consentimiento: aportar datos reales antes de reclutar.
- No se han enviado mensajes a amigos, listas ni colaboradores.
