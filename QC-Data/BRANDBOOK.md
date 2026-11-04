# Scroll Questionnaire · Brandbook 0.2

Fecha: 2026-11-04. Dirección: **Quiet Current**. Documento editable y fuente de decisiones visuales del producto; los tokens ejecutables de la experiencia participante están en `public/app-shell.css`.

## Identidad y promesa

Nombre completo: **Scroll Questionnaire**. Firma corta de interfaz: **scroll q.** Símbolo: `s.` dentro de un cuadrado redondeado verde petróleo. No presentar «scroll q.» como un producto distinto.

Una plataforma para escuchar, observar y responder a tu ritmo. El primer estudio trata de percepción musical; la identidad debe poder acompañar otros cuestionarios sin convertirse en una marca exclusivamente musical.

Personalidad: tranquila, cercana, precisa, curiosa. Lenguaje directo y respetuoso. Nunca felicitar una respuesta concreta ni insinuar que hay una respuesta científicamente mejor. Ejemplo: «Take all the time you need». Evitar «You're faster than 90% of people», rachas, cuentas regresivas, perfiles psicológicos o premios por velocidad.

## Referencia y decisiones propias

Referencia solicitada: [VELTO en Awwwards](https://www.awwwards.com/sites/velto-fintech-app-concept); se inspeccionaron el [caso de diseño](https://newminds.studio/concept-velto) y el [prototipo](https://newminds.studio/velto-app).

Se toma la jerarquía de app, la información agrupada con aire y la navegación inferior de cuatro destinos con icono + etiqueta y selección sólida. No se copian marca, contenido, componentes bancarios ni marco ficticio de teléfono. Se sustituyen el verde bosque/lima por petróleo/menta suave y una superficie de respuestas blanca.

La petición de colores que inviten a participar se interpreta como una **hipótesis de comodidad y legibilidad**, no como un efecto psicológico demostrado. No hay un color que garantice confianza o mayor participación en toda cultura o población. Validar la propuesta con pruebas de comprensión, abandono, fatiga y accesibilidad; no atribuir diferencias de resultados al color sin un diseño experimental adecuado.

## Paleta

| Token | Color | Uso |
|---|---|---|
| `--color-paper` | `#F3F6F5` | Fondo general, descanso visual |
| `--color-white` | `#FFFFFF` | Superficies de pregunta y navegación |
| `--color-ink` | `#182D2B` | Texto principal, CTA y pestaña activa |
| `--color-muted` | `#546461` | Texto secundario legible |
| `--color-accent` | `#21675E` | Firma, foco, progreso, confirmación |
| `--color-accent-deep` | `#194F48` | Hover de acción principal |
| `--color-paper-2` | `#E7EEEB` | Selección suave y etiquetas |
| `--color-cyan` | `#C7E6DB` | Acento menta decorativo; no texto sobre blanco |
| `--color-rule` | `#D4DFDA` | Separadores decorativos, no único indicador de estado |
| `--color-banner` | `#173E39` | Panel de escucha de bienvenida |
| `--color-error` | `#A32939` | Error con mensaje de texto |

Contrastes calculados (luminancia relativa sRGB): tinta/blanco 14.49:1, secundario/blanco 6.23:1, secundario/fondo 5.73:1, acento/blanco 6.63:1 y error/blanco 7.16:1. Esto verifica esos pares, no una auditoría completa de accesibilidad. Texto normal: objetivo WCAG AA 4.5:1. Foco/indicadores esenciales: 3:1. Las líneas decorativas suaves no sustituyen los estados accesibles. A/B/C comparten colores, tamaño y peso: el color no codifica condición experimental. Estado seleccionado con borde/contraste y `aria-pressed`; oído con marca y etiqueta accesible. El gráfico de bienvenida es decorativo, no representa una medición de audio.

## Tipografía e iconos

Familia única del sistema: `-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`. Evita descargar fuentes y se siente familiar en iOS/Android/escritorio. Monoespaciada del sistema sólo para contadores pequeños. Titulares rectos, nunca cursivos; tracking moderadamente cerrado. Texto de formularios de 16 px para evitar zoom involuntario en móviles.

Titulares 27–44 px, cuerpo 14–15 px, botones 14 px, auxiliares 10–12 px. Las preguntas conservan prioridad sobre instrucciones y estado. En pantallas pequeñas se reduce espacio ornamental antes de reducir legibilidad.

Iconos SVG de trazo de 1.7 px, vista 24×24: casa, auriculares, progreso e información. Mostrar siempre etiquetas, sin depender sólo de iconos. No mezclar emojis coloridos ni bibliotecas de estilos distintos en navegación.

## Componentes

- **CTA:** fondo tinta, texto blanco, radio 16 px, altura mínima 48 px; hover petróleo oscuro, presión sutil 0.98, sin sombra dura ni efecto 3D. Cargando: etiqueta explícita y deshabilitado; error: mensaje contiguo y reintento. Foco visible de 3 px.
- **Botón secundario:** fondo gris verdoso, radio 12 px, sin competir con la acción principal.
- **Tarjeta:** blanca, radio 26 px (20 px a 320 px), borde tenue, sombra de baja opacidad, padding 18–30 px. Tarjetas A/B/C y sus opciones son equivalentes visualmente.
- **Barra inferior:** cuatro destinos, alto táctil mínimo 50 px por tab. Inicio y Escucha navegan; Progreso abre lista de pasos; Info abre explicación/privacidad/audio. No se muestran como pestañas seleccionadas los diálogos temporales. Margen seguro inferior del dispositivo.
- **Progreso:** posición en el recorrido y número real de preguntas contestadas, sin confundir visitas con respuestas. Preguntas futuras deshabilitadas hasta completar el paso actual.
- **Campos:** etiqueta visible, fondo suave, radio 12 px, mensajes concretos. «Cannot judge» y «No difference» son respuestas legítimas; no degradarlas visualmente.

## Layout y scroll

App a pantalla disponible, sin marco de móvil artificial. En móvil: cabecera compacta, una tarjeta y dock inferior persistente. En escritorio: contexto y recorrido a la izquierda, pregunta central y progreso lateral; navegación inferior equivalente.

Cada sección mide el alto disponible entre cabecera y dock. `scroll-snap-type: y mandatory`, `scroll-snap-align: start` y `scroll-snap-stop: always`. Tarjetas cortas centradas; largas dentro del mismo espacio, con desplazamiento interno nativo y encadenamiento al feed al llegar al borde. No se interceptan gestos táctiles ni la rueda. Los botones de navegación llevan al inicio de la tarjeta de destino; las respuestas permanecen guardadas.

Se puede avanzar con el botón, scroll o teclado sin que responder dispare un salto automático. Los pasos sin desbloquear no aparecen en el feed. El usuario puede revisar respuestas. `prefers-reduced-motion` elimina desplazamiento animado y transformaciones. El audio se pausa fuera de preguntas auditivas, al abrir información/progreso o al ocultar la pestaña.

## Gamificación responsable

Celebrar completar el recorrido con una marca discreta y agradecimiento. No puntuar respuestas, velocidad, escucha «correcta» ni supuesta personalidad. El timer es para análisis, no cuenta atrás. No usar confeti durante juicios auditivos ni colores diferentes para condiciones de audio. Conservar la misma interfaz entre participantes salvo cambios de protocolo versionados.

## Alcance y mantenimiento

Este cambio aplica a la experiencia participante. El portal Django conserva su layout administrativo existente; su unificación visual queda registrada como evolución, sin alterar permisos ni edición de estudios. Para modificar la marca, actualizar primero este documento y los tokens: evitar colores nuevos aislados dentro de componentes.

Validación: capturas y recorrido de navegador en 320/375/414/768/1280 px; navegación por teclado/botones/rueda, tarjetas largas, borrador, audio y envío/retirada. Pendiente: teléfonos iOS/Android físicos, lector de pantalla, zoom ampliado y prueba de comprensión con participantes. No confundir responsive en Chrome con validación nativa en todos los dispositivos.
