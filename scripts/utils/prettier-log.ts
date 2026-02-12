import chalk from 'chalk'
export function prettierLog(option: { moduleName: string }) {
  const nameLog = chalk.bold(`[${option.moduleName}]`)
  function pStrong(...args: unknown[]) {
    console.log(nameLog, chalk.bold(...args))
  }
  function pLog(...args: unknown[]) {
    console.log(nameLog, chalk.white(...args))
  }
  function pSuccess(...args: unknown[]) {
    console.log(nameLog, chalk.green(...args))
  }
  function pWarn(...args: unknown[]) {
    console.log(nameLog, chalk.yellow(...args))
  }
  function pError(...args: unknown[]) {
    console.log(nameLog, chalk.red(...args))
  }
  return {
    pStrong,
    pLog,
    pSuccess,
    pWarn,
    pError,
  }
}
