---
layout: post
title: '[传教向]LiveScript，不仅仅是 JavaScript'
date: 2014-08-19
---

> 最近在充实一下贫瘠的博客好在面试时加点分，刚好撸完这篇顺道传教来了...
> 另外[博客](http://catlog.info/p/livescript-not-only-javascript)里面还有好几篇关于 LiveScript 的:)

如果你还不知道 LiveScript，可以看看这里： [从CoffeeScript转到LiveScript的10个理由](http://catlog.info/p/ten-reasons-to-switch-from-coffeescript)

### 脱离 <- 回调嵌套

<-  这是直接引诱我从 CoffeeScript 转到 LiveScript 的符号，他可以扁平化嵌套回调

```coffee
# CoffeeScript
$ ->
  $(document).on 'click', '#btn', (e) ->
    $.get '', (resp) ->
      console.log resp
```

```coffee
# LiveScript
<-! $
e <- $ document .on \click \#btn
resp <- $ .get ''
resp |> console .log
```

上面这两段代码是等价的，但是 LiveScript 明显少了很多缩进

不过，如果中间夹杂着顺序逻辑，这或许会给你造成困扰...


```coffee
# CoffeeScript
$ ->
  $(document).on 'click', '#btn1', (e) ->
  $(document).on 'click', '#btn2', (e) ->
```
这时候可以使用 do 来摆脱嵌套


```coffee
<-! $
do
  e <- $ document .on \click \#btn1
do
  e <- $ document .on \click \#btn2
```

### 多才多能的 do

在 CoffeeScript 中，do 可以立即调用函数。而在 LiveScript...

**调用函数**


```coffee
foo = ->
do foo # CoffeeScript 也有
foo! # LiveScript推荐的无参调用
```

**参数包装**


```coffee
# CoffeeScript
foo = (int, obj) ->
foo 123,
  bar: 1
```

LiveScript 并不支持换行+缩进调用，但可以使用 do 关键字来实现真正的多行参数，这在用表达式作为参数时非常有用


```coffee
foo = (int, obj) ->
foo do
  if true then 1 else 2
  bar: 1
```

**代码块，相当于 (...)**


```coffee
fn = (arg1, arg2) ->
do
  e <- doAsync!
do 
  fn do
    do
      foo!
      bar!
    123
```

### 双向管道

管道是 LiveScript 非常炫的语法，管道前的结果将会作为管道后函数的参数被调用

```coffee
[1 2 3] |> map (* 2) |> sum #=> 12
```
也支持反向，但只是代码反转，结果是一样的

```coffee
sum <| map (* 2) <| [1 2 3]
```
有了正反向管道，就出现了双向管道了。LiveScript 在处理双向管道时会先计算右管道，再计算左管道

```coffee
sum <| [1 2 3] |> map (* 2)
```
以上三段代码代码转译结果等价

### 占位符

LiveScript 的占位符提供了 部分应用函数 的特性

```coffee
plus = (a, b) ->
  a + b
plus5 = plus 5, _
plus5 1 #=> 6
```
也可以应用到管道上，与上面不同的是，下面的代码不会生成 partialize$ 函数

```coffee
1 |> plus 5, _
```
如果你熟悉 Scala，或许会像我一样写过这样的代码

```coffee
new Date |> _.get-year! # 错误！
```
这是因为 LiveScript 的占位符只能用在参数位置，管道并不会推导成调用者本身

```coffee
new Date |> -> it.get-year! # 正解
```

### 使用 let 改变上下文

立即执行函数(Immediate Functions) 在 JavaScript 到处可见，这是因为 JavaScript 搞笑的变量声明，如果在全局环境下声明会默认成为全局变量

在 CoffeeScript 和 LiveScript 会把每个 script 文件内的代码都编译在立即执行函数中，所以并不常见。但有时侯我们会想改变上下文

```coffee
let this = {}
  @a = 1
```
请注意 this 赋值一定要在最前面

```coffee
let this = window, $ = jQuery
  $.do-something!
```
### 神奇的括号

LiveScript 的括号很神奇，不同的位置有着不同的效果

当括号里是变量时，会转译成函数调用

```coffee
(foo 1) #== lisp 方式的函数调用
(foo (bar (cf 1))) #== 同上
```

当括号里是 点+变量，转译成函数定义


```coffee
(.join '')
```
当括号里是操作符时，转译成函数定义

```coffee
plus1 = (+ 1)
plus 1 #=> 2
```

### 绑定流

LiveScript 支持多层级流式调用，跟 jQuery 搭配时可以忘掉 ends() 了

```coffee
$ \.content .parent!
  ..find \.sidebar
    ..append newContent
    ..addClass \highlight
  ..toggleClass \dark
  ..prepend newHeader
```
这段代码会被翻译为

```javascript
var x$, y$;
x$ = $('.content').parent();
y$ = x$.find('.sidebar');
y$.append(newContent);
y$.addClass('highlight');
x$.toggleClass('dark');
x$.prepend(newHeader);
```
有时候，我们会需要流间的结果

```coffee
$ \.content .parent!
  sidebar = ..find \.sidebar
    ..append newContent
    ..addClass \highlight
  ..toggleClass \dark
  ..prepend newHeader

sidebar
```
###  函数复合

函数复合可以将几个操作合并在一起，调用顺序与箭头方向一致

```coffee
plus1 = (+ 1)
div2  = (/ 2)
div2-then-plus1 = plus1 << div2
plus1-then-div2 = plus1 >> div2
```
需要注意的是函数复合不能用在方法上！因此局限很大

### 多样的箭头

->  定义函数

<-  定义回调函数

!-> 无返回值函数

<-! 无返回值回调函数

~> 绑定上下文的函数，等同于 CoffeeScript 的 fat arrow

--> 柯里化函数

~~> 绑定上下文的柯里化函数

> 除了箭头，LiveScript 也支持 function 关键字的函数声明


总结：

LiveScript 的语法糖非常非常的多，在 CoffeeScript 的语法基础上进一步向 FP 靠拢，并提供了 prelude.ls 标准库。

入门相比 CoffeeScript 要困难，不过如果你是FP的爱好者，不妨一试 :)

ps: 这里是我用 liveScript 写的 express4 的 demo: (https://github.com/aiasfina/express4-livescript-sample)