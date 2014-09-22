---
layout: post
title: '一个简单的新权限角色插件-Royce'
date: 2014-09-23
---

Royce 是一个最近新出来的角色插件，它为角色控制提供了一些便利的方法。
插件本身的代码非常的少，目前只支持 active_record，并不支持 mongoid。

## 快速安装

在 `Gemfile` 中添加：

```ruby
gem 'royce'
```

bundle 之后生成迁移：

```
rails g royce:install
rake db:migrate
```

然后在目标模型中使用 `royce_roles` 方法定义可用角色名列表：:

```ruby
class User < ActiveRecord::Base
  royce_roles %w[ user admin editor ]
end
```

## 使用方法

Royce 只提供少量的方法供你使用：

在使用 `add_role`, `remove_role` 操作模型角色时，你需要确保该模型实例拥有一个 `id`，即已存在于数据库中：

```ruby
user = User.create

user.add_role :user
user.remove_role :user
user.has_role? :user
user.allowed_role? :user
```

Royce 为 `has_role?` 提供了更简便的方法：

```ruby
user.admin?
user.editor?
user.user?
```

值得注意的是，当角色并不在可用角色列表中，程序会抛出 `NoMethod` 错误:

```ruby
user.hello? # Error
```

你也可以使用 `!` 来访问，当模型没有该角色时程序会抛出错误：

```ruby
user.admin!
user.editor!
user.user!
```

`role_list` 方法会返回模型实例拥有的角色列表，`available_role_names` 方法则会返回模型可用的角色列表：

```ruby
user.add_role :user
user.add_role :admin
user.role_list # => ['user', 'admin']

User.available_role_names # => ['user', 'admin', 'editor']
```

你可以使用角色对应的 `scope`

```ruby
User.admins
User.editors
User.users
```

## 与 rolify 的异同

Royce 并没有 rolify 那样涉及到资源方面的控制，而只有角色操作，这大大地简化了插件的复杂度。
但有时候我们会想对单个资源定义所属角色，这时候只能自己实现该逻辑。

```ruby
# 在 rolify 中，你可以针对单个资源派发角色
user.has_role? :editor, article.first
```