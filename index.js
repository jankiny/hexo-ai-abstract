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

    if (!config.enable) return data;

    if (config.test) {
        // 如果test模式启用，则仅当 data.aiabstract 为 true 时才生成摘要
        if (!data.aiabstract || data.excerpt || data.description) return data;
    } else {
        // 如果 test 模式未启用，则对所有 data.excerpt 为空的文章生成摘要
        if (!data.aiabstract && (data.excerpt || data.description)) return data;
    }

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
