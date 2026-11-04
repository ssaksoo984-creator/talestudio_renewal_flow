// Build the landing and fold it into one self-contained HTML per theme.
// Usage: node build.mjs   →  ../dist/TaleStudio_메인_어두운.html, ../dist/TaleStudio_메인_밝은.html
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

execSync('npx vite build', { stdio: 'inherit' })
let html = readFileSync('build/index.html', 'utf8')
const assets = readdirSync('build/assets')
for (const f of assets) {
  const body = readFileSync(join('build/assets', f), 'utf8')
  if (f.endsWith('.js')) {
    html = html.replace(new RegExp(`<script[^>]*src="\\./assets/${f.replace('.', '\\.')}"[^>]*></script>`), () => '')
    html = html.replace('</body>', () => `<script type="module">${body.replace(/<\/script/g, '<\\/script')}</script>\n</body>`)
  } else if (f.endsWith('.svg')) {
    html = html.replace(`./assets/${f}`, () => 'data:image/svg+xml;base64,' + Buffer.from(body).toString('base64'))
  } else if (f.endsWith('.css')) {
    html = html.replace(new RegExp(`<link[^>]*href="\\./assets/${f.replace('.', '\\.')}"[^>]*>`), () => `<style>${body}</style>`)
  }
}
if (/\.\/assets\//.test(html)) throw new Error('unresolved asset reference left in HTML')
const out = {
  dark: '../dist/TaleStudio_메인_어두운.html',
  light: '../dist/TaleStudio_메인_밝은.html',
}
for (const [theme, path] of Object.entries(out)) {
  writeFileSync(path, html.replace('data-theme="dark"', `data-theme="${theme}"`))
  console.log(path, (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB')
}
