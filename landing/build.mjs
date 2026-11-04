// Build each page and fold it into one self-contained HTML.
// Usage: node build.mjs  →  ../dist/TaleStudio_메인_밝은.html (index.html), ../dist/TaleStudio_메인_어두운.html (dark.html)
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const pages = { index: '../dist/TaleStudio_메인_밝은.html', dark: '../dist/TaleStudio_메인_어두운.html' }

for (const [page, out] of Object.entries(pages)) {
  execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, PAGE: page } })
  const dir = `build/${page}`
  let html = readFileSync(join(dir, `${page}.html`), 'utf8')
  for (const f of readdirSync(join(dir, 'assets'))) {
    const body = readFileSync(join(dir, 'assets', f), 'utf8')
    const esc = f.replace(/\./g, '\\.')
    if (f.endsWith('.js')) {
      html = html.replace(new RegExp(`<script[^>]*src="\\./assets/${esc}"[^>]*></script>`), () => '')
      html = html.replace('</body>', () => `<script type="module">${body.replace(/<\/script/g, '<\\/script')}</script>\n</body>`)
    } else if (f.endsWith('.css')) {
      html = html.replace(new RegExp(`<link[^>]*href="\\./assets/${esc}"[^>]*>`), () => `<style>${body}</style>`)
    } else if (f.endsWith('.svg')) {
      html = html.replace(`./assets/${f}`, () => 'data:image/svg+xml;base64,' + Buffer.from(body).toString('base64'))
    }
  }
  if (/\.\/assets\//.test(html)) throw new Error(`${page}: unresolved asset reference left in HTML`)
  writeFileSync(out, html)
  console.log(out, (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB')
}
