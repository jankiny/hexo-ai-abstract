'use strict';

const strip = require('./strip');
const ai = require('./ai');

var front = require('hexo-front-matter');
var fs = require('hexo-fs');
debugger;

let generator = async function (data) {
    var log = this.log;
    const config = this.config.hexo_ai_abstract;

    if (data.layout != 'post')
        return data;
    if (!this.config.render_drafts && data.source.startsWith("_drafts/"))
        return data;

    // Redundant check: If AI Abstract already exists
    if (data.aiAbstract && data.aiAbstract.trim() !== '') return data;

    // Ensure that config exists
    if (!config || !config.enable) return data;

    // Check if hexo_ai_abstract are enabled
    if (config.enable === 'off') return data;

    // Only continue if AI Abstract is set and empty
    if (data.aiAbstract === undefined && config.enable === 'on') return data;

    var overwrite = true;
    if (overwrite) {
        let postStr;
        // 1. parse front matter
        var tmpPost = front.parse(data.raw);
        // 2. ignore posts by Tag, Title, Attribute
        if (tmpPost.tags && tmpPost.tags.some(tag => config.ignores.byTag.includes(tag))) {
            log.info(`hexo-ai-abstract: 文章 ${data.title} 的标签包含于 ignoreTag (${config.ignores.byTag}) 列表，跳过AI摘要生成`);
            return data;
        }
        if (tmpPost.title && config.ignores.byTitle.includes(tmpPost.title)) {
            log.info(`hexo-ai-abstract: 文章 ${data.title} 的标题包含于 ignoreTitle (${config.ignores.byTitle}) 列表，跳过AI摘要生成`);
            return data;
        }
        if (config.ignores.byAttribute.some(attr => tmpPost[attr] !== undefined)) {
            log.info(`hexo-ai-abstract: 文章 ${data.title} 的属性包含于 ignoreAttribute (${config.ignores.byAttribute}) 列表 ，跳过AI摘要生成`);
            return data;
        }
        // 3. generate ai abstract
        const content = strip(data.content, config.ignoreEl);

        if (typeof content === 'string' && content.length > config.maxTokens) {
            log.info(`hexo-ai-abstract: 文章 ${data.title} 超过 maxTokens 限制`);
            return data;
        }

        var newAiAbstract = await ai(config.apiKey, config.apiUrl, config.model, content, config.prompt, config.maxTokens);
        tmpPost.aiAbstract = newAiAbstract
        // 4. process post
        postStr = front.stringify(tmpPost);
        postStr = '---\n' + postStr;
        fs.writeFile(data.full_source, postStr, 'utf-8');
        log.i(`hexo-ai-abstract: 生成文章 ${data.title} 的AI摘要`);
    }
    return data
}



module.exports = generator;