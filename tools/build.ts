/**
 * If there are any changes in imported files (e.g. `manifest.ts`, scripts, etc.),
 * the entire build process will be re-run thanks to the `--watch` flag in Bun.
 * So it isn't required to explicitly watch for changes in the `manifest.ts` file.
 */

import { cp, rm } from 'node:fs/promises'
import { manifest } from '@/manifest'
import chok from 'chokidar'
import { buildContext } from './build-context'
import { dev, prod } from './build-env'
import { cyan, green, red, yellow } from './chalk'
import { copyAllStaticFiles } from './copy-all-static-files'
import { generateManifest } from './generate-manifest'
import { logger } from './logger'
import { clearOutdir, outdir } from './outdir'
import { compileAllSCSS } from './sass'

// Display build information
logger.log(`${yellow('[version]')} ${manifest.version}`)
logger.log(`${red('[mode]')} ${dev ? 'development' : 'production'}`)

// Initial build process
await clearOutdir()
const staticFiles = await copyAllStaticFiles()
await generateManifest({ staticFiles })
await compileAllSCSS()

if (prod) {
  // Build once in production mode
  await buildContext.rebuild()

  // Exit the process if in production mode
  process.exit()
}

// Watch for changes if in development mode
if (dev) {
  await buildContext.watch()

  logger.log(`${cyan('[watch]')} watching for changes...`)

  chok
    .watch('./src', {
      ignoreInitial: true,
    })
    .on('all', async (event, path) => {
      const relativePath = path.replace(/^src\//g, '')

      // Static files that don't require building
      if (
        path.endsWith('.html') ||
        path.endsWith('.css') ||
        path.endsWith('.png') ||
        path.endsWith('.svg')
      ) {
        if (event === 'add' || event === 'change') {
          logger.log(`${green('[copied]')} ${path}`)

          await cp(path, `${outdir}/${relativePath}`, { force: true })

          if (event === 'add') {
            staticFiles.push(relativePath)
            await generateManifest({ staticFiles })
          }
        } else if (event === 'unlink') {
          logger.log(`${red('[removed]')} ${path}`)

          await rm(`${outdir}/${relativePath}`)

          const index = staticFiles.indexOf(relativePath)

          if (index > -1) {
            staticFiles.splice(index, 1)
            await generateManifest({ staticFiles })
          }
        }
      } else if (path.endsWith('.scss')) {
        if (event === 'add' || event === 'change') {
          logger.log(`${yellow('[compiled]')} ${path}`)
          // Compile all SCSS files because we don't know
          // which SCSS files are importing the changed file
          await compileAllSCSS()
        } else if (event === 'unlink') {
          logger.log(`${red('[removed]')} ${path}`)
          const cssPath = relativePath.replace('.entry.scss', '.css')
          await rm(`${outdir}/${cssPath}`, { force: true }) // Ignore if the file doesn't exist
        }
      }
    })
}
