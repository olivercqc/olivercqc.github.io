---
author: Qianchang
pubDatetime: 2026-07-28T12:30:00+08:00
title: 从零成为 AI 工程师
featured: true
tags:
  - AI
  - LLM
  - Agent
description: 一份从零基础讲到生产级 AI 系统的训练营手册：5 大部分、23 章正课、2 个选修专题与 8 个附录（A–H），覆盖 LLM 调用、RAG、Agent、生产化运维到完整 SaaS 项目，并强化目标读者一致性与工程基础桥梁。
---

整理了一份完整的 AI 工程师训练营手册，从零基础一路讲到生产级 AI 系统，共 **5 个部分、23 章正课**，外加 **2 个选修专题** 和 **8 个附录（A–H）**，配有近 30 张架构图、130+ 个代码示例与 60+ 张表格。

**[👉 点击这里阅读完整手册](/handbook/ai-engineer-handbook.html)**（自带侧边目录，建议在电脑上阅读）

## 内容概览

### Part 1 · LLM 应用基础（第 1–4 章）

大模型为什么有长度、随机性和事实边界；第一次 API 调用、可复用 Prompt 与经过校验的结构化输出。

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

涵盖多供应商 API 兼容矩阵与迁移检查、**AI 工程基础桥梁课程**、Single/Multi-Agent 决策树、Agent 轨迹评测模板、多模态与 Browser Agent 进阶挑战、从项目到简历与面试，以及一份按**不同背景读者的路线导航与能力里程碑**，和**时效表与参考资料**。

## 本次修订要点

- **Part 2 / Part 3 深度补强**：RAG、Evaluation 与 Agent 工程（Tool Calling / MCP / State / Memory / Context / Harness / Loop）等内容进行了系统性强化，并补全了大量示例与图示。
- **全文审阅勘误修复**：对表述、代码示例与交叉链接做了多轮校对与修正，提升可读性与可运行性。
- **体系保持稳定**：延续 5 大部分、23 章正课、2 个选修专题与 8 个附录（A–H）的结构；目标读者一致性与工程基础桥梁的设计继续保留。

## 适合谁读

- **转行者**：第 0 章讲清岗位全貌，附录 G 给出不同背景的路线导航
- **软件工程师**：可跳过基础部分，直接从 Part 1 的 LLM 原理切入
- **已入门的 AI 应用开发者**：Part 3 之后的 Agent 工程与生产化内容是重点

手册中的示例统一从环境变量读取模型配置，不绑定特定厂商；本版于 **2026-08-05** 核验过 API 与框架版本时效性。
