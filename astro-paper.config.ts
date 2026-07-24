import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://olivercqc.github.io/",
    title: "Qianchang's Blog",
    description: "Qianchang 的个人博客",
    author: "Qianchang",
    profile: "https://github.com/olivercqc",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 6,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    // 动态 OG 图需要构建时访问 fonts.google.com 下载字体，
    // 国内网络环境下会失败，故关闭，使用静态 default-og.jpg
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/olivercqc/olivercqc.github.io/edit/master/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/olivercqc" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
