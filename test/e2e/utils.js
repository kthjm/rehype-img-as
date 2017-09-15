import rehype from 'rehype'
import unified from 'unified'
import mdParse from 'remark-parse'
import mdast2hast from 'remark-rehype'
import imgas from '../../src/index'
import minify from 'rehype-minify-whitespace'
import rehypeStringify from 'rehype-stringify'

export const htmlToHastImgAs = async (html, options) => {
   const processor = rehype()
      .data(`settings`, {
         fragment: true,
         position: false
      })
      .use(imgas, options)
      .use(minify)

   const hast = processor.parse(html)
   const hastImgAs = await processor.run(hast)
   return hastImgAs
}

export const mdToHastImgAs = async (md, options) => {
   const processor = unified()
      .use(mdParse, {
         fragment: true,
         position: false
      })
      .use(mdast2hast)
      .use(imgas, options)
      .use(minify)
   //   .use(rehypeStringify)

   const mdast = processor.parse(md)
   // console.log(mdast);
   const hastImgAs = await processor.run(mdast)
   // console.log(hastImgAs);
   // console.log('md')
   // console.log(processor.stringify(hastImgAs))
   return hastImgAs
}

export const htmlToHast = (() => {
   const processor = rehype()
      .data(`settings`, {
         fragment: true,
         position: false
      })
      .use(minify)
      .use(rehypeStringify)

   return async html => {
      const hast = processor.parse(html)
      const hastMinify = await processor.run(hast)
      //   console.log('expect')
      //   console.log(processor.stringify(hastMinify))
      // console.log(JSON.stringify(hastMinify,null,"\t"));
      return hast
   }
})()
