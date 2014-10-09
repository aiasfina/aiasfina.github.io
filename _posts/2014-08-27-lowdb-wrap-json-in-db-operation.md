---
layout: post
title: 'LowDB，用数据库的方式操作 JSON'
date: 2014-08-27
disqus: y
---

**LowDB** 是一个基于 Lo-Dash 和 underscore.db 的 NodeJS 插件，他给 Object 和 JSON 文件包装了一系列模仿数据库操作的方法

* 无服务，通过文件或内存方式存取
* 高速
* 支持事件
* 丰富的API，提供来自 Lo-Dash 的五十多个方法

> 值得注意的是，该插件虽然名字里有 DB，但只是模拟，并不是真正的 DB。插件通过 underscore.db 提供的接口同步读写 JSON 文件，只适合存取少量数据



#### 用法：

插入条数据

```javascript
var low = require('lowdb')
low('songs').insert({title: 'low!'})
```

数据库将会自动创建 `db.json`

```json
{
  "songs": [
    {
      "title": "low!",
      "id": "e31aa48c-a9d8-4f79-9fce-ded4c16c3c4c"
    }
  ]
}
```

你可以通过 `Lo-Dash` 的方法查询：

```javascript
var songs = low('songs').where({ title: 'low!' }).value()
```

查询是链式的，只有通过 `.value` 方法才能返回最终结果

```javascript
var topFiveSongs = low('songs')
  .where({published: true})
  .sortBy('views')
  .first(5)
  .value();

var songTitles = low('songs')
  .pluck('titles')
  .value()

var total = low('songs').size()
```

如果你不想程序自动同步数据到文件，可以将 `autoSave` 设为 `false`，这样数据就只存储在内存中

```javascript
var low = require('lowdb')
low.autoSave = false;
```

### 支持浏览器的 underscore.db

lowDB 并不支持浏览器，不过你可以考虑使用 underscore.db

underscore.db 支持 localStorage 和 内存两种方式。

#### 用法

引入文件

```html
<script src="underscore.js" type="text/javascript"></script>
<script src="underscore.db.js" type="text/javascript"></script>
```

创建一个空对象

```javascript
var db = {
  posts: []
}
```

插入、查询 post 记录

```javascript
var newPost = _.insert(db.posts, {title: 'foo'});

var post = _.get(db.posts, newPost.id);

var post = _.find(db.posts, function(post) {
  return post.title === 'foo'
});
```

持久化

```javascript
_.save(db);
```

> 参考：

> [DailyJS]: http://dailyjs.com/2014/08/21/lowdb/

> [Github] lowdb: https://github.com/typicode/lowdb

> [Github] underscore.db: https://github.com/typicode/underscore.db

> 推荐阅读：

> [Github] way.js: https://github.com/gwendall/way.js