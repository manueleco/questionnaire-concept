# Scroll Questionnaire · Brandbook 0.4

Fecha: 2026-11-04. Dirección vigente: **Clear Listening** (sustituye Quiet Current por petición del usuario). Documento editable y fuente de decisiones visuales del producto; los tokens ejecutables de la experiencia participante están en `public/app-shell.css`.

## Identidad y promesa

Nombre completo: **Scroll Questionnaire**. Firma corta de interfaz: **scroll q.** Firma tipográfica compacta, negra. El icono `s.` de la revisión anterior se conserva en código pero no se muestra en la firma actual. No presentar «scroll q.» como un producto distinto.

Una plataforma para escuchar, observar y responder a tu ritmo. El primer estudio trata de percepción musical; la identidad debe poder acompañar otros cuestionarios sin convertirse en una marca exclusivamente musical.

Personalidad: tranquila, cercana, precisa, curiosa. Lenguaje directo y respetuoso. Nunca felicitar una respuesta concreta ni insinuar que hay una respuesta científicamente mejor. Ejemplo: «Take all the time you need». Evitar «You're faster than 90% of people», rachas, cuentas regresivas, perfiles psicológicos o premios por velocidad.

## Referencia y decisiones propias

Referencia vigente: [Grassfeld](https://www.grassfeld.com), inspeccionada visualmente en móvil. Se adoptan titulares compactos de gran peso, superficies azul claro, texto negro y menos bordes. Se crea una ilustración SVG propia de auriculares. No se copian logotipo, material visual, afirmaciones de seguridad ni tipografías comerciales del referente. La estructura de navegación inferior inspirada antes en Velto se mantiene por familiaridad.

La petición de colores que inviten a participar se interpreta como una **hipótesis de comodidad y legibilidad**, no como un efecto psicológico demostrado. No hay un color que garantice confianza o mayor participación en toda cultura o población. Validar la propuesta con pruebas de comprensión, abandono, fatiga y accesibilidad; no atribuir diferencias de resultados al color sin un diseño experimental adecuado.

## Paleta

| Token | Color | Uso |
|---|---|---|
| `--color-paper` | `#FFFFFF` | Fondo general, descanso visual |
| `--color-white` | `#FFFFFF` | Superficies de pregunta y navegación |
| `--color-ink` | `#202126` | Texto principal, CTA y pestaña activa |
| `--color-muted` | `#555A64` | Texto secundario legible |
| `--color-accent` | `#365E94` | Firma, foco, progreso, confirmación |
| `--color-accent-deep` | `#264A77` | Hover de acción principal |
| `--color-paper-2` | `#E7F0F5` | Selección suave y etiquetas |
| `--color-cyan` | `#CCE0EE` | Acento azul decorativo; no texto sobre blanco |
| `--color-rule` | `#DFE3E8` | Separadores decorativos, no único indicador de estado |
| `--color-banner` | `#E5F1F5` | Panel de escucha de bienvenida |
| `--color-error` | `#A32939` | Error con mensaje de texto |

Texto normal: objetivo WCAG AA 4.5:1. Foco/indicadores esenciales: 3:1. Las líneas decorativas suaves no sustituyen los estados accesibles. A/B/C comparten colores, tamaño y peso: el color no codifica condición experimental. Estado seleccionado con borde/contraste y `aria-pressed`; oído con marca y etiqueta accesible. La ilustración de auriculares de bienvenida es decorativa, no representa una medición de audio.

## Tipografía e iconos

Firma y bienvenida: Barlow Condensed ExtraBold, bajo SIL OFL; preguntas y cuerpo: Manrope variable, bajo SIL OFL. Ambas se sirven desde `public/fonts/`, sin solicitudes a Google Fonts desde el navegador del participante. Las licencias acompañan los archivos. Fuente de distribución: repositorio oficial [google/fonts](https://github.com/google/fonts). Fuentes de reserva del sistema si no cargan. No se utiliza Right Grotesk, la tipografía comercial observada en Grassfeld.

Titulares de preguntas 24–30 px, bienvenida 36–52 px, cuerpo 14–15 px, botones 14 px, auxiliares 10–12 px. Las preguntas conservan prioridad sobre instrucciones y estado. En pantallas pequeñas se reduce espacio ornamental antes de reducir legibilidad.

Iconos SVG de trazo de 1.7 px, vista 24×24: casa, auriculares, progreso e información. Mostrar siempre etiquetas, sin depender sólo de iconos. No mezclar emojis coloridos ni bibliotecas de estilos distintos en navegación.

## Componentes

- **CTA:** fondo negro, texto blanco, radio 12 px, altura mínima 48 px; hover azul oscuro, presión sutil 0.98, sin sombra dura ni efecto 3D. Cargando: etiqueta explícita y deshabilitado; error: mensaje contiguo y reintento. Foco visible de 3 px.
- **Botón secundario:** fondo gris verdoso, radio 12 px, sin competir con la acción principal.
- **Tarjeta:** fondo blanco para preguntas y azul claro para bienvenida, radio 20 px en móvil, sin sombra ni contorno ornamental, padding 18–30 px. Tarjetas A/B/C y sus opciones son equivalentes visualmente.
- **Barra inferior:** cuatro destinos, alto táctil mínimo 50 px por tab. Inicio y Escucha navegan; Progreso abre lista de pasos; Info abre explicación/privacidad/audio. No se muestran como pestañas seleccionadas los diálogos temporales. Margen seguro inferior del dispositivo.
- **Progreso:** posición en el recorrido y número real de preguntas contestadas, sin confundir visitas con respuestas. Preguntas futuras deshabilitadas hasta completar el paso actual.
- **Campos:** etiqueta visible, fondo suave, radio 12 px, mensajes concretos. «Cannot judge» y «No difference» son respuestas legítimas; no degradarlas visualmente.

## Layout y scroll

App a pantalla disponible, sin marco de móvil artificial. En móvil: cabecera compacta, una tarjeta y dock inferior persistente. En escritorio: contexto y recorrido a la izquierda, pregunta central y progreso lateral; navegación inferior equivalente.

Cada sección mide el alto disponible entre cabecera y dock. `scroll-snap-type: y mandatory`, `scroll-snap-align: start` y `scroll-snap-stop: always`. Bienvenida centrada y preguntas alineadas arriba en móvil; tarjetas largas dentro del mismo espacio, con desplazamiento interno nativo y encadenamiento al feed al llegar al borde. No se interceptan gestos táctiles ni la rueda. Los botones de navegación llevan al inicio de la tarjeta de destino; las respuestas permanecen guardadas.

Se puede avanzar con el botón, scroll o teclado sin que responder dispare un salto automático. Los pasos sin desbloquear no aparecen en el feed. El usuario puede revisar respuestas. `prefers-reduced-motion` elimina desplazamiento animado y transformaciones. El audio se pausa fuera de preguntas auditivas, al abrir información/progreso o al ocultar la pestaña.

## Gamificación responsable

Celebrar completar el recorrido con una marca discreta y agradecimiento. No puntuar respuestas, velocidad, escucha «correcta» ni supuesta personalidad. El timer es para análisis, no cuenta atrás. No usar confeti durante juicios auditivos ni colores diferentes para condiciones de audio. Conservar la misma interfaz entre participantes salvo cambios de protocolo versionados.

## Alcance y mantenimiento

Este cambio aplica a la experiencia participante. El portal Django conserva su layout administrativo existente; su unificación visual queda registrada como evolución, sin alterar permisos ni edición de estudios. Para modificar la marca, actualizar primero este documento y los tokens: evitar colores nuevos aislados dentro de componentes.

Validación: capturas y recorrido de navegador en 320/375/414/768/1280 px; navegación por teclado/botones/rueda, tarjetas largas, borrador, audio y envío/retirada. Pendiente: teléfonos iOS/Android físicos, lector de pantalla, zoom ampliado y prueba de comprensión con participantes. No confundir responsive en Chrome con validación nativa en todos los dispositivos.

## Guía corta

Guía opcional de tres pasos: menú inferior; responder y desplazarse; reproducir/cambiar A/B/C. Disponible en bienvenida y en Info. Puede omitirse, cerrarse con Escape y reabrirse. No solicita datos ni reproduce audio; los timers de respuesta excluyen su apertura. Sin bloqueo de entrada, ventanas sucesivas automáticas ni recompensas por completarla.

## Revisión móvil 0.4

Reducir densidad: una frase de bienvenida, ilustración pequeña (omitida en pantallas bajas), títulos de pregunta más tranquilos y guía opcional. Eliminar las flechas duplicadas del dock, conservar estado de guardado legible y cuatro destinos con etiquetas. El CTA de pregunta permanece accesible con posición sticky dentro de la tarjeta.

El reproductor usa `min-width: 0` y barras flexibles: no depender del recorte horizontal de la página. Regresión observada antes del arreglo: tarjeta de audio con clientWidth 296 y scrollWidth 375 a viewport 320. Verificar dimensiones internas de todas las tarjetas y diálogos, además de la raíz. Opciones de texto largo pueden envolver para conservar accesibilidad y autoría flexible; no truncar respuestas.
