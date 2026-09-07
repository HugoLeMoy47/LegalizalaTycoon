# 🔒 Política de Seguridad

## Superficie de ataque

Este proyecto es una aplicación **100% del lado del cliente**:

* No hay servidor de backend ni base de datos.
* No hay autenticación, cuentas de usuario ni sesiones.
* No se recolecta, transmite ni almacena ningún dato personal.
* El único almacenamiento es `localStorage` del navegador, con la partida en curso,
  bajo la clave `iniciativa-ciudadana:partida:v1`. Ese dato nunca sale del dispositivo.
* No hay analítica, telemetría ni peticiones de red en tiempo de ejecución, salvo la
  carga de tipografías desde Google Fonts.

En consecuencia, la superficie de ataque relevante se reduce a la cadena de suministro
(dependencias npm) y al proceso de build y despliegue.

## Versiones con soporte

| Versión | Soporte |
| :--- | :--- |
| `main` | ✅ |
| Etiquetas anteriores | ❌ |

## Cómo reportar una vulnerabilidad

**No abras un issue público** para reportar una vulnerabilidad.

Usa la función de **Security Advisories** de GitHub en este repositorio
(*Security → Report a vulnerability*), o escribe al equipo mantenedor por un canal
privado.

Incluye, en la medida de lo posible:

* Descripción de la vulnerabilidad y su impacto.
* Pasos para reproducirla.
* Versión, navegador y sistema operativo.
* Cualquier mitigación que hayas identificado.

## Qué esperar

* Acuse de recibo dentro de los **5 días hábiles**.
* Evaluación inicial y clasificación dentro de los **10 días hábiles**.
* Si se confirma, se acuerda una ventana de divulgación coordinada antes de publicar
  el arreglo.
* Se dará crédito público a quien reporte, salvo que prefiera el anonimato.

## Dependencias

La CI corre en cada push a `main` y en cada pull request. Para revisar vulnerabilidades
conocidas de las dependencias:

```bash
npm audit
```

Los reportes de `npm audit` sobre dependencias de desarrollo que no llegan al bundle de
producción se tratan con prioridad baja, salvo que afecten la integridad del proceso de
build.
