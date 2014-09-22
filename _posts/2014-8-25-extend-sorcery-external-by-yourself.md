---
layout: post
title: '如何给 Sorcery 加上国内的三方登录'
date: 2014-08-25
---

> Sorcery 是我最常用的一个登录插件，相比“重量级”插件 devise 简单很多。插件配置灵活，本身内置了 重置密码、记住我、三方登录等子模块，提供了有限的 API，十分容易上手。

> Github: https://github.com/NoamB/sorcery

> Railscast: http://railscasts.com/episodes/283-authentication-with-sorcery



Sorcery 本身提供了三方登录模块，支持 Twitter, Facebook, Github, Google, LinkedIn, VK, LiveID and Xing 等厂商，可惜的是国内的厂商一个也没有（废话）。

如此一来就只能 hack 源码来给插件打上补丁了。

OK，那就一步一步来吧。（PS：这里是教你如何一步一步来 hack，我不知道对新手如何阅读源码是否有效。如果嫌我啰嗦的话直接看最后的新浪微博的例子吧 :）



### 找到入口

在开始 hack 之前你要做的事有几件：

1. 从 github 上将源码拷贝到本地
2. 仔细阅读插件文档
3. 弄清楚使用 Sorcery 三方的用法
4. 那直接从第二步开始吧！

首先看项目里面的 README， 不过没有详细阐述插件的各个用法。但请注意里面的这段话：

