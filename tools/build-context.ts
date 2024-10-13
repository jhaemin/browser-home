import esbuild from 'esbuild'
import { dev, prod } from './build-env'
import { green } from './chalk'
import { logger } from './logger'
import { outdir } from './outdir'

export const buildContext = await esbuild.context({
  entryPoints: ['./src/main.tsx'],
  bundle: true,
  target: 'ES2020',
  minify: prod,
  outdir,
  write: true,
  sourcemap: dev,
  define: {
    'process.env.NODE_ENV': `"${dev ? 'development' : 'production'}"`,
    DEBUG_TOUR: String(Bun.argv.includes('--debug-tour')),
  },
  plugins: [
    {
      name: 'rebuild-notification',
      setup(build) {
        build.onEnd((result) => {
          logger.log(
            `${green('[bundled]')} ${result.errors.length} errors, ${result.warnings.length} warnings - ${new Date().toLocaleTimeString()}`
          )
        })
      },
    },
  ],
})
