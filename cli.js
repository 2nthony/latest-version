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

      const tasks = new Listr(
        packages.map(pkg => {
          return {
            title: `pkg`,
            task: async (_, task) => {
              const version = await latestVersion(pkg)

              task.title = `${pkg} ${chalk.green(version)}`
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
