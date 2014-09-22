---
layout: post
title: '使用 LiveScript 开发 node-webkit'
date: 2014-08-16
---

> node-webkit 是一个基于 Chromium 和 NodeJS 的运行环境，你可以在上面使用 Web 的技术开发跨平台的桌面应用程序。

> Github: https://github.com/rogerwang/node-webkit

node-webkit 本身的核心是 Chromium ，但他并不支持 JavaScript 外的转译语言。

好在他同时提供了 nodejs 作为后端运行环境，这样我们就有机会使用 LiveScript 开发程序。（CoffeeScript 重度患者亦可参考~）



首先，建一个 index.html ：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using node.js <script>document.write(process.version)</script>.
  </body>
</html>
```

然后是 `package.json` ：

```json
{
  "name": "nw-demo",
  "main": "index.html"
}
```

这两个文件构成了一个最简单的 node-webkit 程序，运行它

```
$ /path/to/nw .
```

基本骨架搞定，接下来是接入 LiveScript，在项目根目录下执行 npm 安装 LiveScript

```
$ npm install LiveScript
```

修改 `index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Hello World!</title>
    <script>
      require('livescript');
      require('myapp.ls');
    </script>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using node.js <script>document.write(process.version)</script>.
  </body>
</html>
```

需要注意的是我们自己的脚本文件 myapp.ls 不能通过 `<script src="...">` 导入，而是通过 node-webkit 预留的 `require` 方法，该函数导入的脚本都会在 nodejs 下运行。

```coffeescript
# myapp.ls
typeof! document #=> "Undefined"
typeof! window.document #= "Object"
```

由于脚本是运行在 nodejs 环境中，当我们需要操作 dom 时非常不方便，而且导致 jQuery 等一系列操作 dom 的库无法运行。

这个问题应该是无解了，所以我的建议是：

* 使用 LiveScript 进行后端操作
* JavaScript 按照正常 WEB 的方式引入，按需 require 后端脚本


最后应该就是这个样子了：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Hello World!</title>
    <script>
      require('livescript');
    </script>
    <script src="app.js"></script>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using node.js <script>document.write(process.version)</script>.
  </body>
</html>
```

```coffeescript
# foo.ls
exports.say-hello = ->
  'Hello, world'
// app.js
var foo = require('./foo.ls');
alert(foo.sayHello());
```

事实上，即使开发者独自一人并精通 js 和 ls，频繁切换还是会有碍开发的。

如果你是FP狂热粉丝那不妨一试，不过多人开发的项目记得戴钢盔！