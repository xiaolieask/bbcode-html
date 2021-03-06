var defaults = {
  showQuotePrefix: true,
  classPrefix: 'ask_',
  mentionPrefix: '@'
};

var version = '1.0.0'
var URL_PATTERN = new RegExp("("
+ "("
+ "([A-Za-z]{3,9}:(?:\\/\\/)?)"
+ "(?:[\\-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9\\.\\-]+[A-Za-z0-9\\-]"
+ "|"
+ "(?:www\\.|[\\-;:&=\\+\\$,\\w]+@)"
+ "[A-Za-z0-9\\.\\-]+[A-Za-z0-9\\-]"
+ ")"
+ "("
+ "(?:\\/[\\+~%\\/\\.\\w\\-_]*)?"
+ "\\??(?:[\\-\\+=&;%@\\.\\w_\\/:]*)"
+ "#?(?:[\\.\\!\\/\\\\\\w]*)"
+ ")?"
+ ")");

function doReplace(content, matches, options) {
var i, obj, regex, hasMatch, tmp;
do {
  hasMatch = false;
  for (i = 0; i < matches.length; ++i) {
      obj = matches[i];
      regex = new RegExp(obj.e, 'gi');
      tmp = content.replace(regex, obj.func.bind(undefined, options));
      if (tmp !== content) {
          content = tmp;
          hasMatch = true;
      }
  }
} while (hasMatch);
return content;
}

function listItemReplace(options, fullMatch, tag, value) {
return '<li>' + value.trim() + '</li>';
}

export var extractQuotedText = function (value, parts) {
var quotes = ["\"", "'"], i, quote, nextPart;

for (i = 0; i < quotes.length; ++i) {
  quote = quotes[i];
  if (value && value[0] === quote) {
      value = value.slice(1);
      if (value[value.length - 1] !== quote) {
          while (parts && parts.length) {
              nextPart = parts.shift();
              value += " " + nextPart;
              if (nextPart[nextPart.length - 1] === quote) {
                  break;
              }
          }
      }
      value = value.replace(new RegExp("[" + quote + "]+$"), '');
      break;
  }
}
return [value, parts];
};

export var parseParams = function (tagName, params) {

var parts, rv, part, index, paramMap = {};

if (!params) {
  return paramMap;
}

params = params.replace(/\s*[=]\s*/g, "=");
parts = params.split(/\s+/);

while (parts.length) {
  part = parts.shift();
  if (!URL_PATTERN.exec(part)) {
      index = part.indexOf('=');
      if (index > 0) {
          rv = extractQuotedText(part.slice(index + 1), parts);
          paramMap[part.slice(0, index).toLowerCase()] = rv[0];
          parts = rv[1];
      }
      else {
          rv = extractQuotedText(part, parts);
          paramMap[tagName] = rv[0];
          parts = rv[1];
      }
  } else {
      rv = extractQuotedText(part, parts);
      paramMap[tagName] = rv[0];
      parts = rv[1];
  }
}
return paramMap;
};


