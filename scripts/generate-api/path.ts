import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// API doc url
export const OPENAPI_URL = 'http://127.0.0.1:3000/openapi.json'
// doc path
export const OPENAPI_FILE = path.resolve(__dirname, '../../docs/openapi.json')
// request.ts
export const REQUEST_FILE = path.resolve(__dirname, '../../lib/request/request.ts')
// generated api output dir
export const OUTPUT_DIR = path.resolve(__dirname, '../../app/api')
// service directory
export const SERVICE_DIR = path.resolve(__dirname, '../../app/api/services')
