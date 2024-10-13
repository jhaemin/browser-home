export const dev = Bun.argv.includes('--dev')
export const prod = !dev
