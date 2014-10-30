---
layout: post
title: '在 Rails 中使用 browserify 管理 javascript'
date: 2014-10-30
disqus: y
---

Browserify 可以让你使用 CMD（通用模块定义）规范组织前端代码结构的 Node.js 模块。

> 如果你还没接触过的话，可以参考这里的教程：http://javascript.ruanyifeng.com/tool/browserify.html

与 Sea.js 不同的是，Browserify 并没有使用 `define` 函数来定义模块，而是与 Node.js 一样使用 `module.exports`，这样就可以不用修改任何代码实现前后端代码共用。

不过对于非 Node.js 的项目而言，即使不需要前后端代码共用，Browserify 似乎也是一个靠谱的前端模块化的解决方案。


### 在项目根目录下创建 package.json

既然要以 Node.js 方式组织前端，那首先你必须放弃 `asset pipline` 来管理 js，而是以 `npm` 的方式来引入代码。

这里是一个 `package.json` 的实例，里面预先定义了两个我们需要用到的模块：`browserify` 和 `watchify`

```json
{
  "name": "todo",
  "devDependencies": {
    "browserify": "^6.1.0"
    "watchify": "^2.0.0"
  }
}
```

运行 `npm install` 安装模块，然后设置运行脚本。在 `package.json` 中加入以下代码：

```json
"scripts": {
  "bundle": "browserify app/assets/javascripts/index.js -o app/assets/javascripts/bundle.js",
  "watch-js": "watchify app/assets/javascripts/index.js -o app/assets/javascripts/bundle.js",
  "start": "npm run watch-js & rails s"
}
```

这里我们使用 watchjs 监听文件变化，并且使用  browserify 实时将代码转换可以在浏览器运行的 `bundle.js`。

创建 `app/assets/javascripts/index.js`，这个是项目的主文件。然后清空 `app/assets/javascripts/application.js`并加入以下代码，将编译后的代码交给 `asset pipline` 管理：

```js
//= require bundle
```

最后使用 `npm start` 运行程序。


### 如何组织代码

与其他模块化工具不同，browserify 是在本地预先完成编译过程的，我们可以使用相对路径引入自定义模块。

例如，假设有两个文件：

```js
// app/assets/javascripts/my_module.js
module.exports = function() {
  return 1;
};
```

```js
// app/assets/javascripts/index.js
var fn = require('./my_module');
fn();
```


### 正确引入 jQuery 和 Backbone

Rails 一般采用 gem 的方式引入 javascript 插件，不过如果只是简单的打包，我并不推荐使用这种方式，因为你需要到 gemset 里才能看到代码。

而 browserify 可以使用 npm 管理你的第三方插件，值得注意的是，这个方案会在项目根目录下创建 `node_modules`，这个文件夹一般是不需要加入版本控制器中。

要加入 jQuery 和 Backbone，首先得修改 `package.json`：

```json
"devDependencies": {
  "backbone": "^1.1.2",
  "jquery": "^2.1.1"
}
```

运行 `npm install`，程序会自动下载目标模块和所需的依赖。

由于 jQuery 和 Backbone 本身支持 CMD 规范，我们可以直接在程序中 `require` 进来：

```js
// index.js
var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery/dist/jquery');
```


### 使用 CoffeeScript

或许会有部分人喜欢使用 CoffeeScript，browserify 提供了转换器可以直接使用。

安装 `coffeeify`

```json
"devDependencies": {
  ...
  "coffeeify": "^0.7.0"
}
```

在 `package.json` 中加入转换规则：

```json
"browserify": {
  "transform": [
    "coffeeify"
  ]
}
```

新建一个名为 `my_coffee.coffee` 文件

```coffee
# app/assets/javascripts/my_coffee.coffee
module.exports = -> 1
```

在 `index.js` 中引入该模块 (你也可以改为 `index.coffee`)，需要注意这里必须指定后缀名：

```js
// app/assets/javascripts/index.js
var fn = require('./my_coffee.coffee');
fn();
```


### 使用非 CMD 规范的插件

类似 `jquery_ujs` 这样不遵循 CMD 规范的 jQuery 插件很多，对于这类插件可以使用 `browserify-shim` 来兼容。

**未完...**

****

参考网址：

Using Browserify with Ruby on Rails: http://learnjs.io/blog/2014/03/17/using-browserify-with-rails/
