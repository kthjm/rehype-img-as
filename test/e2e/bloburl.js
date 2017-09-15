import assert from 'assert'
import { htmlToHast, htmlToHastImgAs, mdToHastImgAs } from './utils.js'

const expectAsBlobURL = `blob:http://expect.com/random`

const parseHTMLActual = `
<div>
    <img src="./bar.jpg" alt="as?fetch=bloburl&id=div_replaced&style=width:100px;height:200px" />
    <p>
        <img src="./baa.svg" alt="as?fetch=bloburl&className=img_svg,a_svg" />
    </p>
</div>
`
const parseHTMLExpect = `
<div>
    <img src="${expectAsBlobURL}" alt="" id="div_replaced" style="width:100px;height:200px" />
    <p>
        <img src="${expectAsBlobURL}" alt="" class="img_svg a_svg" />
    </p>
</div>
`
const parseHTML = async () => {
   const reference = `./assets/foo/test.html`
   const result = await htmlToHastImgAs(parseHTMLActual, { reference })
   const expect = await htmlToHast(parseHTMLExpect)
   assert.deepStrictEqual(result, expect)
}

const parseMarkdownActual = `
# test

![as?fetch=bloburl&id=div_replaced&style=width:100px;height:200px](./bar.png)
![as?fetch=bloburl&className=img_svg,a_svg](./baa.svg)
`
const parseMarkdownExpect = `
<h1>test</h1>
<p>
    <img src="${expectAsBlobURL}" alt="" id="div_replaced" style="width:100px;height:200px" />
    <img src="${expectAsBlobURL}" alt="" class="img_svg a_svg" />
</p>
`
const parseMarkdown = async () => {
   const relative = `./assets/foo/`
   const result = await mdToHastImgAs(parseMarkdownActual, { relative })
   const expect = await htmlToHast(parseMarkdownExpect)
   result.data = { quirksMode: false } // this need for equal
   assert.deepStrictEqual(result, expect)
}

describe(`e2e fetch=bloburl`, () => {
   let currentFetch, currentURL
   before(() => {
      currentFetch = global.fetch
      currentURL = global.URL

      global.fetch = async file => ({
         ok: true,
         blob: () => {}
      })
      global.URL = () => {}
      global.URL.createObjectURL = blob => expectAsBlobURL
   })
   after(() => {
      global.fetch = currentFetch
      global.URL = currentURL
   })

   it(`parse html`, async () => {
      await parseHTML()
      return
   })
   it(`parse markdown`, async () => {
      await parseMarkdown()
      return
   })
})
