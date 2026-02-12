import fs from 'fs'
import { execSync } from 'child_process'
import { prettierLog } from '../utils/prettier-log'
import { OPENAPI_FILE, OUTPUT_DIR, REQUEST_FILE } from './path'

const { pStrong, pError, pSuccess } = prettierLog({
  moduleName: 'Generate-api',
})

async function main() {
  if (!fs.existsSync(OPENAPI_FILE)) {
    pError('openapi-temp.json not found. Run \'pnpm run api:update\' first.')
    process.exit(1)
  }

  pStrong('Start generate api to ' + OUTPUT_DIR)
  execSync(
    `npx openapi --input ${OPENAPI_FILE} --output ${OUTPUT_DIR} --client axios --useUnionTypes --request ${REQUEST_FILE}`,
    { stdio: 'inherit' },
  )

  pSuccess('API generation complete')
}

main().catch((err) => {
  pError(err)
  process.exit(1)
})
