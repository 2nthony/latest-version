import test from 'ava'
import execa from 'execa'

test('main', async t => {
  const { stdout } = await execa('./cli.js', [
    'loading-screen',
    'git-delete-branch'
  ])
  t.truthy(stdout)
})

test('with scope', async t => {
  const { stdout } = await execa('./cli.js', ['@evillt/latest-version'])
  t.truthy(stdout)
})

test('with tag', async t => {
  const { stdout } = await execa('./cli.js', ['vuepress@next'])
  t.truthy(stdout)
})
