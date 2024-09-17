'use strict';

hexo.extend.filter.register('after_post_render', require('./lib/generator'), 15);
hexo.extend.filter.register('before_post_render', require('./lib/injector'), 15);
