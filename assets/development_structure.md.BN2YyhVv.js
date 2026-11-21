import{_ as a,o as n,c as p,a2 as e}from"./chunks/framework.DMvgf4hZ.js";const m=JSON.parse('{"title":"项目结构","description":"","frontmatter":{},"headers":[],"relativePath":"development/structure.md","filePath":"development/structure.md","lastUpdated":1794745517000}'),l={name:"development/structure.md"};function c(t,s,i,o,d,r){return n(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="项目结构" tabindex="-1">项目结构 <a class="header-anchor" href="#项目结构" aria-label="Permalink to &quot;项目结构&quot;">​</a></h1><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>apps/</span></span>
<span class="line"><span>  web/                 Vue 页面、设置、工作区与画布</span></span>
<span class="line"><span>  server/              业务接口与 Agent 运行时，桌面共享此服务</span></span>
<span class="line"><span>  desktop/             Electrobun 入口、构建脚本与安装器</span></span>
<span class="line"><span>  updateServer/        独立更新文件服务器与发布脚本</span></span>
<span class="line"><span>packages/</span></span>
<span class="line"><span>  assets/              共享图片与图标</span></span>
<span class="line"><span>  i18n/                多语言字典、运行时与文案抽取</span></span>
<span class="line"><span>  nodes/               内置画布节点</span></span>
<span class="line"><span>  nodeScaffold/        节点开发脚手架与运行时</span></span>
<span class="line"><span>  tools/               Agent 工具插件</span></span>
<span class="line"><span>  toolScaffold/        工具开发脚手架与运行时</span></span>
<span class="line"><span>  providers/           文本与媒体模型提供方</span></span>
<span class="line"><span>  skills/              Markdown 技能及附属资料</span></span>
<span class="line"><span>  mcp/                 MCP 服务与协议适配</span></span>
<span class="line"><span>  ffmpeg/              FFmpeg 能力</span></span>
<span class="line"><span>  startup/             原生启动窗口与动画</span></span>
<span class="line"><span>docs/                  项目介绍译版、开发文档与图片</span></span>
<span class="line"><span>docs-site/             文档站（VitePress）源码</span></span>
<span class="line"><span>build/                 构建产物</span></span>
<span class="line"><span>data/                  本机运行数据，不提交到仓库</span></span></code></pre></div><h2 id="文档目录约定" tabindex="-1">文档目录约定 <a class="header-anchor" href="#文档目录约定" aria-label="Permalink to &quot;文档目录约定&quot;">​</a></h2><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>docs/</span></span>
<span class="line"><span>  readme.md          文档目录入口</span></span>
<span class="line"><span>  development.md     开发与扩展指南</span></span>
<span class="line"><span>  readme/            各语言项目介绍</span></span>
<span class="line"><span>  images/            标识、认证与社区图片</span></span>
<span class="line"><span>    screenshots/     产品截图</span></span>
<span class="line"><span>    sponsors/        赞助商图片</span></span>
<span class="line"><span>    tutorial/        使用教程配图（文档站引用）</span></span>
<span class="line"><span>docs-site/</span></span>
<span class="line"><span>  .vitepress/        站点配置与侧边栏</span></span>
<span class="line"><span>  guide/             使用教程</span></span>
<span class="line"><span>  development/       开发文档</span></span>
<span class="line"><span>  deploy/            部署运维</span></span></code></pre></div><p>各子包的实现与维护说明保留在对应 <code>packages/</code> 目录。更新项目介绍时，以根目录 <code>README.md</code> 为准同步其余二十份译版；图片统一复用 <code>docs/images/</code>，移动文件时同时更新 Markdown 和 HTML 中的相对链接。</p><p>文档站的静态资源直接复用 <code>docs/images/</code>（VitePress 的 <code>publicDir</code> 指向 <code>docs/</code>，站点内以 <code>/images/...</code> 引用），因此新增配图只需放入 <code>docs/images/</code>，无需在 <code>docs-site/</code> 下重复一份。</p>`,6)])])}const h=a(l,[["render",c]]);export{m as __pageData,h as default};
