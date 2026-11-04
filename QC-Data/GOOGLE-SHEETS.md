# Google Sheets como vista de trabajo

La BD transaccional es la fuente de verdad. El portal exporta CSV autorizado; puede importarse manualmente en un Google Sheet privado. Las exportaciones identificables o seudonimizadas requieren los mismos controles que el dato original.

Se incluye un adaptador opcional para resúmenes agregados: `core/management/commands/sync_sheets.py`. No se ha creado ni modificado una hoja en tu cuenta y no hay credenciales configuradas.

## Conectar cuando se apruebe el destino

1. Crear una hoja dedicada en el Workspace aprobado y una pestaña `summary_` seguida de los primeros 12 caracteres del UUID del protocolo sin guiones. Para la semilla: `summary_00b4db1b8474`.
2. Habilitar Sheets API y configurar Application Default Credentials para una identidad de servicio con acceso sólo a esa hoja. Preferir identidad de carga de trabajo a clave permanente. Si se usa JSON de credencial, guardarlo fuera de Git y nunca enviarlo por chat.
3. Compartir únicamente esa hoja con la identidad de servicio.
4. Instalar dependencias opcionales y exportar `GOOGLE_SHEETS_ID` en el entorno.

```sh
.venv/bin/python -m pip install -r integrations/requirements-google.txt
.venv/bin/python manage.py sync_sheets 00b4db1b-8474-4378-9e21-7f1241459230
.venv/bin/python manage.py sync_sheets 00b4db1b-8474-4378-9e21-7f1241459230 --apply
```

Sin `--apply` sólo se informa cuántas filas se exportarían. Con `--apply` se limpia A:D de la pestaña dedicada y se reemplaza por el resumen: protocolo, pregunta, tipo de respuesta y conteo. Grupos menores de 5 no se exportan. No incluye texto, IDs de participante, tiempos ni claves. No sobrescribir una pestaña con trabajo manual.

Si falla el write después del clear, la pestaña queda vacía y se debe reintentar desde BD. No es una transacción distribuida. Para producción agregar cola/outbox, bloqueo por protocolo, reintentos, auditoría de servicio y control de cambios en fórmulas/columnas. Revisar legalmente proveedor y acceso antes de tratar datos reales.
