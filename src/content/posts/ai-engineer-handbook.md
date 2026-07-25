---
author: Qianchang
pubDatetime: 2026-07-25T12:30:00+08:00
title: 从零成为 AI 工程师 · 完整训练营（教学闭环修订版）
featured: true
tags:
  - AI
  - LLM
  - Agent
description: 一份 23 章正课 + 选修专题 + 附录的 AI 工程师训练营手册：从 LLM 调用基础到 RAG、Agent、生产化运维，最后完成一个完整的 SaaS 项目，并配套教学闭环（练习—反馈—复盘）。
---

整理了一份完整的 AI 工程师训练营手册，从零基础一路讲到生产级 AI 系统，共 **5 个部分、23 章正课**，外加 **2 个选修专题** 和 **7 个附录**，配有近 30 张架构图、130+ 个代码示例与 50+ 张表格。

**[👉 点击这里阅读完整手册](/handbook/ai-engineer-handbook.html)**（自带侧边目录，建议在电脑上阅读）

## 内容概览

### Part 1 · LLM 应用基础（第 1–4 章）

Token、上下文与采样原理；稳定调用模型 API；Prompt 与任务模板；Structured Output——让模型输出真正进入软件系统。

### Part 2 · AI Application Engineer（第 5–8 章）

Embedding 与语义检索；RAG 基础与进阶（混合检索、重排、数据血缘）；Evaluation——从指标到回归门禁。

### Part 3 · Agent Engineer（第 9–15 章）

Agent 认知循环与规划、Tool Calling、MCP 标准化接入、State 与 Memory、Context Engineering、Harness Engineering（权限与护栏）、Loop Engineering（自主迭代与恢复）。

### Part 4 · Production AI Engineer（第 16–20 章）

后端架构（API、队列、持久化）、LLMOps、监控与可观测性、安全与治理（提示注入、审计）、成本与性能优化。

### Part 5 · AI Product（第 21–23 章）

Multi-Agent 编排、AI Coding Agent 长期编码任务工程，以及压轴的完整 SaaS 项目——AI Document Intelligence。

## 选修专题（按需深入）

- **专题 A · 模型适配**：微调、LoRA 与评估部署，让通用模型贴合你的业务。
- **专题 B · 自托管推理**：vLLM、量化与基准测试，掌握自有算力的落地路径。

## 附录（速查与进阶）

基础速查表、Single/Multi-Agent 决策树、Agent 轨迹评测模板、多模态与 Browser Agent 进阶挑战、从项目到简历与面试，以及一份 **20 周快速转行计划**。

## 适合谁读

- **转行者**：第 0 章提供岗位路线图与环境搭建，还有工程基础速成章节
- **软件工程师**：可跳过基础部分，直接从 Part 1 的 LLM 原理切入
- **已入门的 AI 应用开发者**：Part 3 之后的 Agent 工程与生产化内容是重点

手册中的示例统一从环境变量读取模型配置，不绑定特定厂商；本修订版于 **2026-07-25** 核验过 API 与框架版本时效性，并在各章嵌入「教学闭环」——练习、反馈与复盘，帮助把知识真正用起来。
