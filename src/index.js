// @flow
import regeneratorRuntime from 'regenerator-runtime'
import { selectAll } from 'hast-util-select'
import path from 'path'
import re from './re.js'
import type { Rehype$Node } from './types.js'

const q = `img[alt^="as"]`

type Options = {
   relative?: string,
   reference?: string
}

export default (options: Options) => {
   const dirpath = getDirPath(options)

   return (ast: any): Promise<*> => {
      const imgs: Array<Rehype$Node> = selectAll(q, ast)
      return new Promise((resolve, reject) =>
         Promise.all(
            imgs.map(node =>
               re(node, dirpath).then(reNode => {
                  node = Object.assign(node, reNode)
                  node.properties.alt = ``
                  return
               })
            )
         )
            .then(() => resolve())
            .catch(err => reject(err))
      )
   }
}

const getDirPath = (options): string | void => {
   if (typeof options !== 'object') return

   let dirpath: string
   const { reference, relative } = options
   if (reference) {
      dirpath = path.dirname(reference)
   } else if (relative) {
      if (path.extname(relative)) {
         throw new Error(`rehype-img-as option "relative" must be "dirpath"`)
      }
      dirpath = relative
   }

   if (dirpath && dirpath[dirpath.length - 1] !== '/') {
      dirpath = `${dirpath}/`
   }
   return dirpath
}
