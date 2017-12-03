import assert from 'assert'
import { htmlToHast, mdToHastImgAs } from './utils.js'

const markdown = `
### image to bloburl
![as?fetch=bloburl&id=the_png&className=photo&style=width:100px;object-fit:contain](assets/foo.png)
![as?fetch=bloburl&id=the_jpg&className=photo&style=width:100px;object-fit:contain](assets/foo.jpg)
![as?fetch=bloburl&id=the_svg&className=photo&style=width:100px;object-fit:contain](assets/foo.svg)

### html/svg to hast
![as?fetch=hast](assets/foo.html)
![as?fetch=hast&viewBox=0 0 600 600](assets/foo.svg)
`

const html = `
<h3>image to bloburl</h3>
<p>
  <img src="blob:~" alt="" id="the_png" class="photo" style="width:100px;object-fit:contain" />
  <img src="blob:~" alt="" id="the_jpg" class="photo" style="width:100px;object-fit:contain" />
  <img src="blob:~" alt="" id="the_svg" class="photo" style="width:100px;object-fit:contain" />
</p>
<h3>html/svg to hast</h3>
<p>
  <span alt="">foo</span>
  <svg alt="" viewBox="0 0 600 600"><path /></svg>
</p>
`

const expectAsBlobURL = `blob:~`
const replaceHastMap = {
  'assets/foo.html': `<span>foo</span>`,
  'assets/foo.svg': `<svg><path /></svg>`
}

describe(`sample in README.md`, () => {
  it(`testing`, async () => {
    const result = await mdToHastImgAs(markdown)
    const expect = await htmlToHast(html)
    result.data = { quirksMode: false }
    assert.deepStrictEqual(result, expect)
  })

  let currentFetch, currentURL
  before(() => {
    currentFetch = global.fetch
    currentURL = global.URL

    global.fetch = async file => ({
      ok: true,
      blob: () => {},
      text: () => replaceHastMap[file]
    })
    global.URL = () => {}
    global.URL.createObjectURL = blob => expectAsBlobURL
  })
  after(() => {
    global.fetch = currentFetch
    global.URL = currentURL
  })
})
