import assert from 'assert'
import rewire from 'rewire'

describe(`re.js`, () => {
  const modules = rewire(`../src/re.js`)

  it(`default`, async () => {
    const afterSet = {
      separateAltQuery: modules.__get__('separateAltQuery'),
      attrToProperties: modules.__get__('attrToProperties'),
      nodeAfterFetch: modules.__get__('nodeAfterFetch')
    }

    const node = {
      properties: {
        alt: 'as?foo=bar&vaz=10',
        src: 'srcWillBeAssigned'
      }
    }
    modules.__set__({
      separateAltQuery: alt => ({
        attributes: {
          style: 'styleViaAs',
          className: 'classViaAs1,classViaAs2',
          viewBox: 'viewBoxViaAs',
          'data-foo': 'dataFooViaAs'
        }
      }),
      attrToProperties: (style, attributes) => {
        attributes.style = `${attributes.style}Plus`
        attributes.className = attributes.className.split(',')
        return attributes
      },
      nodeAfterFetch: async (node, fetchWay, dirpath) => {
        node.properties.src = 'srcViaAs'
        return node
      }
    })

    const result = await modules.default(node)
    assert.deepStrictEqual(result, {
      properties: {
        alt: `as?foo=bar&vaz=10`,
        src: 'srcViaAs',
        style: 'styleViaAsPlus',
        className: ['classViaAs1', `classViaAs2`],
        viewBox: 'viewBoxViaAs',
        'data-foo': 'dataFooViaAs'
      }
    })

    return modules.__set__(afterSet)
  })

  describe(`separateAltQuery`, () => {
    const fn = modules.__get__('separateAltQuery')

    it(`!alt`, () => {
      const alt = undefined
      assert.deepStrictEqual(fn(alt), {
        fetchWay: undefined,
        attributes: {}
      })
    })

    it(`without fetchQuery`, () => {
      const alt = `as?style=width:100px;height:100px`
      assert.deepStrictEqual(fn(alt), {
        fetchWay: undefined,
        attributes: {
          style: 'width:100px;height:100px'
        }
      })
    })

    it(`with fetchQuery`, () => {
      const alt = `as?fetch=hast&style=width:100px;height:100px`
      assert.deepStrictEqual(fn(alt), {
        fetchWay: 'hast',
        attributes: {
          style: 'width:100px;height:100px'
        }
      })
    })
  })

  describe(`nodeAfterFetch`, () => {
    const afn = modules.__get__('nodeAfterFetch')

    describe(`out of the stage`, () => {
      it(`!src`, async () => {
        const expect = {
          properties: {
            /* no src */
          }
        }
        const result = await afn(expect, 'fetchWay')
        assert.deepStrictEqual(result, expect)
      })

      it(`!fetchWay`, async () => {
        const expect = {
          properties: {
            src: 'src'
          }
        }
        const result = await afn(expect)
        assert.deepStrictEqual(result, expect)
      })

      it(`typeof(fetch) !== "function"`, async () => {
        let currentFetch = global.fetch
        global.fetch = undefined

        const expect = {
          properties: {
            src: 'src'
          }
        }
        const result = await afn(expect, 'fetchWay')
        assert.deepStrictEqual(result, expect)
        global.fetch = currentFetch
      })

      it(`fetchWay !== "hast" | "bloburl"`, async () => {
        const node = {
          properties: {
            src: 'src'
          }
        }
        const fetchWay = 'except'

        try {
          await afn(node, fetchWay)
        } catch (err) {
          const expect = `${fetchWay} is incorrect as query`
          assert.deepStrictEqual(err.message, expect)
        }
      })

      let currentFetch
      before(() => {
        currentFetch = global.fetch
        global.fetch = () => {}
      })
      after(() => {
        global.fetch = currentFetch
      })
    })

    describe(`in stage`, () => {
      const nodeDiffMIME = mime => ({
        properties: {
          src: `foo.${mime}`
        }
      })

      describe(`fetchWay === "hast"`, () => {
        const fetchWay = 'hast'

        it(`throwed because mime !== "svg" | "html"`, async () => {
          const mime = 'png'
          try {
            await afn(nodeDiffMIME(mime), fetchWay)
          } catch (err) {
            const expect = `foo.png can't choise way "hast"`
            assert.deepStrictEqual(err.message, expect)
          }
        })

        it(`ignored because typeof(result by fetchToHast) !== "object"`, async () => {
          const fetchToHast = async fetchPath => undefined
          modules.__set__({ _fetch: { fetchToHast } })

          const mime = 'html'
          const expect = nodeDiffMIME(mime)
          const result = await afn(expect, fetchWay)
          assert.deepStrictEqual(result, expect)
        })

        it(`success`, async () => {
          const expect = { type: 'element' }
          const fetchToHast = async fetchPath => ({
            children: [expect]
          })
          modules.__set__({ _fetch: { fetchToHast } })

          const mime = 'svg'
          const node = nodeDiffMIME(mime)
          const result = await afn(node, fetchWay)
          assert.deepStrictEqual(result, expect)
        })
      })

      describe(`fetchWay === "bloburl"`, () => {
        const fetchWay = 'bloburl'

        it(`fail because mime === "html"`, async () => {
          const mime = 'html'
          try {
            await afn(nodeDiffMIME(mime), fetchWay)
          } catch (err) {
            const expect = `foo.html can't choise way "bloburl"`
            assert.deepStrictEqual(err.message, expect)
          }
        })

        it(`fail because typeof(URL) !== "function"`, async () => {
          let currentURL = global.URL
          global.URL = undefined
          const mime = 'png'
          const expect = nodeDiffMIME(mime)
          const result = await afn(expect, fetchWay)
          assert.deepStrictEqual(result, expect)
          global.URL = currentURL
        })

        it(`success`, async () => {
          const expectSrc = 'success'
          const fetchToBlobUrl = async fetchPath => expectSrc
          modules.__set__({ _fetch: { fetchToBlobUrl } })

          const mime = 'jpg'
          const node = nodeDiffMIME(mime)
          const result = await afn(node, fetchWay)
          assert.deepStrictEqual(result, {
            properties: {
              src: expectSrc
            }
          })
        })

        let currentURL
        before(() => {
          currentURL = global.URL
          global.URL = () => {}
        })

        after(() => {
          global.URL = currentURL
        })
      })

      let currentFetch, afterSet
      before(() => {
        currentFetch = global.fetch
        global.fetch = () => {}
        afterSet = {
          resolveFetchPath: modules.__get__('resolveFetchPath'),
          _fetch: modules.__get__(`_fetch`)
        }
        modules.__set__({ resolveFetchPath: (src, dirpath) => {} })
      })
      after(() => {
        global.fetch = currentFetch
        modules.__set__(afterSet)
      })
    })
  })

  describe(`resolveFetchPath`, () => {
    const fn = modules.__get__('resolveFetchPath')
    const src = `assets/foo.png`

    it(`without dirpath`, () => {
      const result = fn(src)
      const expect = src
      assert.deepStrictEqual(result, expect)
    })

    it(`/rootDir`, () => {
      const dirpath = '/dir/'
      const result = fn(src, dirpath)
      const expect = `/dir/${src}`
      assert.deepStrictEqual(result, expect)
    })

    it(`./currentDir`, () => {
      const dirpath = `./dir/`
      const result = fn(src, dirpath)
      const expect = `dir/${src}`
      assert.deepStrictEqual(result, expect)
    })

    it(`currentDir`, () => {
      const dirpath = `dir/`
      const result = fn(src, dirpath)
      const expect = `dir/${src}`
      assert.deepStrictEqual(result, expect)
    })
  })

  describe(`attrToProperties`, () => {
    const fn = modules.__get__('attrToProperties')
    it(`without style`, () => {
      const style = undefined
      const attributes = {
        id: 'the_id',
        style: 'width:200px;background:blue;position:relative'
      }
      assert.deepStrictEqual(fn(style, attributes), attributes)
    })
    it(`without attributes.style`, () => {
      const style = `width:100px;height:50px;background:red`
      const attributes = {
        id: 'the_id',
        style: undefined
      }
      assert.deepStrictEqual(fn(style, attributes), attributes)
    })
    it(`with style`, () => {
      const style = `width:100px;height:50px;background:red`
      const attributes = {
        id: 'the_id',
        style: 'width:200px;background:blue;position:relative'
      }
      assert.deepStrictEqual(fn(style, attributes), {
        id: 'the_id',
        style: 'width:200px;height:50px;background:blue;position:relative'
      })
    })
  })

  it(`getMIME`, () => {
    const fn = modules.__get__('getMIME')

    const result = fn(`foo/bar/file.md`)
    const expect = `md`

    assert.deepStrictEqual(result, expect)
  })
})
