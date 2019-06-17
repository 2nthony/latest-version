#!/usr/bin/env node

const cac = require('cac')
const latestVersion = require('latest-version')

const cli = cac('latest-version')

cli
  .command('[...packages]', 'Get the latest version of npm packages')
  .option('-V, --verbose', 'Verbose output')
  .action(
    handleError(async (packages, options) => {
      if (packages.length === 0) return cli.outputHelp()

      const Listr = require('listr')
      const chalk = require('chalk')

      const longestLength = findLongest(packages)

      const tasks = new Listr(
        packages.map(pkg => {
          const { name, rawTag, tag } = handlePkgName(pkg)
          return {
            title: `${name}${chalk.dim(rawTag)}`,
            task: async (_, task) => {
              const version = await latestVersion(name, {
                version: tag
              })

              task.title = `${task.title}${padRight(
                pkg,
                longestLength
              )} ${chalk.green(version)}`
            }
          }
        }),
        {
          concurrent: true,
          renderer:
            process.env.CI || !process.stdout.isTTY || options.verbose
              ? 'verbose'
              : 'default'
        }
      )

      await tasks.run()
    })
  )

cli.help()

cli.version(require('./package.json').version)

cli.parse()

function handleError(fn) {
  return async (...args) => {
    try {
      await fn(...args)
    } catch (error) {
      console.error(error.stack)
      process.exit(1)
    }
  }
}

function handlePkgName(pkg) {
  const [rawTag, tag] = pkg.match(/@(\w+)$/) || ['', 'latest']
  const name = pkg.replace(rawTag, '')

  return {
    name,
    rawTag,
    tag
  }
}

function findLongest(arr) {
  return arr.reduce((res, next) => {
    const { length } = next
    return length > res ? length : res
  }, 0)
}

function padRight(str, length) {
  return `${' '.repeat(length - str.length)}`
}
