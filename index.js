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
    try {
        // Ensure that config exists
        if (!config || !config.enable) return data;

        // Check if summaries are enabled
        if (config.enable === 'off') return data;

        // Redundant check: If AI Abstract already exists
        if (data.aiAbstract && data.aiAbstract.trim() !== '') return data;

        // Only continue if AI Abstract is set and empty
        if (!data.aiAbstract && config.enable === 'on')  return data;

        const path = this.source_dir + data.source;
        const frontMatterString = await fs.readFile(path);
        const frontMatter = fm.parse(frontMatterString);

        if (frontMatter.tags && frontMatter.tags.some(tag => config.ignores.byTag.includes(tag))) {
            log.info(`hexo-ai-abstract: 文章 ${data.title} 的标签包含于 ignoreTag (${config.ignores.byTag}) 列表，跳过AI摘要生成`);
            return data;
        }
        if (frontMatter.title && config.ignores.byTitle.includes(frontMatter.title)) {
            log.info(`hexo-ai-abstract: 文章 ${data.title} 的标题包含于 ignoreTitle (${config.ignores.byTitle}) 列表，跳过AI摘要生成`);
            return data;
        }
        if (config.ignores.byAttribute.some(attr => frontMatter[attr] !== undefined)) {
            log.info(`hexo-ai-abstract: 文章 ${data.title} 的属性包含于 ignoreAttribute (${config.ignores.byAttribute}) 列表 ，跳过AI摘要生成`);
            return data;
        }

        const content = strip(data.content, config.ignoreEl);

        if (typeof content === 'string' && content.length > config.maxTokens) {
            log.info(`hexo-ai-abstract: 文章 ${data.title} 超过 maxTokens 限制`);
            return data;
        }

        log.info(`hexo-ai-abstract: 生成文章 ${data.title} 的AI摘要`);
        frontMatter.aiAbstract = data.aiAbstract = await ai(config.apiKey, config.apiUrl, config.model, content, config.prompt, config.maxTokens);
        await fs.writeFile(path, `---\n${fm.stringify(frontMatter)}`);

        return data;
    } catch (error) {
        log.error(`hexo-ai-abstract: 处理文章 ${data.title} 时出错: ${error.message}`);
        return data;
    }
});

hexo.extend.filter.register('before_post_render', function (data) {
    try {
        if (!data.aiAbstract || data.aiAbstract.trim() === '') return data;

        const aiAbstractContent = '**AI导读：**' + data.aiAbstract;
        const newContent = config.inject.front ? `\n\n${aiAbstractContent}\n\n${config.inject.anchor}` : `${config.inject.anchor}\n\n${aiAbstractContent}\n\n`

        if (typeof data.content === 'string') {
            const anchorPattern = new RegExp(escapeRegExp(config.inject.anchor), 'g');
            data.content = data.content.replace(anchorPattern, newContent);
            // log.info(data.content);
        }
        return data;
    } catch (error) {
        log.error(`hexo-ai-abstract: 处理文章 ${data.title} 前渲染时出错: ${error.message}`);
        return data;
    }
});

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

