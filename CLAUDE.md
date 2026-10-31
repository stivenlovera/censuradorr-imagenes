# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto

SPA de Vite + React 19 (TypeScript, Tailwind 4 vía `@tailwindcss/vite`) para censurar (difuminar) zonas de imágenes en el navegador y exportarlas como ZIP numerado. Es un proyecto git independiente dentro del workspace `E:\kyaaa` (ver `E:\kyaaa\CLAUDE.md`); no hay backend. La UI está en español.

## Comandos

- `npm run dev` — servidor de Vite
- `npm run build` — `tsc -b && vite build` (salida en `dist/`)
- `npm run lint` — ESLint (configuración flat en `eslint.config.js`)
- `npm run preview` — sirve el build
- No hay tests. El `README.md` es la plantilla por defecto de Vite.
- Despliegue: `Dockerfile` (build con Node 20 y servido con nginx) + `captain-definition` para CapRover.

## Arquitectura

- `src/App.tsx` concentra el estado (`imagesOriginal: IImage[]`, nombre del pack, índice de la imagen abierta en el editor). Aquí también se define y exporta `IImage`, que `utils/zip.ts` importa.
- Flujo: el `<input type="file" multiple>` crea entradas `IImage` (`pagina` = posición 1-based, `data` = object URL, `file` = `File` original). Al hacer clic en una miniatura se abre `components/editor-custom.tsx`, un modal que envuelve `useImageEditor` de `@ozdemircibaris/react-image-editor/core` (herramienta de blur con `defaultColor` negro y `strokeWidth` 0, deshacer/rehacer). Al guardar, `editor.exportToBlob()` → `blobToFile(..., <nombre original>.png, 'image/png')` reemplaza la entrada en la posición `preview` (conserva el nombre original y solo cambia la extensión a `.png`).
- `utils/zip.ts` (`exportFile(files, nombre, rename)`) genera el ZIP con `jszip`. Con la casilla "Renombrar con números" marcada (por defecto) nombra cada archivo `<num>.<ext>` con `getZeroFill` (`utils/nameFile.ts`, ceros a la izquierda según el total de imágenes) y la extensión sacada del MIME (`getFormat`). Desmarcada, conserva el nombre original de cada archivo (con sufijo `-2`, `-3`… si se repite).
- El esquema de nombres numerados es un contrato con `markwater-kyaaa`, que usa el nombre sin extensión como `page.num` y espera `.png`; las imágenes editadas se guardan como PNG, pero las no editadas conservan su formato original en el ZIP.

## Peculiaridades

- `App.tsx` muta `imagesOriginal` con `push` antes de llamar a `setImageOriginal([...])`, y `pagina` se calcula con el índice del lote seleccionado, no del total: cargar un segundo lote duplica números de `pagina` (`onSave` ya busca por posición, así que no le afecta).
- `utils/others.ts` (`blobToFile`) no tiene tipos en sus parámetros; compila porque `tsconfig.app.json` tiene `"noImplicitAny": false` aunque `strict` sea `true`.
