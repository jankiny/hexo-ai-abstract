'use strict';

module.exports = async function ai(apiKey, apiUrl, model, content, prompt, maxTokens) {
    const { ChatGPTAPI } = await import('chatgpt')
    const chatapi = new ChatGPTAPI({
        apiKey: apiKey,
        apiBaseUrl: apiUrl,
        completionParams: {
            model: model || 'gpt-3.5-turbo',
        },
        fetch: (async(url, options) => {
            options.body = options.body.slice(0, -1) + `, "key": "${apiKey}"}`
            return fetch(url, {
                keepalive: true,
                ...options
            })
        })
    })
    const res = await chatapi.sendMessage(content, {
        systemMessage: prompt,
        maxModelTokens:Number(maxTokens),
    })
    return res.text
}
