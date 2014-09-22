---
layout: post
title: 'Ruby 2.2 的 可回收 symbol'
date: 2014-09-12
---

> Q: 请描述一下 Symbol 可能引起的内存泄露？

> A: Symbol 不会被 GC 回收，如果频繁调用 `#to_sym` 方法将字符串转换成 Symbol 的话，会耗费大量内存。


这个是我比较喜欢的一道面试题，不过你已经不用记这个问题了，因为它将在 Ruby 2.2 得到解决。

***

### 进入正题


六个月前，Narihiro Nakamura 放出了一个 [补丁](https://bugs.ruby-lang.org/issues/9634) ，这个补丁可以让 Ruby GC 对 Symbol 进行回收，而这个特性将会与 Ruby 2.2 一同发布。


Ruby 语言规定了 Symbol 是不可回收的单例对象，为什么会在这个时候才成为 GC 的目标呢？

这是因为Ruby 在定义 Symbol 时过于粗暴了，让所有 symbol 都不可回收，而在日常开发中大部分的 Symbol 都是可以回收的。


### 动态 symbol

在 Ruby 2.2 中，Narihiro Nakamura 并没有过多地改动原有的 symbol，而是定义了一个新的类型 `dynamic symbol`。

这个类型在 C 里面是一个 `RSymbol`，与 `RString`, `RArray` 等一样是 `RVALUE`，这样 GC 就可以针对该 structs 进行回收。

于是乎 Symbol 就被分为 静态 和 动态 两种：

* 静态 symbol
 1. 由 rb_intern() 生成的
 2. A sequential unique number as in the past. (？)
 3. 不可回收
 4. LSB = 1 (id 的最低有效位等于1)
 5. 保留 ID 在 147 以下的例外

* 动态 symbol
 1. 在 Ruby 中调用 `#to_sym`, `#intern` 生成的
 2. 在 C 中是一个 `RVALUE`
 3. 可以回收
 4. LSB = 0
 5. 当它通过 `SYM2ID` 或 `rb_intern` 转换成一个 ID 时会变成受限状态
 6. 受限状态的 symbol 不会被回收
 
 ### Ruby 的改动
 
 无论 symbol 是动态还是静态， 对于 Ruby 都是透明的。这里是实现清单：
 

* parse.y: support Symbol GC. [ruby-trunk Feature #9634]
See this ticket about Symbol GC.

* include/ruby/ruby.h:
  Declare few functions.

    * rb_sym2id: almost same as old SYM2ID but support dynamic symbols.
    * rb_id2sym: almost same as old ID2SYM but support dynamic symbols.
    * rb_sym2str: almost same as rb_id2str(SYM2ID(sym)) but not pin down a dynamic symbol. Declare a new struct.
    * struct RSymbol: represents a dynamic symbol as object in Ruby's heaps. Add few macros.
    * STATIC_SYM_P: check a static symbol.
    * DYNAMIC_SYM_P: check a dynamic symbol.
    * RSYMBOL: cast to RSymbol
    
    
* gc.c: declare RSymbol. support T_SYMBOL.

* internal.h: Declare few functions.

    * rb_gc_free_dsymbol: free up a dynamic symbol. GC call this function at a sweep phase.
    * rb_str_dynamic_intern: convert a string to a dynamic symbol.
    * rb_check_id_without_pindown: not pinning function.
    * rb_sym2id_without_pindown: ditto.
    * rb_check_id_cstr_without_pindown: ditto.
    
    
* string.c (Init_String): String#intern and String#to_sym use rb_str_dynamic_intern.

* template/id.h.tmpl: use LSB of ID as a flag for determining a static symbol, so we shift left other ruby_id_types.

* string.c: use rb_sym2str instead rb_id2str(SYM2ID(sym)) to avoid pinning.

* load.c: use xx_without_pindown function at creating temporary ID to avoid pinning.

* object.c: ditto.

* sprintf.c: ditto.

* struct.c: ditto.

* thread.c: ditto.

* variable.c: ditto.

* vm_method.c: ditto.


可以看出，很多改动都是针对新的 `RSymbol`，而 `string.c` 中改为调用 `rb_str_dynamic_intern` 使得我们可以通过 `String#intern` 和 `String#to_sym` 获得动态 symbol。

### Benchmark

```ruby
# /tmp/a.rb
obj = Object.new
100_000.times do |i|
  obj.respond_to?("sym#{i}".to_sym)
end
GC.start
puts"symbol : #{Symbol.all_symbols.size}"
```

```
% time RBENV_VERSION=ruby-r45059 ruby -v /tmp/a.rb
ruby 2.2.0dev (2014-02-20 trunk 45059) [x86_64-linux]
symbol : 102416
0.24s user 0.01s system 91% cpu 0.272 total

% time RBENV_VERSION=symgc ruby -v /tmp/a.rb
ruby 2.2.0dev (2014-02-20 trunk 45059) [x86_64-linux]
symbol : 2833
0.21s user 0.01s system 90% cpu 0.247 total
```
* symgc 的 symbols 对象的数量大量减少了
* 由于 Full GC 减少，使得 symgc 总耗时更少

这里有一份更详尽的性能测试清单，可以看出性能并没有明显下降 https://gist.github.com/authorNari/9359704