// markdown.js
!function(a){function b(){return"Markdown.mk_block( "+uneval(this.toString())+", "+uneval(this.trailing)+", "+uneval(this.lineNumber)+" )"}function c(){var a=require("util");return"Markdown.mk_block( "+a.inspect(this.toString())+", "+a.inspect(this.trailing)+", "+a.inspect(this.lineNumber)+" )"}function d(a){for(var b=0,c=-1;-1!==(c=a.indexOf("\n",c+1));)b++;return b}function e(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function f(a){if("string"==typeof a)return e(a);var b=a.shift(),c={},d=[];for(!a.length||"object"!=typeof a[0]||a[0]instanceof Array||(c=a.shift());a.length;)d.push(f(a.shift()));var g="";for(var h in c)g+=" "+h+'="'+e(c[h])+'"';return"img"===b||"br"===b||"hr"===b?"<"+b+g+"/>":"<"+b+g+">"+d.join("")+"</"+b+">"}function g(a,b,c){var d;c=c||{};var e=a.slice(0);"function"==typeof c.preprocessTreeNode&&(e=c.preprocessTreeNode(e,b));var f=o(e);if(f){e[1]={};for(d in f)e[1][d]=f[d];f=e[1]}if("string"==typeof e)return e;switch(e[0]){case"header":e[0]="h"+e[1].level,delete e[1].level;break;case"bulletlist":e[0]="ul";break;case"numberlist":e[0]="ol";break;case"listitem":e[0]="li";break;case"para":e[0]="p";break;case"markdown":e[0]="html",f&&delete f.references;break;case"code_block":e[0]="pre",d=f?2:1;var h=["code"];h.push.apply(h,e.splice(d,e.length-d)),e[d]=h;break;case"inlinecode":e[0]="code";break;case"img":e[1].src=e[1].href,delete e[1].href;break;case"linebreak":e[0]="br";break;case"link":e[0]="a";break;case"link_ref":e[0]="a";var i=b[f.ref];if(!i)return f.original;delete f.ref,f.href=i.href,i.title&&(f.title=i.title),delete f.original;break;case"img_ref":e[0]="img";var i=b[f.ref];if(!i)return f.original;delete f.ref,f.src=i.href,i.title&&(f.title=i.title),delete f.original}if(d=1,f){for(var j in e[1]){d=2;break}1===d&&e.splice(d,1)}for(;d<e.length;++d)e[d]=g(e[d],b,c);return e}function h(a){for(var b=o(a)?2:1;b<a.length;)"string"==typeof a[b]?b+1<a.length&&"string"==typeof a[b+1]?a[b]+=a.splice(b+1,1)[0]:++b:(h(a[b]),++b)}function i(a,b){function c(a){this.len_after=a,this.name="close_"+b}var d=a+"_state",e="strong"===a?"em_state":"strong_state";return function(f){if(this[d][0]===b)return this[d].shift(),[f.length,new c(f.length-b.length)];var g=this[e].slice(),h=this[d].slice();this[d].unshift(b);var i=this.processInline(f.substr(b.length)),j=i[i.length-1];if(this[d].shift(),j instanceof c){i.pop();var k=f.length-j.len_after;return[k,[a].concat(i)]}return this[e]=g,this[d]=h,[b.length,b]}}function j(a){for(var b=a.split(""),c=[""],d=!1;b.length;){var e=b.shift();switch(e){case" ":d?c[c.length-1]+=e:c.push("");break;case"'":case'"':d=!d;break;case"\\":e=b.shift();default:c[c.length-1]+=e}}return c}var k={};k.mk_block=function(a,d,e){1===arguments.length&&(d="\n\n");var f=new String(a);return f.trailing=d,f.inspect=c,f.toSource=b,void 0!==e&&(f.lineNumber=e),f};var l=k.isArray=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)};k.forEach=Array.prototype.forEach?function(a,b,c){return a.forEach(b,c)}:function(a,b,c){for(var d=0;d<a.length;d++)b.call(c||a,a[d],d,a)},k.isEmpty=function(a){for(var b in a)if(hasOwnProperty.call(a,b))return!1;return!0},k.extract_attr=function(a){return l(a)&&a.length>1&&"object"==typeof a[1]&&!l(a[1])?a[1]:void 0};var m=function(a){switch(typeof a){case"undefined":this.dialect=m.dialects.Gruber;break;case"object":this.dialect=a;break;default:if(!(a in m.dialects))throw new Error("Unknown Markdown dialect '"+String(a)+"'");this.dialect=m.dialects[a]}this.em_state=[],this.strong_state=[],this.debug_indent=""};m.dialects={};var n=m.mk_block=k.mk_block,l=k.isArray;m.parse=function(a,b){var c=new m(b);return c.toTree(a)},m.prototype.split_blocks=function(a){a=a.replace(/(\r\n|\n|\r)/g,"\n");var b,c=/([\s\S]+?)($|\n#|\n(?:\s*\n|$)+)/g,e=[],f=1;for(null!==(b=/^(\s*\n)/.exec(a))&&(f+=d(b[0]),c.lastIndex=b[0].length);null!==(b=c.exec(a));)"\n#"===b[2]&&(b[2]="\n",c.lastIndex--),e.push(n(b[1],b[2],f)),f+=d(b[0]);return e},m.prototype.processBlock=function(a,b){var c=this.dialect.block,d=c.__order__;if("__call__"in c)return c.__call__.call(this,a,b);for(var e=0;e<d.length;e++){var f=c[d[e]].call(this,a,b);if(f)return(!l(f)||f.length>0&&!l(f[0]))&&this.debug(d[e],"didn't return a proper array"),f}return[]},m.prototype.processInline=function(a){return this.dialect.inline.__call__.call(this,String(a))},m.prototype.toTree=function(a,b){var c=a instanceof Array?a:this.split_blocks(a),d=this.tree;try{for(this.tree=b||this.tree||["markdown"];c.length;){var e=this.processBlock(c.shift(),c);e.length&&this.tree.push.apply(this.tree,e)}return this.tree}finally{b&&(this.tree=d)}},m.prototype.debug=function(){var a=Array.prototype.slice.call(arguments);a.unshift(this.debug_indent),"undefined"!=typeof print&&print.apply(print,a),"undefined"!=typeof console&&"undefined"!=typeof console.log&&console.log.apply(null,a)},m.prototype.loop_re_over_block=function(a,b,c){for(var d,e=b.valueOf();e.length&&null!==(d=a.exec(e));)e=e.substr(d[0].length),c.call(this,d);return e},m.buildBlockOrder=function(a){var b=[];for(var c in a)"__order__"!==c&&"__call__"!==c&&b.push(c);a.__order__=b},m.buildInlinePatterns=function(a){var b=[];for(var c in a)if(!c.match(/^__.*__$/)){var d=c.replace(/([\\.*+?|()\[\]{}])/g,"\\$1").replace(/\n/,"\\n");b.push(1===c.length?d:"(?:"+d+")")}b=b.join("|"),a.__patterns__=b;var e=a.__call__;a.__call__=function(a,c){return void 0!==c?e.call(this,a,c):e.call(this,a,b)}};var o=k.extract_attr;m.renderJsonML=function(a,b){b=b||{},b.root=b.root||!1;var c=[];if(b.root)c.push(f(a));else for(a.shift(),!a.length||"object"!=typeof a[0]||a[0]instanceof Array||a.shift();a.length;)c.push(f(a.shift()));return c.join("\n\n")},m.toHTMLTree=function(a,b,c){"string"==typeof a&&(a=this.parse(a,b));var d=o(a),e={};d&&d.references&&(e=d.references);var f=g(a,e,c);return h(f),f},m.toHTML=function(a,b,c){var d=this.toHTMLTree(a,b,c);return this.renderJsonML(d)};var p={};p.inline_until_char=function(a,b){for(var c=0,d=[];;){if(a.charAt(c)===b)return c++,[c,d];if(c>=a.length)return null;var e=this.dialect.inline.__oneElement__.call(this,a.substr(c));c+=e[0],d.push.apply(d,e.slice(1))}},p.subclassDialect=function(a){function b(){}function c(){}return b.prototype=a.block,c.prototype=a.inline,{block:new b,inline:new c}};var q=k.forEach,o=k.extract_attr,n=k.mk_block,r=k.isEmpty,s=p.inline_until_char,t={block:{atxHeader:function(a,b){var c=a.match(/^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/);if(!c)return void 0;var d=["header",{level:c[1].length}];return Array.prototype.push.apply(d,this.processInline(c[2])),c[0].length<a.length&&b.unshift(n(a.substr(c[0].length),a.trailing,a.lineNumber+2)),[d]},setextHeader:function(a,b){var c=a.match(/^(.*)\n([-=])\2\2+(?:\n|$)/);if(!c)return void 0;var d="="===c[2]?1:2,e=["header",{level:d},c[1]];return c[0].length<a.length&&b.unshift(n(a.substr(c[0].length),a.trailing,a.lineNumber+2)),[e]},code:function(a,b){var c=[],d=/^(?: {0,3}\t| {4})(.*)\n?/;if(!a.match(d))return void 0;a:for(;;){var e=this.loop_re_over_block(d,a.valueOf(),function(a){c.push(a[1])});if(e.length){b.unshift(n(e,a.trailing));break a}if(!b.length)break a;if(!b[0].match(d))break a;c.push(a.trailing.replace(/[^\n]/g,"").substring(2)),a=b.shift()}return[["code_block",c.join("\n")]]},horizRule:function(a,b){var c=a.match(/^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/);if(!c)return void 0;var d=[["hr"]];if(c[1]){var e=n(c[1],"",a.lineNumber);d.unshift.apply(d,this.toTree(e,[]))}return c[3]&&b.unshift(n(c[3],a.trailing,a.lineNumber+1)),d},lists:function(){function a(a){return new RegExp("(?:^("+i+"{0,"+a+"} {0,3})("+f+")\\s+)|"+"(^"+i+"{0,"+(a-1)+"}[ ]{0,4})")}function b(a){return a.replace(/ {0,3}\t/g,"    ")}function c(a,b,c,d){if(b)return a.push(["para"].concat(c)),void 0;var e=a[a.length-1]instanceof Array&&"para"===a[a.length-1][0]?a[a.length-1]:a;d&&a.length>1&&c.unshift(d);for(var f=0;f<c.length;f++){var g=c[f],h="string"==typeof g;h&&e.length>1&&"string"==typeof e[e.length-1]?e[e.length-1]+=g:e.push(g)}}function d(a,b){for(var c=new RegExp("^("+i+"{"+a+"}.*?\\n?)*$"),d=new RegExp("^"+i+"{"+a+"}","gm"),e=[];b.length>0&&c.exec(b[0]);){var f=b.shift(),g=f.replace(d,"");e.push(n(g,f.trailing,f.lineNumber))}return e}function e(a,b,c){var d=a.list,e=d[d.length-1];if(!(e[1]instanceof Array&&"para"===e[1][0]))if(b+1===c.length)e.push(["para"].concat(e.splice(1,e.length-1)));else{var f=e.pop();e.push(["para"].concat(e.splice(1,e.length-1)),f)}}var f="[*+-]|\\d+\\.",g=/[*+-]/,h=new RegExp("^( {0,3})("+f+")[ 	]+"),i="(?: {0,3}\\t| {4})";return function(f,i){function j(a){var b=g.exec(a[2])?["bulletlist"]:["numberlist"];return n.push({list:b,indent:a[1]}),b}var k=f.match(h);if(!k)return void 0;for(var l,m,n=[],o=j(k),p=!1,r=[n[0].list];;){for(var s=f.split(/(?=\n)/),t="",u="",v=0;v<s.length;v++){u="";var w=s[v].replace(/^\n/,function(a){return u=a,""}),x=a(n.length);if(k=w.match(x),void 0!==k[1]){t.length&&(c(l,p,this.processInline(t),u),p=!1,t=""),k[1]=b(k[1]);var y=Math.floor(k[1].length/4)+1;if(y>n.length)o=j(k),l.push(o),l=o[1]=["listitem"];else{var z=!1;for(m=0;m<n.length;m++)if(n[m].indent===k[1]){o=n[m].list,n.splice(m+1,n.length-(m+1)),z=!0;break}z||(y++,y<=n.length?(n.splice(y,n.length-y),o=n[y-1].list):(o=j(k),l.push(o))),l=["listitem"],o.push(l)}u=""}w.length>k[0].length&&(t+=u+w.substr(k[0].length))}t.length&&(c(l,p,this.processInline(t),u),p=!1,t="");var A=d(n.length,i);A.length>0&&(q(n,e,this),l.push.apply(l,this.toTree(A,[])));var B=i[0]&&i[0].valueOf()||"";if(!B.match(h)&&!B.match(/^ /))break;f=i.shift();var C=this.dialect.block.horizRule(f,i);if(C){r.push.apply(r,C);break}q(n,e,this),p=!0}return r}}(),blockquote:function(a,b){if(!a.match(/^>/m))return void 0;var c=[];if(">"!==a[0]){for(var d=a.split(/\n/),e=[],f=a.lineNumber;d.length&&">"!==d[0][0];)e.push(d.shift()),f++;var g=n(e.join("\n"),"\n",a.lineNumber);c.push.apply(c,this.processBlock(g,[])),a=n(d.join("\n"),a.trailing,f)}for(;b.length&&">"===b[0][0];){var h=b.shift();a=n(a+a.trailing+h,h.trailing,a.lineNumber)}var i=a.replace(/^> ?/gm,""),j=(this.tree,this.toTree(i,["blockquote"])),k=o(j);return k&&k.references&&(delete k.references,r(k)&&j.splice(1,1)),c.push(j),c},referenceDefn:function(a,b){var c=/^\s*\[(.*?)\]:\s*(\S+)(?:\s+(?:(['"])(.*?)\3|\((.*?)\)))?\n?/;if(!a.match(c))return void 0;o(this.tree)||this.tree.splice(1,0,{});var d=o(this.tree);void 0===d.references&&(d.references={});var e=this.loop_re_over_block(c,a,function(a){a[2]&&"<"===a[2][0]&&">"===a[2][a[2].length-1]&&(a[2]=a[2].substring(1,a[2].length-1));var b=d.references[a[1].toLowerCase()]={href:a[2]};void 0!==a[4]?b.title=a[4]:void 0!==a[5]&&(b.title=a[5])});return e.length&&b.unshift(n(e,a.trailing)),[]},para:function(a){return[["para"].concat(this.processInline(a))]}},inline:{__oneElement__:function(a,b,c){var d,e;b=b||this.dialect.inline.__patterns__;var f=new RegExp("([\\s\\S]*?)("+(b.source||b)+")");if(d=f.exec(a),!d)return[a.length,a];if(d[1])return[d[1].length,d[1]];var e;return d[2]in this.dialect.inline&&(e=this.dialect.inline[d[2]].call(this,a.substr(d.index),d,c||[])),e=e||[d[2].length,d[2]]},__call__:function(a,b){function c(a){"string"==typeof a&&"string"==typeof e[e.length-1]?e[e.length-1]+=a:e.push(a)}for(var d,e=[];a.length>0;)d=this.dialect.inline.__oneElement__.call(this,a,b,e),a=a.substr(d.shift()),q(d,c);return e},"]":function(){},"}":function(){},__escape__:/^\\[\\`\*_{}\[\]()#\+.!\-]/,"\\":function(a){return this.dialect.inline.__escape__.exec(a)?[2,a.charAt(1)]:[1,"\\"]},"![":function(a){var b=a.match(/^!\[(.*?)\][ \t]*\([ \t]*([^")]*?)(?:[ \t]+(["'])(.*?)\3)?[ \t]*\)/);if(b){b[2]&&"<"===b[2][0]&&">"===b[2][b[2].length-1]&&(b[2]=b[2].substring(1,b[2].length-1)),b[2]=this.dialect.inline.__call__.call(this,b[2],/\\/)[0];var c={alt:b[1],href:b[2]||""};return void 0!==b[4]&&(c.title=b[4]),[b[0].length,["img",c]]}return b=a.match(/^!\[(.*?)\][ \t]*\[(.*?)\]/),b?[b[0].length,["img_ref",{alt:b[1],ref:b[2].toLowerCase(),original:b[0]}]]:[2,"!["]},"[":function v(a){var b=String(a),c=s.call(this,a.substr(1),"]");if(!c)return[1,"["];var v,d,e=1+c[0],f=c[1];a=a.substr(e);var g=a.match(/^\s*\([ \t]*([^"']*)(?:[ \t]+(["'])(.*?)\2)?[ \t]*\)/);if(g){var h=g[1];if(e+=g[0].length,h&&"<"===h[0]&&">"===h[h.length-1]&&(h=h.substring(1,h.length-1)),!g[3])for(var i=1,j=0;j<h.length;j++)switch(h[j]){case"(":i++;break;case")":0===--i&&(e-=h.length-j,h=h.substring(0,j))}return h=this.dialect.inline.__call__.call(this,h,/\\/)[0],d={href:h||""},void 0!==g[3]&&(d.title=g[3]),v=["link",d].concat(f),[e,v]}return g=a.match(/^\s*\[(.*?)\]/),g?(e+=g[0].length,d={ref:(g[1]||String(f)).toLowerCase(),original:b.substr(0,e)},v=["link_ref",d].concat(f),[e,v]):1===f.length&&"string"==typeof f[0]?(d={ref:f[0].toLowerCase(),original:b.substr(0,e)},v=["link_ref",d,f[0]],[e,v]):[1,"["]},"<":function(a){var b;return null!==(b=a.match(/^<(?:((https?|ftp|mailto):[^>]+)|(.*?@.*?\.[a-zA-Z]+))>/))?b[3]?[b[0].length,["link",{href:"mailto:"+b[3]},b[3]]]:"mailto"===b[2]?[b[0].length,["link",{href:b[1]},b[1].substr("mailto:".length)]]:[b[0].length,["link",{href:b[1]},b[1]]]:[1,"<"]},"`":function(a){var b=a.match(/(`+)(([\s\S]*?)\1)/);return b&&b[2]?[b[1].length+b[2].length,["inlinecode",b[3]]]:[1,"`"]},"  \n":function(){return[3,["linebreak"]]}}};t.inline["**"]=i("strong","**"),t.inline.__=i("strong","__"),t.inline["*"]=i("em","*"),t.inline._=i("em","_"),m.dialects.Gruber=t,m.buildBlockOrder(m.dialects.Gruber.block),m.buildInlinePatterns(m.dialects.Gruber.inline);var u=p.subclassDialect(t),o=k.extract_attr,q=k.forEach;u.processMetaHash=function(a){for(var b=j(a),c={},d=0;d<b.length;++d)if(/^#/.test(b[d]))c.id=b[d].substring(1);else if(/^\./.test(b[d]))c["class"]=c["class"]?c["class"]+b[d].replace(/./," "):b[d].substring(1);else if(/\=/.test(b[d])){var e=b[d].split(/\=/);c[e[0]]=e[1]}return c},u.block.document_meta=function(a){if(a.lineNumber>1)return void 0;if(!a.match(/^(?:\w+:.*\n)*\w+:.*$/))return void 0;o(this.tree)||this.tree.splice(1,0,{});var b=a.split(/\n/);for(var c in b){var d=b[c].match(/(\w+):\s*(.*)$/),e=d[1].toLowerCase(),f=d[2];this.tree[1][e]=f}return[]},u.block.block_meta=function(a){var b=a.match(/(^|\n) {0,3}\{:\s*((?:\\\}|[^\}])*)\s*\}$/);if(!b)return void 0;var c,d=this.dialect.processMetaHash(b[2]);if(""===b[1]){var e=this.tree[this.tree.length-1];if(c=o(e),"string"==typeof e)return void 0;c||(c={},e.splice(1,0,c));for(var f in d)c[f]=d[f];return[]}var g=a.replace(/\n.*$/,""),h=this.processBlock(g,[]);c=o(h[0]),c||(c={},h[0].splice(1,0,c));for(var f in d)c[f]=d[f];return h},u.block.definition_list=function(a,b){var c,d,e=/^((?:[^\s:].*\n)+):\s+([\s\S]+)$/,f=["dl"];if(!(d=a.match(e)))return void 0;for(var g=[a];b.length&&e.exec(b[0]);)g.push(b.shift());for(var h=0;h<g.length;++h){var d=g[h].match(e),i=d[1].replace(/\n$/,"").split(/\n/),j=d[2].split(/\n:\s+/);for(c=0;c<i.length;++c)f.push(["dt",i[c]]);for(c=0;c<j.length;++c)f.push(["dd"].concat(this.processInline(j[c].replace(/(\n)\s+/,"$1"))))}return[f]},u.block.table=function w(a){var b,c,d=function(a,b){b=b||"\\s",b.match(/^[\\|\[\]{}?*.+^$]$/)&&(b="\\"+b);for(var c,d=[],e=new RegExp("^((?:\\\\.|[^\\\\"+b+"])*)"+b+"(.*)");c=a.match(e);)d.push(c[1]),a=c[2];return d.push(a),d},e=/^ {0,3}\|(.+)\n {0,3}\|\s*([\-:]+[\-| :]*)\n((?:\s*\|.*(?:\n|$))*)(?=\n|$)/,f=/^ {0,3}(\S(?:\\.|[^\\|])*\|.*)\n {0,3}([\-:]+\s*\|[\-| :]*)\n((?:(?:\\.|[^\\|])*\|.*(?:\n|$))*)(?=\n|$)/;if(c=a.match(e))c[3]=c[3].replace(/^\s*\|/gm,"");else if(!(c=a.match(f)))return void 0;var w=["table",["thead",["tr"]],["tbody"]];c[2]=c[2].replace(/\|\s*$/,"").split("|");var g=[];for(q(c[2],function(a){a.match(/^\s*-+:\s*$/)?g.push({align:"right"}):a.match(/^\s*:-+\s*$/)?g.push({align:"left"}):a.match(/^\s*:-+:\s*$/)?g.push({align:"center"}):g.push({})}),c[1]=d(c[1].replace(/\|\s*$/,""),"|"),b=0;b<c[1].length;b++)w[1][1].push(["th",g[b]||{}].concat(this.processInline(c[1][b].trim())));return q(c[3].replace(/\|\s*$/gm,"").split("\n"),function(a){var c=["tr"];for(a=d(a,"|"),b=0;b<a.length;b++)c.push(["td",g[b]||{}].concat(this.processInline(a[b].trim())));w[2].push(c)},this),[w]},u.inline["{:"]=function(a,b,c){if(!c.length)return[2,"{:"];var d=c[c.length-1];if("string"==typeof d)return[2,"{:"];var e=a.match(/^\{:\s*((?:\\\}|[^\}])*)\s*\}/);if(!e)return[2,"{:"];var f=this.dialect.processMetaHash(e[1]),g=o(d);g||(g={},d.splice(1,0,g));for(var h in f)g[h]=f[h];return[e[0].length,""]},m.dialects.Maruku=u,m.dialects.Maruku.inline.__escape__=/^\\[\\`\*_{}\[\]()#\+.!\-|:]/,m.buildBlockOrder(m.dialects.Maruku.block),m.buildInlinePatterns(m.dialects.Maruku.inline),a.Markdown=m,a.parse=m.parse,a.toHTML=m.toHTML,a.toHTMLTree=m.toHTMLTree,a.renderJsonML=m.renderJsonML}(function(){return window.markdown={},window.markdown}()); 
// base64.js
/*
 * $Id: base64.js,v 2.12 2013/05/06 07:54:20 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.1.2";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        buffer = require('buffer').Buffer;
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer
        ? function (u) { return (new buffer(u)).toString('base64') } 
    : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe 
            ? _encode(u)
            : _encode(u).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer
        ? function(a) { return (new buffer(a, 'base64')).toString() }
    : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            a.replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
})(this); 
// blog.js
(function(){
var __query_path = location.pathname;
var _query_path = 'blog'
var _query_item = false;
if(/\/blog\/.*\.html$/.test(__query_path)){
    _query_path = __query_path.substr(1).replace(/\.html$/,'.md');
    _query_item = true;
}

//_query_item = true;
//_query_path = 'blog/2014-07-01_Hello-World.html'.replace(/\.html$/,'.md');

var path_prefix = "https://api.github.com/repos/hizzgdev/hizzgdev.github.io/contents/"
var path_suffix = "?callback=__post"

// path_prefix = "https://api.github.com/repos/sneezry/sneezry.github.com/contents/"
// _query_path = "md"

var page_size = 3;

var $html = document.getElementsByTagName('html')[0];
var $loading = document.getElementById('loading');
var $container = document.getElementById('blog_list');
var $template = document.getElementById('blog_item_template');

var __all = null;
var __all_len = 0;
var __posts = {};
var __page = 0;
var __page_total = 1;

var _first_load = true;

function cache_list(resp){
    console.log(resp);
    __all = resp.data.reverse();
    __all_len = __all.length;
    __page_total = Math.ceil(__all_len/page_size);
    show_list(1);
}

function prev_page(){
    var prev = __page + 1;
    if(prev <= __page_total){
        show_list(prev);
    }
}

function next_page(){
    var prev = __page - 1;
    if(prev > 0){
        show_list(prev);
    }
}

function show_list(page){
    if(__page == page){
        return;
    }else{
        __page = page;
    }

    if(!_first_load){
        $container.innerHTML = '';
    }
    var offset = (page-1)*page_size;
    var min = Math.min(offset,__all_len);
    var max = Math.min(offset+page_size,__all_len)
    var post = null;
    if(_first_load){
        $loading.parentNode.removeChild($loading);
    }
    for(var i=min;i<max;i++){
        post = __all[i];
        show_post_meta(post, true);
        query_item(post.path);
    }
    _first_load = false;
}

function show_post_meta(post, inlist){
    console.log(post);
    var el = $template.cloneNode(true);
    el.id = 'blog_'+post.sha;
    $container.appendChild(el);
    var post_date = post.name.substr(0,10);
    var post_name = post.name.substr(11).replace(/-/g,' ').replace(/\.en\.md$/,'').replace(/\.md$/,'');
    if(inlist){
        $('.article-heading h3 a',el).text(post_name).attr('href','/'+post.path.replace(/\.md$/,'.html'));
    }else{
        $loading.parentNode.removeChild($loading);
        $('.pager').remove();
        $('.article-heading h3',el).text(post_name);
    }
    $('span.date',el).text(post_date);
}

function show_post(resp){
    path = resp.data.path;
    if(!(path in __posts)){
        __posts[path] = resp;
    }
    if(resp.meta.status == 404){
        location.href='err.404.html#'+location.pathname;
    }
    post = resp.data;
    if(_query_item){
        show_post_meta(post, false);
    }
    var el_id = '#blog_'+post.sha;
    $(el_id+' .article-body').html(markdown.toHTML(Base64.decode(post.content)));
}

function query_item(path){
    if(path in __posts){
        show_post(__posts[path]);
    }else{
        var el = document.createElement('script');
        el.src = path_prefix+path+path_suffix;
        $html.appendChild(el);
        setTimeout(function(){$html.removeChild(el);},10000);
    }
}

function query_list(path){
    var el = document.createElement('script');
    el.src = path_prefix+path+"?callback=__list";
    $html.appendChild(el);
    setTimeout(function(){$html.removeChild(el);},10000);
}

function page_load(){
    $('.pager .next').click(function(){next_page();});
    $('.pager .prev').click(function(){prev_page();});
    if(_query_item){
        query_item(_query_path);
    }else{
        query_list(_query_path);
    }
}

window.__list = function(o){ cache_list(o); };
window.__post = function(o){ show_post(o); };

page_load();

})();

