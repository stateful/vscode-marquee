import { getRawPackument, pullRemoteRegistry } from '../../src/js/registry'
import * as util from '../../src/util'

const fetch = jest.fn(
  async () => ({
    json: async () => ({
      homepage: 'https://homepage.com',
      repository: 'https://github.com/repo',
      'dist-tags': { latest: '0.1.0' },
      versions: {
        '0.1.0': {
          version: '0.1.0',
        }
      }
    })
  })
)

;(util as any).getFetch = () => fetch

afterEach(() => fetch.mockClear())

test('getRawPackument', async () => {
  const packument = await getRawPackument('package', 'https://registry.com')

  expect(fetch).toBeCalledWith('https://registry.com/package')

  expect(packument).toMatchSnapshot()
})

test('pullRemoteRegistry', async () => {
  const remoteRegistry = await pullRemoteRegistry (
    {
      repo: {
        dependencies: {
          foo: { name: 'foo', packageVersion: '0.0.1' },
          bar: { name: 'bar', packageVersion: '0.0.1' },
        }
      } as any
    },
    'https://registry.com'
  )

  expect(fetch).toBeCalledWith('https://registry.com/foo')
  expect(fetch).toBeCalledWith('https://registry.com/bar')

  expect(remoteRegistry).toMatchSnapshot()
})