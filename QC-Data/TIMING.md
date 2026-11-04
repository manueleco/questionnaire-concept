# Registro de tiempos

El cronómetro no se muestra durante las preguntas. No penaliza respuestas lentas ni asigna puntos por velocidad.

| Campo | Definición |
|---|---|
| `firstSeenAt` | Primera vez que la pregunta está activa/visible y se toma una muestra temporal. |
| `lastAnsweredAt` | Última modificación de respuesta, incluyendo revisiones. |
| `activeMs` | Tiempo acumulado con la pregunta activa, pestaña visible y sin diálogo abierto. Continúa durante la lectura posterior a responder mientras esa pregunta siga visible. |
| `elapsedMs` | Diferencia entre primera visualización y última modificación. Incluye ausencias y pausas entre ambas. |
| `changes` | Número de mutaciones del estado de respuesta; en texto cuenta cambios de entrada, no “intentos cognitivos”. |
| `listened.A/B/C` | Segundos de reproducción de la versión seleccionada mientras hay pregunta auditiva activa, documento visible y AudioContext funcionando. |
| `createdAt` | Inicio del borrador de sesión en cliente. |
| `received_at` | Momento de recepción de la sesión completa en servidor. |
| `events` | Reproducción/pausa/cambio de fuente, posición temporal y pregunta; no registro de teclas ni texto por evento. Máximo 500 por sesión. |

Reloj activo: `performance.now()`, muestreo cada 150 ms y delta limitado a 1 s para no sumar bloqueos prolongados del navegador. Timestamps: ISO UTC. Guardado del borrador aproximadamente cada 2 s y en acciones/ocultación. No es instrumentación de laboratorio de precisión milisegundo; registrar esta resolución en el método.

Los tiempos de escucha se acumulan por etiqueta aleatoria A/B/C, no por índice físico de buffer. Al esconder la pestaña se pausa el audio. Revisitar una pregunta acumula actividad, sin reemplazar su primera aparición. `activeMs` puede superar `elapsedMs` si se sigue leyendo después de la última respuesta; no implica un error.

Tiempo total cliente hasta recepción ≈ `received_at - client_started_at`, con incertidumbre por reloj del dispositivo/red. No usarlo como tiempo activo de sesión. Para análisis usar el campo apropiado y conservar faltantes como faltantes. Los timestamps del cliente son manipulables; no son evidencia de identidad ni una defensa antifraude.

Pendiente: métricas de primer compromiso vs respuesta final, dwell exacto por visita, duración activa total separada, reanudación entre dispositivos y eventos de suspensión del sistema. Validar temporización en Safari/iOS y Android con el equipo real.
