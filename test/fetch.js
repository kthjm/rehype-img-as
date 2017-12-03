import assert from 'assert'
import rewire from 'rewire'

describe(`fetch.js`, () => {
  const modules = rewire(`../src/fetch.js`)

  describe(`fetchSkeleton`, () => {
    const fn = modules.__get__(`fetchSkeleton`)
    const file = './assets/file.md'

    it(`throw because !res.ok`, async () => {
      const currentFetch = global.fetch
      global.fetch = async file => ({ ok: false })
      try {
        await fn(file)
      } catch (err) {
        const expect = `failed to fetch ${file}`
        assert.deepStrictEqual(err.message, expect)
      }
      global.fetch = currentFetch
    })

    it(`success`, async () => {
      const currentFetch = global.fetch
      const expect = { ok: 'success' }
      global.fetch = async file => expect
      const result = await fn(file)
      assert.deepStrictEqual(result, expect)
      global.fetch = currentFetch
    })
  })

  describe(`fetchToHast`, () => {
    const afn = modules.__get__(`fetchToHast`)

    it(`void because fetchSkeleton throw`, async () => {
      const setAfter = {
        fetchSkeleton: modules.__get__(`fetchSkeleton`)
      }

      modules.__set__({
        fetchSkeleton: async file => {
          throw new Error(`errorMessage`)
        }
      })

      const result = await afn()
      const expect = undefined
      assert.deepStrictEqual(result, expect)

      modules.__set__(setAfter)
    })

    it(`success`, async () => {
      const setAfter = {
        fetchSkeleton: modules.__get__(`fetchSkeleton`),
        htmlToHast: modules.__get__(`htmlToHast`)
      }

      const expect = `expectHTML`
      modules.__set__({
        fetchSkeleton: async file => ({
          text: () => file
        }),
        htmlToHast: html => html
      })

      const result = await afn(expect)
      assert.deepStrictEqual(result, expect)

      modules.__set__(setAfter)
    })
  })

  describe(`fetchToBlobUrl`, () => {
    const afn = modules.__get__(`fetchToBlobUrl`)

    it(`leave as it because fetchSkeleton throw`, async () => {
      const currentURL = global.URL
      const fetchSkeleton = modules.__get__(`fetchSkeleton`)

      modules.__set__({
        fetchSkeleton: async file => {
          throw new Error(`errorMessage`)
        }
      })

      const expect = 'expectFileName'
      const result = await afn(expect)
      assert.deepStrictEqual(result, expect)

      global.URL = currentURL
      modules.__set__({ fetchSkeleton })
    })

    it(`success`, async () => {
      const currentURL = global.URL
      const fetchSkeleton = modules.__get__(`fetchSkeleton`)

      modules.__set__({
        fetchSkeleton: async file => ({
          blob: () => file
        })
      })
      global.URL = {
        createObjectURL: blob => blob
      }

      const expect = `expectFileName`
      const result = await afn(expect)
      assert.deepStrictEqual(result, expect)

      global.URL = currentURL
      modules.__set__({ fetchSkeleton })
    })
  })

  it(`htmlToHast`, () => {
    const fn = modules.__get__(`htmlToHast`)
    const processor = require('rehype')().data(`settings`, {
      fragment: true,
      position: false
    })

    const html = `<div><p><span>foo</span></p></div>`
    const result = fn(html)
    const expect = processor.parse(html)
    assert.deepStrictEqual(result, expect)
  })
})
