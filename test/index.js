import assert from 'assert'
import rewire from 'rewire'

describe(`index.js`, () => {
   const modules = rewire(`../src`)

   describe(`default`, () => {
      it(`throw`, async () => {
         let _re2 = modules.__get__(`_re2`)
         const expect = 'success'
         modules.__set__({
            _re2: {
               default: async (node, dirpath) => {
                  throw new Error(expect)
               }
            }
         })

         const plugin = modules.default()
         try {
            await plugin()
         } catch (err) {
            assert.deepStrictEqual(err.message, expect)
         }
         modules.__set__({ _re2 })
      })

      it(`success`, () => {
         let _re2 = modules.__get__(`_re2`)
         modules.__set__({
            _re2: {
               default: async (node, dirpath) => ({ properties: {} })
            }
         })

         const plugin = modules.default()
         assert.deepEqual(plugin().constructor, Promise.resolve().constructor)
         modules.__set__({ _re2 })
      })

      let afterSet
      before(() => {
         afterSet = {
            _hastUtilSelect: modules.__get__('_hastUtilSelect'),
            _re2: modules.__get__('_re2')
         }
         modules.__set__({
            _hastUtilSelect: {
               selectAll: (query, ast) => {
                  return ['node']
               }
            }
         })
      })
      after(() => modules.__set__(afterSet))
   })

   describe(`getDirPath`, () => {
      const fn = modules.__get__(`getDirPath`)

      it(`void because typeof(options) !== "object"`, () => {
         const result = fn()
         assert.deepStrictEqual(result, undefined)
      })

      it(`void because reference | relative === undefined`, () => {
         const result = fn({})
         assert.deepStrictEqual(result, undefined)
      })

      it(`options.reference`, () => {
         const reference = '/foo/bar.md'
         const result = fn({ reference })
         assert.deepStrictEqual(result, '/foo/')
      })

      it(`options.relative`, () => {
         const relative = '/foo'
         const result = fn({ relative })
         assert.deepStrictEqual(result, '/foo/')
      })

      it(`options.relative but throw because with filename`, () => {
         const relative = '/foo/bar.md'
         assert.throws(
            () => fn({ relative }),
            /rehype-img-as option "relative" must be "dirpath"/
         )
      })
   })
})
