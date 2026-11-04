# Hosting del piloto y evolución

Revisión: 2026-11-04. Recomendación, no compra ni despliegue autorizado. Ningún recurso de pago se ha creado.

## Recomendación

Preferir **App Platform + PostgreSQL administrado** si el presupuesto permite aproximadamente US$50–65/mes antes de impuestos y extras para un piloto administrado. Prioriza mantenimiento sencillo. Si el coste es determinante, un Droplet dedicado de 2 GiB puede ser un punto de partida económico para medir el piloto, con mayor responsabilidad operativa. La capacidad real requiere prueba de carga; no prometer un número de participantes por plan.

| Alternativa | Ventaja | Coste orientativo y compromiso |
|---|---|---|
| Hosting existente con CloudPanel | Reutiliza infraestructura; permite Python/reverse proxy | Capacidad, región, aislamiento, PostgreSQL y alcance de backups pendientes de comprobar. No asumir coste cero ni garantías por tener un panel. |
| Droplet dedicado | Control, separación respecto a otros proyectos, precio bajo | 2 GiB/1 vCPU US$12/mes; administrar SO, TLS, PostgreSQL/Redis, backups, recuperación y monitorización. |
| App Platform | Despliegue Git y operación de infraestructura administrada | App compartida 1 GiB escalable manualmente US$12/mes; servicios de datos y archivos se cobran aparte. |

Fuentes: [Droplets](https://www.digitalocean.com/pricing/droplets), [App Platform](https://www.digitalocean.com/pricing/app-platform), [CloudPanel Python/reverse proxy](https://www.cloudpanel.io/docs/v2/frontend-area/settings/).

Ejemplo administrado: app US$12 + PostgreSQL mínimo publicado US$15.15 + Valkey US$15 + Spaces US$5 ≈ **US$47.15/mes**. Confirmar tamaño/almacenamiento, región y total al contratar; impuestos, dominio, exceso de transferencia, copias adicionales y redundancia pueden sumar. El código actual exige Redis compatible en producción para límites compartidos; Valkey es candidato a validar. No esconder ese coste. Este presupuesto de una instancia no ofrece alta disponibilidad completa.

Ejemplo económico autoadministrado: Droplet US$12 + backup diario al 30% (US$3.60) + Spaces US$5 ≈ **US$20.60/mes**, antes de impuestos y extras. App, BD y caché compartirían esa máquina; una avería afecta al conjunto. Un backup de máquina no sustituye una estrategia PostgreSQL probada y restauración coherente. No se ha probado esta capacidad con el estudio.

Fuentes: [BD/Valkey](https://www.digitalocean.com/pricing/managed-databases), [Spaces](https://www.digitalocean.com/pricing/spaces-object-storage), [backups de Droplets](https://www.digitalocean.com/pricing/droplets).

## Escalabilidad y experiencia

Django puede mantenerse como aplicación sin estado local persistente: PostgreSQL externo, caché compartida y audio en almacenamiento de objetos. Escalar procesos/instancias cuando las mediciones lo justifiquen. App Platform facilita ese proceso; un Droplet necesita configuración adicional. No hacen falta Kubernetes ni microservicios para este piloto.

La documentación actual de App Platform distingue autoscaling por CPU (dedicada) y por peticiones (shared/dedicada); las páginas de precios aún presentan información menos actualizada sobre autoscaling. Verificar elegibilidad del plan seleccionado en el panel antes de contratar. No asumir que el plan fijo más barato permite varias instancias. [Guía de escalado](https://docs.digitalocean.com/products/app-platform/how-to/scale-app/)

La experiencia de escucha depende sobre todo de precargar las tres versiones, controlar tamaño/duración, servir recursos cerca de la audiencia, mantener sincronía y conservar respuestas ante fallos. El procesamiento de estímulos se realiza antes del experimento, no por participante. Medir latencia P95, errores de envío y carga de audio con conexiones móviles. No activar suspensión del servicio durante reclutamiento si genera una primera visita lenta.

**Nunca SQLite en el disco efímero de App Platform**: los reemplazos/despliegues pierden datos locales. Usar PostgreSQL persistente y objetos separados. Tampoco elegir la base «Development» de US$7 para respuestas que se quieren conservar: no tiene backups por defecto y se elimina con la app. [Límites de almacenamiento](https://docs.digitalocean.com/products/app-platform/details/limits/) y [definición de Development Database](https://www.digitalocean.com/pricing/app-platform).

## Privacidad y utilidad científica

No existe un interruptor GDPR. Configurar aislamiento, mínimos privilegios, TLS/cifrado, acceso administrativo reforzado, información al participante, base jurídica, plazos y derechos; validar responsables y condiciones institucionales. Revisar DPA, subencargados y transferencias. Región UE no elimina automáticamente transferencias asociadas a CDN/soporte. [DigitalOcean GDPR](https://www.digitalocean.com/trust/gdpr-at-do), [DPA](https://www.digitalocean.com/legal/data-processing-agreement), [Comisión Europea](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en).

Para usar los resultados en clase: cerrar variable primaria, protocolo, estímulos y exclusiones antes del reclutamiento. Las cuatro augmentations actuales sirven para comprobar la interfaz, pero no aíslan saturación. Mantener el mismo protocolo y versión de plataforma durante la recogida. Una base fiable no convierte por sí sola un diseño confuso en datos interpretables.
