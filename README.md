# bbcode-html
bbcode-html
# NPM 下载包
npm i bbcode-html --save-dev
# bbcode使用
```javascript
import BBCODE from 'bbcode-html'
BBCODE.render("[url=\"http://www.baidu.com\"]百度[/url]")
// <a href="www.baidu.com" class="ask_link" target="_blank">百度</a>

var converter = new BBCODE.HTML2BBCode(Options);
var bbcode = converter.feed(data);
console.log(bbcode.toString());
```
# Options配置
```javascript
new BBCODE.HTML2BBCode({
  // enable image scale, default: false
  imagescale: true,
  // enable transform pixel size to size 1-7, default: false
  transsize: true,
  // disable list <ul> <ol> <li> support, default: false
  nolist: true,
  // disable text-align center support, default: false
  noalign: true,
  // disable HTML headings support, transform to size, default: false
  noheadings: true
});
```
For detailed explanation on how things work, checkout the [docs for rsa-javascript](https://github.com/xiaolieask/bbcode-html).