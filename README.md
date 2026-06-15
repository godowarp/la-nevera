# La Nevera de Crisp, v2

Versión estructural corregida: la pantalla principal ya no tiene cabecera, pie, menú inferior ni elementos externos. La home es únicamente la nevera.

## Qué cambia en esta versión

- La nevera vacía es la base visual de la pantalla principal.
- Los imanes y notas son elementos independientes superpuestos con CSS.
- Los tres juegos principales funcionan como imanes clicables:
  - Trivial Crisp.
  - ¿Quién dijo esta barbaridad?
  - Crisp Runner.
- Se elimina la navegación inferior.
- Se elimina la cabecera de la home.
- Se mantiene estructura PWA básica.
- Se incluye `assets/reference-fridge-with-magnets.png` solo como referencia visual, no se usa como interfaz final.

## Cómo subirlo a GitHub Web

1. Descomprime el ZIP.
2. Sube el contenido completo a la raíz del repositorio, sustituyendo los archivos anteriores.
3. Asegúrate de que quedan en la raíz:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.webmanifest`
   - `sw.js`
   - carpeta `assets`
4. Haz commit.
5. Espera a que GitHub Pages actualice.
6. Si no ves cambios, limpia caché o abre en incógnito, porque la PWA puede conservar archivos antiguos.

## Nota técnica

Ahora mismo los imanes son elementos HTML/CSS independientes. Cuando tengas los imanes definitivos generados como PNG transparentes, se pueden sustituir por imágenes individuales sin cambiar la lógica de navegación.
