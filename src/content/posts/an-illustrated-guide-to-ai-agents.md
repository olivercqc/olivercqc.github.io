---
author: Qianchang
pubDatetime: 2026-11-24T21:00:00+08:00
title: An Illustrated Guide to AI Agents（全文阅读版）
featured: true
tags:
  - AI
  - Agent
  - LLM
  - 图解
  - 书
description: Maarten Grootendorst 与 Jay Alammar 著、O'Reilly 2026 年第一版《An Illustrated Guide to AI Agents》全文阅读版：10 章、300 余幅插图、从零搭建 TinyAgent。经授权收录，保留原书版权页。
---

本站收录了 **《An Illustrated Guide to AI Agents》** 的全文阅读版。

**[👉 打开全文阅读](/book/an-illustrated-guide-to-ai-agents/)**（自带侧栏目录，326 幅插图，支持深浅色切换与代码高亮）

## 关于原书

| 项目 | 信息 |
| --- | --- |
| 作者 | Maarten Grootendorst、Jay Alammar |
| 出版社 | O'Reilly Media, Inc. |
| 版本 | First Edition，2026 年 9 月 |
| ISBN | 979-8-341-66269-8 |
| 版权 | Copyright © 2026 Arpeggio Inc. and Maarten Pieter Grootendorst. All rights reserved. |

这是一本以**图解**为主线的 Agent 入门书：用 300 多张定制插图，把推理 LLM、记忆、工具、规划与反思、评估、多智能体协作、多模态理解、编码 Agent 这些概念一层层搭起来。它的组织方式不是按框架罗列 API，而是让读者从零开始逐步搭出一个 `TinyAgent`——每一章给这个 Agent 加一个部件，用图和 diff 说明改动带来了什么变化。

**本站为经授权收录的全文阅读版**，原书版权页、推荐语、修订历史与全部正文均原样保留，页面底部另附来源与版权标注。版权归原权利人所有。

## 章节地图

全书分十章，顺序就是 Agent 的组装顺序：

1. **Introduction to AI Agents** — 什么是一个 Agent
2. **Large Language Models** — 作为「大脑」的 LLM
3. **Reasoning Large Language Models** — 推理模型带来的变化
4. **Memory** — 让 Agent 记住什么
5. **Tools** — 工具调用与协议
6. **Planning** — 规划与反思
7. **Evaluation** — 怎么判断 Agent 做得好不好
8. **Multi-Agent Collaboration** — 多个 Agent 如何协作
9. **Multimodal Understanding** — 能看能听的 Agent
10. **Coding Agents** — 编码 Agent 与代码大模型

配套代码是作者**开源**的，十章各有一个 Notebook，可以边读边跑：

- [官方配套代码仓库](https://github.com/HandsOnLLM/An-Illustrated-Guide-To-AI-Agents)
- [O'Reilly 官方页面](https://www.oreilly.com/library/view/an-illustrated-guide/9798341662681/)
- [官方网站](https://ai-agents-book.com/)

## 阅读版做了什么

原文件是一个 29 MiB 的单页 HTML，326 幅插图全部以 base64 内嵌，另依赖三个 CDN 脚本。为了让网页版能正常打开，只做了发布层面的处理，**没有改动任何正文**：

- 326 幅插图抽成独立图片文件，字节不变；324 幅设为懒加载，首屏不必等 20 MiB 图片下载完。
- 代码高亮库改为本地副本，页面不再向外部 CDN 发请求；离线打开也能正常显示代码块。
- 原书正文不含数学公式，因此移除了未使用的 MathJax 加载器（那几处 `$` 符号只出现在配置脚本里）。
- 保留原版权页，并在页脚补充作者、出版社、ISBN 与官方链接。

页面体积从 29 MiB 降到约 0.9 MiB 的 HTML + 独立图片，侧栏目录、章节锚点、深浅色主题与 169 个代码块都保持原样。
