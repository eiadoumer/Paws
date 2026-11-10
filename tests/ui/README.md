# Optional component interaction checks

The project uses no extra runtime dependencies. These optional development-only checks need a DOM simulation and JSX bundler; they do not require a browser. The tests passed with the project's React dependencies plus @testing-library/react, @testing-library/user-event, jsdom, and esbuild.

From the repository root:

```sh
npm install --no-save --package-lock=false @testing-library/react @testing-library/user-event jsdom esbuild
node --input-type=module -e "import { build } from 'esbuild'; await build({ entryPoints: ['tests/ui/workspace-dom.test.jsx'], outfile: 'tests/ui/workspace-dom.test.mjs', bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic' });"
node --import ./tests/ui/setup.mjs --test tests/ui/workspace-dom.test.mjs
```

Do not commit node_modules or the generated workspace-dom.test.mjs bundle. `npm ci` restores the original locked dependency tree afterward. Native dialog open/close is stubbed in jsdom, so browser focus containment and responsive visual layout still require a real browser review.

Additional motion checks (reduced motion, animated counts, scroll reveal, pointer tilt, and celebration cleanup):

```sh
node --input-type=module -e "import { build } from 'esbuild'; await build({ entryPoints: ['tests/ui/motion.test.jsx'], outfile: 'tests/ui/motion.test.mjs', bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic' });"
node --import ./tests/ui/setup.mjs --test tests/ui/motion.test.mjs
```

These tests verify behavior and cleanup in a simulated DOM. They do not verify rendered animation appearance in a real browser.

Photo upload checks:

```sh
node --input-type=module -e "import { build } from 'esbuild'; await build({ entryPoints: ['tests/ui/photo-upload.test.jsx'], outfile: 'tests/ui/photo-upload.test.mjs', bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic' });"
node --import ./tests/ui/setup.mjs --test tests/ui/photo-upload.test.mjs
```

Photo decoding uses an Image stub in these DOM tests; browser image rendering requires real-browser review.
