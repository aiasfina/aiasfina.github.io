---
layout: post
title: '类似 Material Desgin 点击涟漪效果的 JS 插件 - Waves'
date: 2014-09-15
---

Waves 是一个实现 Material Design 点击涟漪动画的 JS 插件，原生 JavaScript 实现不依赖 jQuery。


> 官方网站与Demo: http://publicis-indonesia.github.io/Waves/


### 快速入门


你只需要将 [waves.js](https://raw.githubusercontent.com/publicis-indonesia/Waves/master/dist/waves.js) 和 [waves.css](https://raw.githubusercontent.com/publicis-indonesia/Waves/master/dist/waves.css) 引入到 HTML 就可以开始使用了。此外 Waves 也提供了 scss, less 和 sass！

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Waves example</title>

        <link rel="stylesheet" type="text/css" href="/path/to/waves.min.css" />

    </head>
    <body>
        <a href="#" class="waves-effect waves-button">Click Here</a>

        <script type="text/javascript" src="/path/to/waves.min.js"></script>
        <script type="text/javascript">
            Waves.displayEffect();
        </script>
    </body>
</html>
```

### input 元素

由于插件不支持单个 `input` 标签，如果你想要中使用就必需在 `input` 标签外包裹一层 `i` 标签。

```html
<!-- Before displaying the effect -->
<input class="waves-button-input" type="submit" value="Button C">

<!-- After displaying the effect -->
<i class="waves-effect waves-button waves-input-wrapper" style="width:85px;height:36px;">
    <input class="waves-button-input" type="submit" value="Button C">
</i>
```

### 图标

`waves` 支持图标按钮（你可用类似 FontAwesome 的图标集）

```html
<i class="fa fa-gear waves-effect waves-circle"></i>
```

### div 或图片

对于 `img` 这种无闭合的标签，你需要在外面包裹一层：

```html
<!-- For single tag element -->
<span class="waves-effect">
    <img src="/path/to/images.jpg">
</span>
```

而 `div` 标签需要使用 `.waves-block` 来限制 `display` 为 `block`：

```html
<!-- For blocky display to keep its shape -->
<div class="waves-effect waves-block">
    Block A
</div>
```

### 缺点
对于圆角元素（比如圆形按钮），涟漪的遮罩会无视 `border-radius` 属性，所以会形成一个正方形的遮罩层，如果你也一样是使用 `overflow` 来实现，那无解。

要真正解决这个 BUG 只能使用 canvas 来实现，比如 `Polymer`

PS: 最新版本的 chrome 已经解决该问题。