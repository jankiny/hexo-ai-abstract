# hexo-ai-abstract

A Hexo plugin to generate AI-based abstracts for your blog posts. Fix hexo-ai-excerpt.

## Features

 - [x] Base: AI Abstract Generation (OpenAI API)
 - [x] Ignore Files via Tags
 - [ ] Cache


## Installation

```bash
npm install hexo-ai-abstract
```

## How to use

Put `hexo_ai_abstract` config in your `hexo/_config.yml`.
```yaml
hexo_ai_abstract:
  enable: true
  test: false  # If true, an abstract will only be generated when the `aiabstract` property in the post is set to true
  apiKey: 'your_api_key'
  apiUrl: 'https://api.chatanywhere.tech/v1'
  model: 'gpt-4o-mini'
  prompt: 'You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the text delimited by triple quotes and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points. Only give me the output and nothing else. Do not wrap responses in quotes. Respond in the Chinese language.'
  ignoreEl: [
    'table', 'pre', 'figure'
  ]
  ignoreTag: [
    'about', 'encrypt'
  ]
  maxTokens: 5000
```

This plugin will upload `data.content` to the AI service to generate an abstract when you save a post without `excerpt` [Front-Matter](https://hexo.io/zh-cn/docs/front-matter).
The abstract will then be used to construct the excerpt.

The generated abstract will look like this:
```markdown
---
title: Your Post Title
tags:
  - notencrypt
aiabstract: true # Only required if test is true; otherwise, it can be omitted
excerpt: >-
  Generated Abstract.
---
```

### 1. Ignore by tag

For some personal post, e.g. encrypted posts, uploading the post's content might be undesirable. 
To address this, hexo-ai-abstract offers a feature to "Ignore Files via Tags."

You can filter out posts that you don't want to process by tagging them accordingly. 
For example:
```markdown
title: Post Title
tags:
  - secret
```
Then, in your _config.yml, you can specify the tags to ignore:
```yaml
hexo_ai_abstract:
  ignoreTag: [
    'secret', '...'
  ]
```
Any post tagged with a tag listed in ignoreTag will be skipped during the abstract generation process.

## Acknowledgement

We sincerely thank [hexo-ai-excerpt](https://github.com/rootlexme/hexo-ai-excerpt) and [hexo-ai-summaries](https://github.com/tardis-ksh/hexo-ai-summaries) for their pioneering work, which served as an inspiration for the creation of hexo-ai-abstract.

## Licence

`hexo-ai-abstract` is released under the MIT License. 
You are free to use, modify, and distribute this software under the terms of the MIT License. 
We encourage contributions and feedback to help improve the project.