> External (see [lib/sorcery/controller/submodules/external.rb](https://github.com/NoamB/sorcery/blob/master/lib/sorcery/controller/submodules/external.rb)):

> OAuth1 and OAuth2 support (currently: Twitter, Facebook, Github, Google, LinkedIn, VK, LiveID and Xing)
configurable db field names and authentications table.

从这我们可以得知三方登录的模块是 `lib/sorcery/controller/submodules/external.rb`，记住后暂时不管，过会再回来。

来到 [wiki - external](https://github.com/NoamB/sorcery/wiki/External) 认真看完。这里有关 rails 的代码都是各个已支持平台公用，也就是相关逻辑已经全部封装到插件中。

不过在进入源码之前，请先注意一下 Sorcery 的初始化配置：

```ruby
# config/initializers/sorcery.rb

# 在该数组上追加需要开启的 external 模块
Rails.application.config.sorcery.submodules = [:external, blabla, blablu, ...]

Rails.application.config.sorcery.configure do |config|
  ...
  # 在这里声明引入对应平台支持
  config.external_providers = [:twitter, :facebook]


  config.twitter.key = "<your key here>"
  config.twitter.secret = "<your key here>"
  config.twitter.callback_url = "http://0.0.0.0:3000/oauth/callback?provider=twitter"
  config.twitter.user_info_mapping = {:username => "screen_name"}

  config.facebook.key = "<your key here>"
  config.facebook.secret = "<your key here>"
  config.facebook.callback_url = "http://0.0.0.0:3000/oauth/callback?provider=facebook"
  config.facebook.user_info_mapping = {:email => "email", :name => "name", :username => "username", :hometown => "hometown/name"} #etc
  config.facebook.scope = "email,offline_access,user_hometown,user_interests,user_likes" #etc
  config.facebook.display = "popup"
  ...
end
```

OK，找到入口了。就是上面两行中文注释下的那行代码。为什么不是 `lib/sorcery/controller/submodules/external.rb`？这是因为我们要扩展代码，所以得弄清整个执行流程。



### 进入代码

Ruby gem 非常方便阅读，这是因为他们都有共同的切入点：

* xx.gemspec 的插件描述文件，这里可以找的插件依赖
* 在 lib 目录下与插件同名的 .rb 主程序入口文件
* Rails GEM 里多一个 lib/xxx/engine.rb，这里是 Rails 的入口逻辑

在这里 `/lib/sorcery.rb` 和 `sorcery.gemspec` 没有多大参考意义，直接到 engine.rb：

```ruby
require 'sorcery'
require 'rails'

module Sorcery
  # The Sorcery engine takes care of extending ActiveRecord (if used) and ActionController,
  # With the plugin logic.
  class Engine < Rails::Engine
    config.sorcery = ::Sorcery::Controller::Config # <= 这里是配置入口，第一个入口点
    
    initializer "extend Controller with sorcery" do |app|
      ActionController::Base.send(:include, Sorcery::Controller) # <= 根据后面的代码判断，这里是最后一个入口点
      ActionController::Base.helper_method :current_user
      ActionController::Base.helper_method :logged_in?
    end
    
    rake_tasks do
      load "sorcery/railties/tasks.rake"
    end
    
  end
end
```

来到 `lib/sorcery/controller/config.rb` ，这里除了 submodules 这个字段外并没太多逻辑，应该是组织配置信息，因此我们再退回到 engine.rb，来到第二个入口 `lib/sorcery/controller.rb` 。

```ruby
module Sorcery
  module Controller
    def self.included(klass)
      klass.class_eval do
        include InstanceMethods
        Config.submodules.each do |mod| # 这里对应 Rails.application.config.sorcery.submodules = []
          begin
            include Submodules.const_get(mod.to_s.split('_').map { |p| p.capitalize }.join) # <= 这里 include 子模块
          rescue NameError
            # don't stop on a missing submodule.
          end
        end
      end
      Config.update!
      Config.configure!
    end
    ...
  end
end
```

根据上面的代码判断，子模块应该是 `Sorcery::Controller::Submodules::External` ，恰好就是全面提到的 `lib/sorcery/controller/submodules/external.rb`

```ruby
...

require 'sorcery/providers/base'
require 'sorcery/providers/facebook'
require 'sorcery/providers/twitter'

...

Config.module_eval do
  class << self
    def external_providers=(providers) # 对应 config.external_providers = [...]
      @external_providers = providers 

      providers.each do |name|
        class_eval <<-E
          def self.#{name}
            @#{name} ||= Sorcery::Providers.const_get('#{name}'.to_s.capitalize).new  # 这里为每个指定的三方平台创建一个对象
          end
        E
      end
    end
...
  end
end
...
```

程序把所有的三方模块都 require 进来，遍历 `providers`，也就是我们在配置文件里的 `config.external_providers`，然后创建一个对象。

看到这里，已经搞清楚了该如何将自己的代码接入到插件中：

* 手动 require 自己的模块，模块全名是 Sorcery::Providers::XXX
* config.external_providers = [:xxx]


### 协议逻辑

![oauth developer](/uploads/attachment/file/2/oauth_developer_2.jpg)


上面的流程图并不复杂，直接打开 `github.rb` ，你会惊喜的发现里面只有三个与 oauth 流程有关的方法：

* `get_user_hash`。 这个是请求用户资源信息，只要将数据组织成 {user_info: xxx, uid: xxx} 这个格式的 Hash 返回就会自动入库
* `login_url`。 这是在我们网站上生成三方登录按钮的链接，这样可以适应其他厂商的接口
* `process_callback`。这个是第二步处理用户跳转回来时的 request_token 方法，在这里请求 access_token


整个流程应该就是 `login_url` -> `process_callback` -> `get_user_hash`。只要实现这三个方法就可以了，非常的简单！



### 新浪微博

> 非常遗憾的是，之前所写的包括新浪微博，qq微博，豆瓣的补丁代码都是在上一家公司写的不能拿出来（已经离职了手里也没有在职时写的代码了）。

> 现在过了那么久了才想起写博客，所以只能临时凑合写一个（无测试）。不要直接拷贝下来，自己对照着新浪API看好了。


```ruby
# lib/weibo.rb
module Sorcery
  module Providers
    # This class adds support for OAuth with github.com.
    #
    #   config.github.key = <key>
    #   config.github.secret = <secret>
    #   ...
    #
    class Weibo < Base

      include Protocols::Oauth2

      attr_accessor :auth_path, :scope, :token_url, :user_info_path, :uid_path

      def initialize
        super

        @scope          = nil
        @site           = 'https://api.weibo.com/'
        @user_info_path = 'https://api.weibo.com/2/users/show.json'
        @uid_path       = 'https://api.weibo.com/2/account/get_uid.json'
        @auth_path      = '/oauth2/authorize'
        @token_url      = '/oauth2/access_token'
      end

      def get_user_hash(access_token)
        response = access_token.get(user_info_path)
        uid      = get_weibo_uid(access_token)
        {}.tap do |h|
          h[:user_info] = JSON.parse(response.body)
          h[:uid] = uid
        end
      end

      def get_weibo_uid(access_token)
        JSON.parse(access_token.get(uid_path).body)['uid']
      end

      # calculates and returns the url to which the user should be redirected,
      # to get authenticated at the external provider's site.
      def login_url(params, session)
        authorize_url({ authorize_url: auth_path })
      end

      # tries to login the user from access token
      def process_callback(params, session)
        args = {}.tap do |a|
          a[:code] = params[:code] if params[:code]
        end

        get_access_token(args, token_url: token_url, token_method: :post)
      end

    end
  end
end
```

```ruby
require Rails.root.join('lib/weibo.rb')

Rails.application.config.sorcery.submodules = [:external]

Rails.application.config.sorcery.configure do |config|
  ...
  config.external_providers = [:weibo]

  config.weibo.key = ''
  config.weibo.secret = ''
  config.weibo.callback_url = 'http://0.0.0.0:3000/oauth/callback?provider=weibo'
  ...
end
```