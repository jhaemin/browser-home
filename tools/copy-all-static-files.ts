import { cp } from 'node:fs/promises'
import { logger } from './logger'
import { outdir } from './outdir'

export async function copyAllStaticFiles() {
  const glob = new Bun.Glob('./src/**/*.{html,css,png,svg}')
  const staticFiles: string[] = []

  // Copy static files
  // e.g.) ./src/icons/icon16.png -> ./dist/icons/icon16.png
  for await (const file of glob.scan('.')) {
    const fileName = file.replace(/^\.\/src\//g, '')
    staticFiles.push(fileName)
    await cp(file, `${outdir}/${fileName}`)
  }

  logger.success('copied static files')

  return staticFiles
}
