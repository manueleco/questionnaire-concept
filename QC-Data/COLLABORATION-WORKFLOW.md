# Trabajo separado de plataforma y estudios

## Plataforma

Este repositorio contiene Django, frontend, tipos de preguntas, traducciones, accesibilidad, roles y controles de seguridad reutilizables. El trabajo actual se entrega en `mpc`; el nombre de rama no convierte el motor en una implementación exclusiva de MPC. No fusionar a main ni publicar una demo por el solo hecho de guardar contexto.

Leer `AGENTS.md`, `docs/agent-context.md`, la última entrada de `docs/handoff.md` y QC-Data antes de continuar. Verificar rama y archivos: las notas no sustituyen el estado real. Un solo chat debe editar este checkout a la vez.

## Estudios

Cada estudio mantiene su propio repositorio, protocolo, documentación de estímulos autorizados, configuración local y datos fuera de Git. Consume un commit verificado de la plataforma; no modifica directamente su submódulo. Los requisitos del motor se trasladan al chat de plataforma, se prueban aquí y después se adopta la versión desde el chat del estudio.

El chat de plataforma no modifica repositorios privados ni repositorios de colaboradores. No compartir bases de datos, exportaciones, credenciales, archivos de entorno ni materiales restringidos para coordinar chats. Comunicar requisitos, versión y resultados mínimos de pruebas.

## Entrega

Registrar el commit de plataforma, comprobaciones realizadas, cambios de comportamiento y límites. Antes de actualizar una dependencia, verificar que el árbol de trabajo del estudio esté limpio y revisar su contrato de datos. Un nombre de rama mutable no sustituye la referencia fija del commit.
