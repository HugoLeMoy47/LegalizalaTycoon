## Qué cambia

<!-- Describe qué cambia PARA EL JUGADOR, no solo qué cambia en el código. -->

## Por qué

<!-- Issue relacionado, decisión de la bitácora o problema observado. -->

Closes #

## Tipo de cambio

- [ ] Corrección de error
- [ ] Ajuste de balanceo
- [ ] Mecánica nueva del motor
- [ ] Interfaz / presentación
- [ ] Documentación
- [ ] Infraestructura (build, CI, dependencias)

---

## Verificación

- [ ] `npm run verify` pasa en limpio (lint + pruebas + build).
- [ ] Las mecánicas nuevas del motor tienen pruebas en `src/engine/__tests__/`.
- [ ] La lógica de juego quedó en `src/engine`; la UI no calcula reglas.
- [ ] Los números nuevos viven en `src/engine/balance.ts`, con comentario.

## Si tocaste el balanceo

Pega la salida de `npm run sim:matriz` **antes** y **después**:

<details>
<summary>Antes</summary>

```text

```

</details>

<details>
<summary>Después</summary>

```text

```

</details>

- [ ] El estratega colectivo sigue pudiendo ganar.
- [ ] El líder mártir sigue terminando en burnout.
- [ ] El observador pasivo sigue cayendo a la congeladora.
- [ ] Si algún arquetipo cambió de desenlace, lo expliqué arriba.

## Si te apartaste de los documentos normativos

- [ ] Lo documenté en `docs/ARQUITECTURA.md`, sección 5 (Desviaciones documentadas).

## Capturas

<!-- Para cambios de interfaz. -->
