import { manifest } from '@/manifest'
import { biome } from './biome'
import { outdir } from './outdir'

export async function generateManifest(data: { staticFiles: string[] }) {
  const { staticFiles } = data ?? {}

  if (staticFiles) {
    manifest.web_accessible_resources = [
      {
        matches: ['<all_urls>'],
        resources: staticFiles,
      },
    ]
  }

  const manifestString = JSON.stringify(manifest, null, 2)

  const formatted = biome.formatContent(manifestString, {
    filePath: 'manifest.json',
  })

  await Bun.write(`${outdir}/manifest.json`, formatted.content)
}
