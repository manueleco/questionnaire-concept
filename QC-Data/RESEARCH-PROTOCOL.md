# Protocolo MPC — borrador, no prerregistrado

## Pregunta y estimando

Propuesta: **A igual sonoridad integrada medida, ¿cómo afecta el nivel de saturación de una mezcla a la sonoridad percibida, la claridad, la aspereza y la intensidad emocional expresada por la música?**

Sonoridad percibida como resultado primario propuesto. Claridad, aspereza y emoción como secundarios. Confirmar con el equipo antes del piloto. No confundir manipulación de nivel de reproducción, compresión dinámica y saturación; son experimentos distintos.

## Diseño recomendado

Medidas repetidas: cada participante escucha las mismas versiones de cada fragmento. Tres niveles operativamente definidos de saturación, con procesamiento documentado, igual duración, alineación temporal y canalización. Usar varios fragmentos para no confundir el efecto de saturación con una única canción. Decidir si se limita a un género o se usan géneros distintos; con pocas canciones no se podrá generalizar un “efecto del género”.

Asignar las seis permutaciones A/B/C de forma contrabalanceada cuando haya backend de asignación del estudio; la PoC sólo hace permutación aleatoria por sesión, no balance garantizado. Randomizar orden de pistas. Mantener etiquetas A/B/C estables dentro del fragmento. El orden de las dimensiones de pregunta también puede influir: decidir y registrar una estrategia previa al estudio.

La PoC implementa un solo bloque A/B/C y seis preguntas. Múltiples pistas, asignación balanceada, estímulos definitivos y chequeo validado de auriculares están pendientes.

## Preparación de audio

Partir de audio con permiso de uso, transformación y distribución. Preferir producción propia o licencias adecuadas, comprobadas para la grabación concreta. Una suscripción a Spotify/Apple Music no acredita esos permisos. CC BY exige atribución; evitar material ND para publicar adaptaciones sin autorización. [Licencias CC](https://creativecommons.org/share-your-work/cclicenses/)

Documentar algoritmo/plugin, versión, drive, oversampling, filtros, compensación de latencia y cualquier limitador. Mantener el resto de la cadena constante. Medir sobre el mismo intervalo: LUFS integrado, loudness range y true peak; registrar hashes. El objetivo/tolerancia de loudness se fija para el estudio después de pilotar, no por costumbre de streaming. Igualar LUFS no garantiza igual percepción ni calibración SPL. La norma de medición es [ITU-R BS.1770](https://www.itu.int/rec/R-REC-BS.1770-5-202311-I/en).

Los audios aportados son mono a 22.050 Hz y unos 202 s. Se extrajeron 40–60 s, sin normalización. LUFS de entrada: ruido −15,85; compresión −18,46; EQ −16,80; reverberación −15,79. El informe `audio-measurements.json` incluye la salida simulada del filtro loudnorm porque se usó como medidor hacia un sumidero; **los WAV guardados no se normalizaron**. Sólo los campos `input_*` describen los extractos.

## Procedimiento propuesto

1. Información de estudio/consentimiento institucional, auriculares, entorno y perfil mínimo.
2. Ajuste a nivel cómodo y bajo; mantener el volumen. Una posición del 50–60% no equivale a un nivel físico común entre dispositivos. Valorar un procedimiento de referencia reproducible y pilotarlo.
3. Familiarización independiente de las pruebas.
4. Chequeo de auriculares basado en un procedimiento publicado; no presentarlo como examen auditivo. [Woods et al., 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5693749/)
5. Escucha y comparación sincronizada; rankings y alternativas “sin diferencia” / “no puedo juzgar”. No equiparar estas respuestas a empates parciales: la PoC sólo permite empate de las tres versiones.
6. Pregunta abierta opcional y cierre. No revelar condiciones antes de completar todas las pruebas.

Duración de 7 minutos en las notas = objetivo por pilotar, no cifra demostrada. La longitud del extracto para emoción debe basarse en piloto/literatura, no deducirse del extracto de 20 s usado en la demo.

## Preguntas y ambigüedades

- Loudness: intensidad sonora percibida, no posición del volumen.
- Clarity: distinguir elementos individuales, no “calidad” general.
- Harshness: cualidad abrasiva/punzante; separada de claridad.
- Emotion: intensidad de emoción expresada; no valencia ni arousal ni estado personal. Si se quieren estos constructos, añadir instrumentos separados con anclajes claros.
- Motivo: exploratorio; las opciones “agresivo” y “cálido” pueden orientar las respuestas. Considerar texto libre primero o randomizar opciones, y no usarlo como explicación causal.
- Formación: el selector PoC es simplificado; el estudio debería permitir tipos múltiples y años/actividad con necesidad justificada. No inferir expertise sólo de autodefinición.

## Análisis propuesto

La unidad de muestreo es la persona; las respuestas dentro de ella y dentro de pista están correlacionadas. No analizar cada comparación como persona independiente. Para rankings completos usar un modelo de preferencias/ranking con estructura por participante y pista; si se convierten a pares, conservar esa dependencia. Empates e incertidumbre necesitan tratamiento explícito, no puntuaciones inventadas ni eliminación automática.

Con suficientes pistas/participantes, considerar modelos mixtos y estimaciones con intervalos de incertidumbre. Un test de Friedman puede servir a una comparación sencilla de rankings completos, pero no resuelve por sí solo pistas múltiples, faltantes o estructura jerárquica. No asumir que distancias ordinales son intervalos para aplicar ANOVA.

Definir un resultado primario, controlar multiplicidad de secundarios, separar análisis confirmatorio y exploratorio, y reportar magnitud del efecto. Tamaño muestral mediante simulación/potencia con efecto mínimo relevante e información del piloto; no fijar N arbitrariamente. Reclutamiento de conveniencia y ISMIR pueden sesgar formación y hábitos; describir muestra y límites de generalización.

Tiempos rápidos, fallos de audio y respuestas planas son señales a revisar, no prueba de mala fe. Definir exclusiones antes del análisis y realizar sensibilidad con/sin ellas. No excluir a quien no percibe una diferencia.

## Bibliografía aportada

Las notas originales contienen Dean et al., Eerola/Vuoskoski, Schubert, Bannister, Jones/Friberg, Welch/Fremaux y Gabrielsson, entre otros. Se conserva íntegra en `Inputs/`. Pendiente comprobar referencias y leer los artículos antes de derivar hipótesis o elegir instrumentos. Las afirmaciones de las notas no se consideran evidencia verificada.
