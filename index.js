import bbcode from './src/bbcode'
import html from './src/html2bbcode'
module.exports = {
  render: bbcode.render,
  extractQuotedText: bbcode.extractQuotedText,
  parseParams: bbcode.parseParams,
  HTML2BBCode: html.HTML2BBCode,
  HTMLTag: html.HTMLTag,
  HTMLStack: html.HTMLStack,
  BBCode: html.BBCode
}