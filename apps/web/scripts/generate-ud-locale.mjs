/**
 * Generates the "Upside-Down" (UD) locale catalog by applying an
 * upside-down character transformation to the English (en) catalog.
 *
 * Usage:  node scripts/generate-ud-locale.mjs
 * Expects: src/app/i18n/locales/en.po  (must already exist)
 * Writes:  src/app/i18n/locales/ud.po
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const EN_PO = resolve(ROOT, 'src/app/i18n/locales/en.po')
const UD_PO = resolve(ROOT, 'src/app/i18n/locales/ud.po')

/* ── Upside-down character mapping ────────────────────────────── */

const FLIP = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ',
  g: 'ɓ', h: 'ɥ', i: 'ı', j: 'ɾ', k: 'ʞ', l: 'ʃ',
  m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ',
  s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x',
  y: 'ʎ', z: 'z',
  A: '∀', B: 'ß', C: 'Ɔ', D: 'p', E: 'Ǝ', F: 'Ⅎ',
  G: '⅁', H: 'H', I: 'I', J: 'ſ', K: 'ʞ', L: '˥',
  M: 'W', N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ',
  S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X',
  Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': '2', '3': 'Ɛ', '4': 'ᔭ',
  '5': '5', '6': '9', '7': '⧖', '8': '8', '9': '6',
  '.': '˙', ',': "'", '?': '¿', '!': '¡',
  '"': '„', "'": ',', '(': ')', ')': '(',
  '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '&': '⅋', '_': '‾',
}

function flipText(text) {
  return [...text].map((ch) => FLIP[ch] ?? ch).reverse().join('')
}

/* ── Parse & transform line by line ──────────────────────────--- */

const en = readFileSync(EN_PO, 'utf-8')
const lines = en.split('\n')
const out = []
let currentMsgid = null

for (const line of lines) {
  const msgid = line.match(/^msgid "(.*)"$/)
  if (msgid) {
    currentMsgid = msgid[1]
    out.push(line)
    continue
  }

  // Replace msgstr value with flipped version of the last msgid.
  // Skip the header entry (msgid "" has an empty-string msgid).
  const msgstr = line.match(/^(msgstr ")(.*)(")$/)
  if (msgstr && currentMsgid !== null && currentMsgid !== '') {
    out.push(msgstr[1] + flipText(currentMsgid) + msgstr[3])
    // Reset so subsequent msgstr lines (multiline) aren't blindly replaced
    currentMsgid = null
    continue
  }

  out.push(line)
}

// Fix the Language header in the metadata block
const result = out.join('\n').replace(
  '"Language: en\\n"',
  '"Language: ud\\n"',
)

writeFileSync(UD_PO, result)
console.log(`✓ Generated UD locale at ${UD_PO}`)
