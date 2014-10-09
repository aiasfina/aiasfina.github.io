---
layout: post
title: 'comfortable-mexican-sofa 入门'
date: 2014-08-22
disqus: y
---

### 简单介绍

comfortable-mexican-sofa 是一个支持 Rails4 的 CMS 插件。是的，一个插件。这就表示他可以很方便的接入已有的项目，不会侵入到 Rails 代码。

另外，他也具备以下功能：

* 支持多站点
* 支持多语言(cs, da, de, en, es, fr, it, ja, nl, pl, pt-BR, ru, sv, zh-CN)
* 强大的模板标签
* 支持夹具导入数据
* 历史修订记录
* 高度可扩展的后台面板
* 支持多种编辑方式（代码编辑、富文本、markdown）


### 快速上手

在Gemfile 中加入下面两行：

```ruby
gem 'comfortable_mexican_sofa', '~> 1.12.1'
gem 'jquery-ui-rails', '~> 4.2' # 目前的版本需要加上这句，否则报错！
```

然后生成程序模板，并运行数据库迁移：

```
bundle install
rails generate comfy:cms
rake db:migrate
```

最后运行 `rails s` 访问 /admin 就可以了，默认的用户名密码是 username, password。你也可以在 initializers 里面修改：

```ruby
ComfortableMexicanSofa::HttpAuth.username = 'username'
ComfortableMexicanSofa::HttpAuth.password = 'password'
```

### 后台预览：

![](https://github.com/comfy/comfortable-mexican-sofa/raw/master/doc/preview.png)



### Site(站点)：

关于站点的配置非常简单，这里就简略介绍每个表单的意思：

* 标签 和 标识符 是唯一的，而且标示符会随着标签输入自动生成，一般无需改动
* 主机名 就是域名（或 IP）
* 路径是该站点的首页，什么都不填的话直接指向主机名
* 镜像是比较抽象的功能。如果勾选了这个功能，当新增一个页面或布局时，程序会为每个站点都生成一个一模一样的页面，内容为空


### Layout(布局)：

相比 site，layout 显得有些复杂。布局名称和标识符与站点一样无需多言。关键是下面的 上级布局 和 应用布局。

与 Rails 不同，在 comfortable-mexican-sofa 中，布局是可以继承的。

上级布局 ：表示该布局继承自 CMS 中已存在的布局。
应用布局：表示该布局继承自 Rails 里面的布局文件，也就是 `/views/layouts/` 里面的布局文件。

> 在这里需要注意的是，无论是上级布局或者应用布局，都可能会引起 html 标签冲突，导致页面内存在多个 html 标签嵌套。

所以在选择布局继承时，应当确保在所有祖先布局中有且仅有一个布局定义了 html 标签。如果选择了 应用布局，那么在 cms 内所有的子孙布局都不应该存在 html 标签。

下面是布局内容，[官方 wiki](https://github.com/comfy/comfortable-mexican-sofa/wiki/Layouts) 给了一个不怎么好的示例，我把他修改了一下：

假设该布局的标识符（identifier）是 default，布局内容如下

```html
<html>
  <head>
    <title>{{ cms:page:title:string }}</title>
    {{ cms:asset:default:css:html_tag }}
    {{ cms:asset:default:js:html_tag }}
  </head>
  <body>
    <div class='content'>
      {{ cms:page:content }}
    </div>
  </body>
</html>
```

这应该是比较完整的例子，不过由于还没介绍 “标签”，或许你会有点疑惑。那就先看完再说吧。（如果你是开着项目走下来的，不妨先把上面的例子入库了 : ）



### snippet(片段) 和 page(页面)：

关于这两个功能好像没啥好讲的，自己操作一下应该就能懂个大概，我就略过了...

目前官方仓库维护的版本中 snippet 使用的是富文本编辑器，这个我个人认为不怎么好，所以自己改成 cm 编辑器了。

如果你需要，可以直接到我的 github 里面取，或者自己改（强烈建议！改哪里看提交记录就 ok 了）



### tags(标签)：

官方 wiki 已经介绍得比较详细了，如果英文还可以的话，不妨直接看 wiki

```
{{ cms:page:content:text }}
    \    \     \      \ 
     \    \     \      ‾ 标签格式或扩展属性
      \    \     ‾‾‾‾‾‾‾ 标签标识（slug/label/path）
       \    ‾‾‾‾‾‾‾‾‾‾‾‾ 标签类型 (page, field, snippet, helper, partial)
        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾ cms 标签起始标识
```



未完待续...