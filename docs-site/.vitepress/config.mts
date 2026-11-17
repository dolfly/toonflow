import { defineConfig } from 'vitepress'

const repo = 'toonflow'
const owner = 'dolfly'

/**
 * GitHub Pages 项目站点默认部署在 https://<owner>.github.io/<repo>/，
 * 本地预览或部署到根域名时可用 DOCS_BASE=/ 覆盖。
 */
const base = process.env.DOCS_BASE || `/${repo}/`

export default defineConfig({
  lang: 'zh-CN',
  title: 'Toonflow',
  description: '开源 AI 短剧、漫剧与视频创作平台的使用教程、开发文档与部署运维手册',
  base,
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: `${base}logo.png` }],
    ['meta', { name: 'theme-color', content: '#0f172a' }],
  ],
  // 本目录的 README.md 是仓库内的开发者说明，不进公开站点。
  srcExclude: ['README.md'],
  appearance: true,
  lastUpdated: true,
  cleanUrls: false,
  // 仓库根目录的 postcss.config.ts 面向业务前端，文档站不需要，
  // 用内联空配置阻止 Vite 向上回退搜索（否则会要求 ts-node）。
  vite: {
    css: {
      postcss: {},
    },
  },
  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'Toonflow 文档',
    nav: [
      { text: '首页', link: '/' },
      { text: '使用教程', link: '/guide/', activeMatch: '^/guide/' },
      { text: '开发文档', link: '/development/', activeMatch: '^/development/' },
      { text: '插件开发', link: '/plugins/', activeMatch: '^/plugins/' },
      { text: '部署运维', link: '/deploy/', activeMatch: '^/deploy/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '使用教程',
          items: [
            { text: '新手入门', link: '/guide/' },
            { text: '下载与安装', link: '/guide/install' },
          ],
        },
        {
          text: '无限画布',
          items: [
            { text: '项目、画布与节点', link: '/guide/canvas' },
            { text: '素材库与 3D 导演台', link: '/guide/tools' },
            { text: '视频合成', link: '/guide/video' },
          ],
        },
        {
          text: '扩展与助手',
          items: [
            { text: '插件市场', link: '/guide/plugin-market' },
            { text: 'Agent 助手', link: '/guide/agent' },
          ],
        },
      ],
      '/development/': [
        {
          text: '开发文档',
          items: [
            { text: '开发与扩展概览', link: '/development/' },
            { text: '本地开发与构建', link: '/development/setup' },
          ],
        },
        {
          text: '扩展开发',
          items: [
            { text: '插件、技能与提供方', link: '/development/plugins' },
            { text: '多语言维护', link: '/development/i18n' },
            { text: '桌面构建与打包', link: '/development/desktop' },
          ],
        },
        {
          text: '参考',
          items: [{ text: '项目结构', link: '/development/structure' }],
        },
      ],
      '/plugins/': [
        {
          text: '插件开发',
          items: [{ text: '插件开发总览', link: '/plugins/' }],
        },
        {
          text: '扩展类型',
          items: [
            { text: '01 · 开发总览', link: '/plugins/overview' },
            { text: '02 · Tools 工具插件', link: '/plugins/tools' },
            { text: '03 · Nodes 节点插件', link: '/plugins/nodes' },
            { text: '04 · Skill 技能插件', link: '/plugins/skill' },
            { text: '05 · A2A Teams（未开放）', link: '/plugins/teams' },
          ],
        },
        {
          text: '交付与发布',
          items: [
            { text: '06 · 交付前检查', link: '/plugins/checklist' },
            { text: '07 · 发布插件', link: '/plugins/publish' },
          ],
        },
      ],
      '/deploy/': [
        {
          text: '部署运维',
          items: [
            { text: '服务端部署', link: '/deploy/' },
            { text: '版本发布与 CI', link: '/deploy/release' },
            { text: '客户端更新与增量发布', link: '/deploy/updates' },
          ],
        },
      ],
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'short', timeStyle: 'short' },
    },
    editLink: {
      pattern: `https://github.com/${owner}/${repo}/edit/master/docs-site/:path`,
      text: '在 GitHub 上编辑此页',
    },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: `https://github.com/${owner}/${repo}` }],
    footer: {
      message: '基于 MIT 许可证发布 · 文档站由 VitePress 构建并部署到 GitHub Pages',
      copyright: 'Copyright © 2026 北京爱阿科技有限公司',
    },
  },
})
