#!/usr/bin/env node
/**
 * One-off: extracts the Wine List sheet from the .xlsm into wines.json
 * Usage: node scripts/extract-wine-list.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const XLSM = join(ROOT, 'Kahani - Wine List - 21.05.2026 CC.xlsm')
const TMP = '/tmp/wine_extract'

execSync(`rm -rf ${TMP} && mkdir -p ${TMP} && unzip -q "${XLSM}" -d ${TMP}`)

const sharedStringsXml = readFileSync(`${TMP}/xl/sharedStrings.xml`, 'utf8')
const sheetXml = readFileSync(`${TMP}/xl/worksheets/sheet4.xml`, 'utf8')

const strings = []
const siRegex = /<si>([\s\S]*?)<\/si>/g
let m
while ((m = siRegex.exec(sharedStringsXml))) {
  const inner = m[1]
  const tParts = [...inner.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map(x =>
    x[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  )
  strings.push(tParts.join(''))
}

const rows = {}
const rowRegex = /<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g
const cellRegex = /<c r="([A-Z]+)(\d+)"(?:\s+s="\d+")?(?:\s+t="(\w+)")?[^>]*>(?:<f[^>]*>[^<]*<\/f>)?(?:<v>([^<]*)<\/v>)?(?:<is><t[^>]*>([^<]*)<\/t><\/is>)?<\/c>/g
let r
while ((r = rowRegex.exec(sheetXml))) {
  const rowNum = parseInt(r[1], 10)
  const cells = {}
  let c
  while ((c = cellRegex.exec(r[2]))) {
    const col = c[1]
    const type = c[3]
    const v = c[4]
    const inline = c[5]
    let value = null
    if (type === 's' && v != null) value = strings[parseInt(v, 10)]
    else if (type === 'inlineStr' && inline != null) value = inline
    else if (v != null) value = isNaN(Number(v)) ? v : Number(v)
    cells[col] = value
  }
  rows[rowNum] = cells
}

// Build sections + wines
const wines = []
let currentSection = null
const sortedKeys = Object.keys(rows).map(Number).sort((a, b) => a - b)
for (const k of sortedKeys) {
  const cells = rows[k]
  if (!cells || Object.keys(cells).length === 0) continue
  const bin = cells.A
  const dText = cells.D
  if (typeof dText !== 'string' || !dText.trim()) continue

  // Section header: D has text, no Bin number
  if (!bin && typeof dText === 'string' && dText.trim()) {
    currentSection = dText.trim()
    continue
  }

  // Wine row: has Bin number
  if (typeof bin === 'number' || (typeof bin === 'string' && /\d/.test(bin))) {
    const [headerLine, grapeLine, ...tastingLines] = dText.split('\r\n').map(s => s.trim()).filter(Boolean)
    wines.push({
      section: currentSection,
      bin,
      vintage: cells.C ?? null,
      name: headerLine,
      grapes: grapeLine ?? null,
      notes: tastingLines.join(' ') || null,
      bottle: cells.F ?? null,
      glass125: cells.I ?? null,
      glass175: cells.J ?? null,
      glass250: cells.K ?? null,
      carafe500: cells.L ?? null,
    })
  }
}

writeFileSync(join(__dirname, '_wines.json'), JSON.stringify(wines, null, 2))
console.log(`Extracted ${wines.length} wines`)
const sections = [...new Set(wines.map(w => w.section))]
console.log('Sections:', sections)
console.log('First wine:', wines[0])
console.log('Last wine:', wines.at(-1))
