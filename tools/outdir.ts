import { rm } from 'node:fs/promises'

export const outdir = './dist'

export async function clearOutdir() {
  await rm(outdir, { recursive: true, force: true })
}
