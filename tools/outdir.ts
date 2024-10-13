import { rm } from 'node:fs/promises'
import { dev } from './build-env'

export const outdir = `./dist${dev ? '/debug' : '/release'}`

export async function clearOutdir() {
  await rm(outdir, { recursive: true, force: true })
}
