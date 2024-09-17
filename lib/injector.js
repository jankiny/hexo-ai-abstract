'use strict';

debugger;
let injector = function (data) {
    var log = this.log;
    try {
        const config = this.config.hexo_ai_abstract;

        if (!data.aiAbstract || data.aiAbstract.trim() === '') return data;

        const aiAbstractContent = '**AI导读：**' + data.aiAbstract;
        const newContent = config.inject.front ? `\n\n${aiAbstractContent}\n\n${config.inject.anchor}` : `${config.inject.anchor}\n\n${aiAbstractContent}\n\n`

        if (typeof data.content === 'string') {
            const anchorPattern = new RegExp(escapeRegExp(config.inject.anchor), 'g');
            data.content = data.content.replace(anchorPattern, newContent);
            // log.info(data.content);
        }

        // log.i(`hexo-ai-abstract: 文章 ${data.title} 的AI摘要已注入 ${config.inject.anchor} ${config.inject.front ? '前' : '后'}`);
        return data;
    } catch (error) {
        log.e(`hexo-ai-abstract: 在 injector 文章 ${data.title} 时出错: ${error.message}`);
        return data;
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = injector;