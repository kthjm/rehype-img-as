import assert from 'assert'
import { htmlToHast, htmlToHastImgAs, mdToHastImgAs } from './utils.js'

const replaceHtmlTemplate = attributes => {
  const rootAttr =
    typeof attributes === 'object' &&
    ` ${Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')} `

  return `
<span${rootAttr || ``}>
    <strong>summary</strong>
</span>
    `
}

const replaceSvgTemplate = attributes => {
  const rootAttr =
    typeof attributes === 'object' &&
    ` ${Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')} `

  return `
<svg${rootAttr || ``}>
     <g>
         <path d="" />
     </g>
 </svg>
     `
}

const replaceHastMap = {
  'assets/foo/bar.html': replaceHtmlTemplate,
  'assets/foo/baa.svg': replaceSvgTemplate
}
const customResText = file => () => replaceHastMap[file](false)

const parseHTMLActual = `
<div>
    <img src="./bar.html" alt="as?fetch=hast&id=div_replaced&style=width:100px;height:200px" />
    <p>
        <img src="./baa.svg" alt="as?fetch=hast&viewBox=0 0 600 600" />
    </p>
</div>
`
const parseHTMLExpect = `
<div>
    ${replaceHastMap['assets/foo/bar.html']({
      id: 'div_replaced',
      style: 'width:100px;height:200px',
      alt: ``
    })}
    <p>
        ${replaceHastMap['assets/foo/baa.svg']({
          viewBox: '0 0 600 600',
          alt: ``
        })}
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

![as?fetch=hast&id=div_replaced&style=width:100px;height:200px](./bar.html)
![as?fetch=hast&viewBox=0 0 600 600](./baa.svg)
`
const parseMarkdownExpect = `
<h1>test</h1>
<p>
    ${replaceHastMap['assets/foo/bar.html']({
      id: 'div_replaced',
      style: 'width:100px;height:200px',
      alt: ``
    })}
    ${replaceHastMap['assets/foo/baa.svg']({
      viewBox: '0 0 600 600',
      alt: ``
    })}
</p>
`
const parseMarkdown = async () => {
  const relative = `./assets/foo/`
  const result = await mdToHastImgAs(parseMarkdownActual, { relative })
  const expect = await htmlToHast(parseMarkdownExpect)
  result.data = { quirksMode: false } // this need for equal
  assert.deepStrictEqual(result, expect)
}

describe(`e2e fetch=hast`, () => {
  let currentFetch
  before(() => {
    currentFetch = global.fetch
    global.fetch = async file => ({ ok: true, text: customResText(file) })
  })
  after(() => {
    global.fetch = currentFetch
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