function tagReplace(options, fullMatch, tag, params, value) {
var tmp, className, inlineValue, i, val;

tag = tag.toLowerCase();
params = parseParams(tag, params || undefined);
inlineValue = params[tag];
switch (tag) {
  case 'quote':
      val = '<div class="' + options.classPrefix + 'quote"';
      for (i in params) {
          tmp = params[i];
          if (!inlineValue && (i === 'author' || i === 'name')) {
              inlineValue = tmp;
          } else if (i !== tag) {
              val += ' data-' + i + '="' + tmp + '"';
          }
      }
      return val + '>' + (inlineValue ? inlineValue + ' wrote:' : (options.showQuotePrefix ? 'Quote:' : '')) + '<blockquote>' + value + '</blockquote></div>';
  case 'url':
      return '<a class="' + options.classPrefix + 'link" target="_blank" href="' + (inlineValue || value) + '">' + value + '</a>';
  case 'email':
      return '<a class="' + options.classPrefix + 'link" target="_blank" href="mailto:' + (inlineValue || value) + '">' + value + '</a>';
  case 'anchor':
      return '<a name="' + (inlineValue || params.a || value) + '">' + value + '</a>';
  case 'b':
      return '<strong>' + value + '</strong>';
  case 'i':
      return '<em>' + value + '</em>';
  case 'size':
      return '<span style="font-size:'+ inlineValue +'">' + value + '</span>';
  case 'color':
      return '<span style="color:'+ inlineValue +'">' + value + '</span>';
  case 'fly':
      return '<marquee behavior="alternate">' + value + '</marquee>';
  case 'move':
      return '<marquee>' + value + '</marquee>';
  case 'indent':
      return '<blockquote>' + value + '</blockquote>';
  case 'font':
    return '<span style="font-family:'+ inlineValue +'">' + value + '</span>';
  case 'list':
      tag = 'ul';
      className = options.classPrefix + 'list';
      if (inlineValue && /[1Aa]/.test(inlineValue)) {
          tag = 'ol';
          if (/1/.test(inlineValue)) {
              className += '_numeric';
          }
          else if (/A/.test(inlineValue)) {
              className += '_alpha';
          }
          else if (/a/.test(inlineValue)) {
              className += '_alpha_lower';
          }
      }
      val = '<' + tag + ' class="' + className + '">';
      
      val += doReplace(value, [{e: '\\[([*])\\]([^\r\n\\[\\<]+)', func: listItemReplace}], options);
      return val + '</' + tag + '>';
    case 'olist':
      tag = 'ol';
      className = options.classPrefix + 'list';
      val = '<' + tag + ' class="' + className + '">';
      
      val += doReplace(value, [{e: '\\[([*])\\]([^\r\n\\[\\<]+)', func: listItemReplace}], options);
      return val + '</' + tag + '>';
  case 'code':
  case 'php':
  case 'java':
  case 'javascript':
  case 'cpp':
  case 'ruby':
  case 'python':
      return '<pre class="' + options.classPrefix + (tag === 'code' ? '' : 'code_') + tag + '">' + value + '</pre>';
  case 'highlight':
      return '<span class="' + options.classPrefix + tag + '">' + value + '</span>';
  case 'html':
      return value;
  case 'mention':
      val = '<span class="' + options.classPrefix + 'mention"';
      if (inlineValue) {
          val += ' data-mention-id="' + inlineValue + '"';
      }
      return val + '>' + (options.mentionPrefix || '') + value + '</span>';
  case 'span':
  case 'h1':
  case 'h2':
  case 'h3':
  case 'h4':
  case 'h5':
  case 'h6':
  case 'table':
  case 'tr':
  case 'td':
  case 's':
  case 'u':
  case 'SUP':
  case 'sup':
  case 'sub':
  case 'SUB':
      return '<' + tag + '>' + value + '</' + tag + '>';
  case 'youtube':
      return '<object class="' + options.classPrefix + 'video" width="425" height="350"><param name="movie" value="http://www.youtube.com/v/' + value + '"></param><embed src="http://www.youtube.com/v/' + value + '" type="application/x-shockwave-flash" width="425" height="350"></embed></object>';
  case 'gvideo':
      return '<embed class="' + options.classPrefix + 'video" style="width:400px; height:325px;" id="VideoPlayback" type="application/x-shockwave-flash" src="http://video.google.com/googleplayer.swf?docId=' + value + '&amp;hl=en">';
  case 'google':
      return '<a class="' + options.classPrefix + 'link" target="_blank" href="http://www.google.com/search?q=' + (inlineValue || value) + '">' + value + '</a>';
  case 'baidu':
      return '<a class="' + options.classPrefix + 'link" target="_blank" href="http://www.baidu.com/s?wd=' + (inlineValue || value) + '">' + value + '</a>';
  case 'wikipedia':
      return '<a class="' + options.classPrefix + 'link" target="_blank" href="http://www.wikipedia.org/wiki/' + (inlineValue || value) + '">' + value + '</a>';
  case 'img':
      var dims = new RegExp('^(\\d+)x(\\d+)$').exec(inlineValue || '');
      if (!dims || (dims.length !== 3)) {
          dims = new RegExp('^width=(\\d+)\\s+height=(\\d+)$').exec(inlineValue || '');
      }
      if (dims && dims.length === 3) {
          params = undefined;
      }
      val = '<img class="' + options.classPrefix + 'image" src="' + value + '"';
      if (dims && dims.length === 3) {
          val += ' width="' + dims[1] + '" height="' + dims[2] + '"';
      } else {
          for (i in params) {
              tmp = params[i];
              if (i === 'img') {
                  i = 'alt';
              }
              val += ' ' + i + '="' + tmp + '"';
          }
      }
      return val + '/>';
    default:
      return '<' + tag + '>' + value + '</' + tag + '>';
}

return fullMatch;
}

/**
* 输出html内容
* @param content   你输入的内容
* @param options   配置项
* @returns 展示的html
*/
export var render = function (content, options) {
var matches = [], tmp;

options = options || {};
for (tmp in defaults) {
  if (!Object.prototype.hasOwnProperty.call(options, tmp)) {
      options[tmp] = defaults[tmp];
  }
}
// 暂时只有这个规则
matches.push({e: '\\[(\\w+)(?:[= ]([^\\]]+))?]((?:.|[\r\n])*?)\\[/\\1]', func: tagReplace});
return doReplace(content, matches, options);
};

