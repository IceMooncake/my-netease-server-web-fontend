import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
      continue
    }

    const ext = path.extname(entry.name).toLowerCase()
    if (IMAGE_EXTS.has(ext)) {
      files.push(fullPath)
    }
  }

  return files
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function optimizeImage(filePath: string): Promise<void> {
  const ext = path.extname(filePath).toLowerCase()
  const input = await fs.readFile(filePath)
  const before = input.byteLength

  let output: Buffer
  if (ext === '.png') {
    output = await sharp(input)
      .png({ compressionLevel: 9 })
      .toBuffer()
  } else if (ext === '.webp') {
    output = await sharp(input)
      .webp({ quality: 75 })
      .toBuffer()
  } else {
    output = await sharp(input)
      .jpeg({ quality: 75, mozjpeg: true })
      .toBuffer()
  }

  if (output.byteLength < before) {
    await fs.writeFile(filePath, output)
    const saved = before - output.byteLength
    console.log(`Optimized ${filePath}: ${formatSize(before)} -> ${formatSize(output.byteLength)} (saved ${formatSize(saved)})`)
  } else {
    console.log(`Skipped ${filePath}: ${formatSize(before)} (no savings)`) 
  }
}

async function main(): Promise<void> {
  if (process.env.SKIP_IMAGE_OPT === '1') {
    console.log('Image optimization skipped (SKIP_IMAGE_OPT=1).')
    return
  }

  const root = process.cwd()
  const targetDirs = [path.join(root, 'assets')]

  const existingDirs = []
  for (const dir of targetDirs) {
    try {
      const stat = await fs.stat(dir)
      if (stat.isDirectory()) existingDirs.push(dir)
    } catch {
      // Ignore missing directory.
    }
  }

  if (existingDirs.length === 0) {
    console.log('No image directories found to optimize.')
    return
  }

  const files = (await Promise.all(existingDirs.map(walk))).flat()
  if (files.length === 0) {
    console.log('No images found to optimize.')
    return
  }

  console.log(`Optimizing ${files.length} image(s)...`)
  for (const filePath of files) {
    await optimizeImage(filePath)
  }
}

main().catch((error) => {
  console.error('Image optimization failed:', error)
  process.exit(1)
})
