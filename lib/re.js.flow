// @flow
import regeneratorRuntime from 'regenerator-runtime'
import { resolve } from 'url'
import { fetchToHast, fetchToBlobUrl } from './fetch.js'
import type { Rehype$Root } from './types.js'
import type { Rehype$Node } from './types.js'

export default async (
   node: Rehype$Node,
   dirpath: string | void
): Promise<Rehype$Node> => {
   const { fetchWay, attributes } = separateAltQuery(node.properties.alt)

   let cloneNode = await nodeAfterFetch(node, fetchWay, dirpath)
   node = Object.assign(node, cloneNode)

   let cloneProperties = attrToProperties(node.properties.style, attributes)
   node.properties = Object.assign(node.properties, cloneProperties)

   return node
}

type Attributes = {
   className?: string | Array<string>,
   [key: string]: string
}
const separateAltQuery = alt => {
   let fetchWay: string | void,
      attributes: Attributes = {}
   const querystring = alt && alt.split(`?`)[1]
   if (querystring) {
      querystring.split(`&`).forEach(key_value => {
         const [key, value] = key_value.split(`=`)
         if (key === 'fetch') {
            fetchWay = value
         } else {
            attributes[key] = value
         }
      })
   }
   return { fetchWay, attributes }
}

type NodeAfterFetch = (
   node: Rehype$Node,
   fetchWay: string | void,
   dirpath: string | void
) => Promise<Rehype$Node>
const nodeAfterFetch: NodeAfterFetch = async (node, fetchWay, dirpath) => {
   const { src } = node.properties
   if (src && fetchWay && typeof fetch === 'function') {
      const mime = getMIME(src),
         fetchPath = resolveFetchPath(src, dirpath)

      if (fetchWay === 'hast') {
         if (!mime.includes('svg') && !mime.includes('html')) {
            throw new Error(`${src} can't choise way "hast"`)
         }

         const hast: Rehype$Root | void = await fetchToHast(fetchPath)
         if (typeof hast === 'object') {
            const reNode: Rehype$Node | void = hast.children.find(
               ({ type }) => type === 'element'
            )
            if (reNode) {
               node = reNode
            }
         }
      } else if (fetchWay === 'bloburl') {
         if (mime.includes('html')) {
            throw new Error(`${src} can't choise way "bloburl"`)
         }

         if (typeof URL === 'function') {
            node.properties.src = await fetchToBlobUrl(fetchPath)
         }
      } else {
         throw new Error(`${fetchWay} is incorrect as query`)
      }
   }
   return node
}

const resolveFetchPath = (src, dirpath) =>
   !dirpath ? src : resolve(dirpath, src)

const attrToProperties = (style, attributes) => {
   if (style && attributes.style) {
      const joined = `${style};${attributes.style}`,
         iterable = joined.split(`;`).map(keyval => {
            const key_val = keyval.split(`:`)
            return [key_val[0], key_val[1]]
         }),
         uniques = new Map(iterable)

      attributes.style = [...uniques.entries()]
         .map(tuples => tuples.join(`:`))
         .join(`;`)
   }

   if (attributes.className && typeof attributes.className === 'string') {
      attributes.className = attributes.className.split(',')
   }

   return attributes
}

const getMIME = file => {
   const fragments = file.split('.')
   return fragments[fragments.length - 1]
}
