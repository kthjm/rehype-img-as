# rehype-img-as

[![npm](https://img.shields.io/npm/v/rehype-img-as.svg?style=flat-square)](https://www.npmjs.com/package/rehype-img-as)
[![npm](https://img.shields.io/npm/dm/rehype-img-as.svg?style=flat-square)](https://www.npmjs.com/package/rehype-img-as)
[![Build Status](https://img.shields.io/travis/kthjm/rehype-img-as.svg?style=flat-square)](https://travis-ci.org/kthjm/rehype-img-as)
[![Coverage Status](https://img.shields.io/codecov/c/github/kthjm/rehype-img-as.svg?style=flat-square)](https://codecov.io/github/kthjm/rehype-img-as)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

use `alt` attribute as alternative store.

## Installation
```shell
yarn add rehype-img-as
```

## Usage

suppose to use with [`remark-rehype`](https://github.com/wooorm/remark-rehype) in Browser.

<!-- https://www.w3schools.com/html/html_entities.asp
http://www.howtocreate.co.uk/sidehtmlentity.html -->

```md
### image to bloburl
![as?fetch=bloburl&id=the_png&className=photo&style=width:100px;object-fit:contain](assets/foo.png)
![as?fetch=bloburl&id=the_jpg&className=photo&style=width:100px;object-fit:contain](assets/foo.jpg)
![as?fetch=bloburl&id=the_svg&className=photo&style=width:100px;object-fit:contain](assets/foo.svg)

### html/svg to hast
![as?fetch=hast](assets/foo.html)
![as?fetch=hast&viewBox=0 0 600 600](assets/foo.svg)
```
```html
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
```

<!--
```js
import unified from "unified";
import parse from "remark-parse";
import mdast2hast from "remark-rehype";
import imgas from "rehype-img-as";
import stringify from "rehype-stringify";

const dirPath = "./assets";
const processor = unified()
                    .use(parse)
                    .use(mdast2hast)
                    .use(imgas,{relative: dirPath})
                    .use(stringify);

fetch(`${dirPath}/hoge.md`)
.then((res)=>(res.text()))
.then((md)=>(processor.process(md)))
.then(({contents})=>(console.log(contents)))
.catch((err)=>(console.error(err)))
```
`assets/hoge.md`:
```md
# sample

![as?style=width:100px;object-fit:contain](./hoge.jpg)
![as?fetch=bloburl&style=width:100px;object-fit:contain](./hoge.png)
![as?fetch=bloburl&style=width:100px;object-fit:contain](./hoge.svg)
![as?fetch=hast&class=hoge&style=height:100%](./hoge.html)
![as?fetch=hast&class=hoge&style=height:100%](./hoge.svg)
```
Yields:
```html
<h1>sample</h1>
<p>
  <img style="width:100px;object-fit:contain" src="assets/hoge.jpg" />
  <img style="width:100px;object-fit:contain" src="bloburl" />
  <img style="width:100px;object-fit:contain" src="bloburl" />
  <div class="hoge" style="height:100%"><span></span></div>
  <svg class="hoge" style="height:100%"><g><path d="" /></g></svg>
</p>
```
-->

## API
### `![alt](src)`
`attributes` and special key **`fetch`** can be used in `alt` with prefix `as?`.

example: `![as?fetch=hast&className=foo,bar&style=position:relative;display:inline-block](src)`

use `className`, instead of `class`.

special key **`fetch`** can be set two value.

- `bloburl`
- `hast`


### `rehype().use(imgas[, options])`

###### `options.relative`
e.g. `assets/foo`
###### `options.reference`
e.g. `assets/foo/bar.md`

They are useful to resolve `src` with the markdown file's path.
