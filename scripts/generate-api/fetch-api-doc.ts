import fs from 'fs'
import fetch from 'node-fetch'
import { prettierLog } from '../utils/prettier-log'
import { OPENAPI_FILE, OPENAPI_URL } from './path'

const { pStrong, pError, pSuccess } = prettierLog({
  moduleName: 'Fetch-api-doc',
})

async function main() {
  pStrong('Start fetch openapi.json...')
  const res = await fetch(OPENAPI_URL)
  if (!res.ok) {
    pError('Fetch failed: ' + res.statusText)
    process.exit(1)
  }

  const specJson = await res.text()
  fs.writeFileSync(OPENAPI_FILE, specJson)
  pSuccess('API doc fetched: ' + OPENAPI_FILE)
}

main().catch((err) => {
  pError('ERROR: ', err)
  process.exit(1)
})
