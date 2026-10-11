---
author: Qianchang
pubDatetime: 2026-10-11T20:35:00+08:00
title: Enterprise Agent Engineering（企业级 Agent 工程）
featured: true
tags:
  - AI
  - Agent
  - LLM
  - 工程
description: 一本写给后端工程师的企业级 Agent 工程书：13 个部分、470 个编号章节、1100+ 代码示例，从「这个问题到底需不需要 Agent」讲到可评估、可上线、可演化的完整工程判断。
---

整理了一本面向后端工程师的新书 **《Enterprise Agent Engineering / 企业级 Agent 工程》**，共 **13 个部分、470 个编号章节、1100+ 个代码示例**。它不是一份「框架使用手册」，而是从判断问题开始，一路走到可评估、可上线、可演化的工程判断。

**[👉 点击这里阅读完整正文](/book/enterprise-agent-engineering/index.html)**（自带侧栏目录，支持逐部分阅读，建议在电脑上阅读）

## 从哪里开始

全书的组织顺序就是阅读顺序——各部分之间存在明确的承接关系：

- **起步（Part 0–1）**：拿到需求先问「到底需不需要 Agent」，再把 LLM 当成一个有契约的软件组件。
- **构造输入与能力边界（Part 2–4）**：Context Engineering、Tools 与 Agent Harness、RAG 与 Memory——决定模型能看到什么、能做什么、记得住什么。
- **架构抉择与验证（Part 5–6）**：Workflow 还是 Agent；以及如何从「看起来不错」走到「有证据证明」。
- **上线与进阶（Part 7–8）**：让能跑的 Agent 变成敢上线的 Agent，以及当简单 Agent 不够用时的进阶模式。
- **专项（Part 9–11）**：Coding Agent、Multi-Agent 编排，以及让 Agent 持续变好。
- **收束（Part 12）**：把前面建立的可迁移工程判断，用到陌生领域。

已有后端经验的读者可以从 Part 1 切入，不必从 Part 0 按顺序读。

## 各部分的重点

- **Part 0 · 先别急着做 Agent**——先判断这件事到底需不需要 Agent。
- **Part 1 · 把 LLM 当成一个真正的软件组件**——调用的边界与契约。
- **Part 2 · Context Engineering**——决定模型每次决策到底能看到什么。
- **Part 3 · Tools & Agent Harness**——让模型在受控边界内与真实世界交互。
- **Part 4 · RAG & Memory**——让 Agent 获得知识，并记住真正值得记住的东西。
- **Part 5 · Workflow → Agent**——什么时候真的需要 Agent，控制权该交给谁。
- **Part 6 · Evaluation Engineering**——从「看起来不错」到「有证据证明」。
- **Part 7 · Production Agent Engineering**——让一个「能跑的 Agent」变成「敢上线的 Agent」。
- **Part 8 · Advanced Agent Patterns**——当简单 Agent 已经不够用。
- **Part 9 · Coding Agent**——让 Agent 真正参与软件开发。
- **Part 10 · Multi-Agent Engineering**——当一个 Agent 不再够用。
- **Part 11 · Agent Evolution**——让 Agent 不只是上线，而是持续变好。
- **Part 12 · Agent Application Architecture**——把工程能力迁移到陌生领域。

## 版本说明与限制

当前上线的是 **v0.4 文本校审候选版本**。已完成的是全书连贯性与一致性的机器校验（章节编号、承接标记、代码围栏配对等），**尚未经过独立学习者试用验证**，真实 Provider、生产环境与业务效果也不在本轮验证范围内。书中标注为「可选真实模型实验」的小节才会调用真实模型，主线实验使用本地 Fixture 与确定性测试即可完成。
