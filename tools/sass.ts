/**
 * Compile only the `*.entry.scss` files.
 */

import * as sass from 'sass'
import { outdir } from './outdir'

export async function compileSCSS(path: string) {
  const fileName = path.split('/').at(-1)

  if (
    !fileName ||
    !fileName.endsWith('.scss') ||
    !fileName.includes('.entry')
  ) {
    return
  }

  const relativePath = path
    .replace(/^(\.\/)?src\//g, '')
    .replace('.entry.scss', '.css')

  try {
    const result = await sass.compileAsync(path)

    // If there's no CSS, return.
    // For example, if the SCSS file is empty or no properties are defined.
    if (!result.css) return

    await Bun.write(`${outdir}/${relativePath}`, result.css)
  } catch (err) {
    console.log(err)
  }
}

export async function compileAllSCSS() {
  const sassGlob = new Bun.Glob('./src/**/*.entry.scss')

  for await (const path of sassGlob.scan('.')) {
    await compileSCSS(path)
  }
}
