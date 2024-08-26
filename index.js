'use strict';

const strip = require('./lib/strip');
const ai = require('./lib/ai');
const log = require('hexo-log').default({
    debug: false,
    silent: false
});
const fs = require('hexo-fs');
const fm = require('hexo-front-matter');

const config = hexo.config.hexo_ai_abstract;

hexo.extend.filter.register('after_post_render', async function (data) {

    if (config.default_enable) data.aiabstract = data.aiabstract || true;
    if (!data.aiabstract || data.excerpt || data.description) return data;

    const content = strip(data.content, config.ignoreEl);
    if (content.length > config.maxTokens) {
        log.info(`文章 ${data.title} 超过 maxTokens 限制`);
        return data;
    }

    log.info(`生成文章 ${data.title} 的AI摘要`);
    const path = this.source_dir + data.source;
    const frontMatter = fm.parse(await fs.readFile(path));
    frontMatter.excerpt = data.excerpt = await ai(config.apiKey, config.apiUrl, config.model, content, config.prompt, config.maxTokens);
    await fs.writeFile(path, `---\n${fm.stringify(frontMatter)}`);

    return data;
});
