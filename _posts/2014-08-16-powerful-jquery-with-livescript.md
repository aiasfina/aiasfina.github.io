---
layout: post
title: '[译]jQuery 与 LiveScript'
date: 2014-08-16
---

jQuery 是一个非常强大的类库，并且已经深入到日常网站开发当中。

但不幸的是，在享受 jQuery 爽快的开发过程的同时，你或许会感受到来自 JavaScript 某些语法上的笨拙。

LiveScript 是一门编译到 JavaScript 的语言。他本身只是套着一层语法糖并增加了一些特性的 JavaScript，但却可以让你发挥出 jQuery 的全部能力。

> 你是否了解过 CoffeeScript 或 LiveScript？如果是的话，你可以跳过第一小节。

首先我们需要了解一下 LiveScript 的基础：

### LiveScript 概览

就像许多现代语言一样，LiveScript 使用空格缩进来表示代码块，换行取代分号（如果需要将多条语句写成一行，你可以用上分号）。

代码用例：（上面为 LiveScript，下面为编译后的 JavaScript）

```coffeescript
if 2 + 2 == 4
  doSomething()
if (2 + 2 === 4) {
  doSomething();
}
```

> 你可以在 [LiveScript](http://gkz.github.com/LiveScript/) 网站上编译运行各种例子

你可以在调用函数时省去括号.

```coffeescript
add 2, 3
```

```javascript
add(2, 3);
```

而注释则变成这样:

```coffeescript
# from here to the end of the line.
```

```javascript
// from here to the end of the line
```
在 jQuery 里经常会使用冗长的 function 关键字和分号、大小括号来定义回调函数，而在 LIveScript 中这将变得轻松愉快:

```coffeescript
(x, y) -> x + y

-> # an empty function

times = (x, y) ->
  x * y
# multiple lines, and be assigned to a var like in JavaScript
```

```javascript
var times;
(function(x, y){ return x + y; });

(function(){});

times = function(x, y){
  return x * y;
};
```
如你所见，函数定义非常简洁！你或许也注意到了 LiveScript 并没有写 return 语句，但转译之后却出现了。

这是由于在 LiveScript 中一切皆表达式，这样会默认返回最后一行的结果。

尽管如此，你依然可以显式调用 return 跳出程序，或者在函数表达式前加上叹号来阻止程序自动返回

`no-ret = !(x) -> ...`

### 链式操作

jQuery 里随处可见的链式操作在 LiveScript 中变得更加漂亮了。

使用空格隔开的属性访问将转换成隐式调用，这样就可以省掉大量的括号了。

此外，你可以使用反斜线来表示一个单词（中间没有空格）。


```coffeescript
$ \h1 .find \img .prop \src
```

```javascript
$('h1').find('img').prop('src');
```
你可以使用 ! 代替 () 来无参调用函数，比如 f! 。此时甚至可以省去 . 就可以链式调用

```coffeescript
$ \.footer .parent!empty!append content
$ \.article .next!contents!
```

```javascript
$('.footer').parent().empty().append(content);
$('.article').next().contents();
```

流式语法将链式调用分层，你可以抛弃 `ends()` 方法了。

```coffeescript
$ \.content .parent!
  ..find \.sidebar
    ..append newContent
    ..addClass \highlight
  ..toggleClass \dark
  ..prepend newHeader
var x$, y$;
x$ = $('.content').parent();
y$ = x$.find('.sidebar');
y$.append(newContent);
y$.addClass('highlight');
x$.toggleClass('dark');
x$.prepend(newHeader);
```

### 反箭头

反箭头允许你定义嵌套回调函数。他像是函数，除了箭头方向是相反的。

一个常见的例子 - 你得将 $(document).ready 里面的代码全部向右缩进，这是否让你感累不爱？

```coffeescript
<-! $
initializeApp!
...
```

```javascript

$(function(){
  initializeApp();
  ...
});
```

反箭头在 Ajax 真的可以闪瞎狗眼:

```coffeescript
data <-! $.get 'ajaxtest'
$ \.result .html data
processed <-! $.get 'ajaxprocess', data
$ \.result .append processed
```

```javascript
$.get('ajaxtest', function(data){
  $('.result').html(data);
  $.get('ajaxprocess', data, function(processed){
    $('.result').append(processed);
  });
});
```

### 迭代

列表推导提供了强大的遍历集合的能力。

```coffeescript
values = [input.val! for form in $ \form for input in form]
```

```javascript
var res$, i$, ref$, len$, form, j$, len1$, input, values;
res$ = [];
for(i$=0, len$=(ref$ = $('form')).length; i$ < len$; ++i$){
  form = ref$[i$];
  for (j$ = 0, len1$ = form.length; j$ < len1$; ++j$) {
    input = form[j$];
    res$.push(input.val());
  }
}
values = res$;
```

### 结语

上面只是 LiveScript 的简单概述。如你所见，LiveScript 提供的丰富的特性使得 jQuery 更加强大。

你可以访问 LiveScript 网站来获取更多的信息。



作者：George Zahariev

原文地址：http://livescript.net/blog/powerful-jquery-with-livescript.html