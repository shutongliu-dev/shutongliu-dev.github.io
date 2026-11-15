---
title: "从 LLM 到 Robotics Agent：Harness、后训练与具身智能"
date: 2026-11-15
lastmod: 2026-11-15
draft: false
layout: videomimic
kicker: "BLOG / EMBODIED AI"
description: "从 LLM、Agent Harness 到 Robotics Harness，讨论具身任务中的后训练、Agentic-RL 与效率问题。"
authors: "Shutong Liu"
ShowToc: true
TocOpen: true
---

## 从 LLM 到 Agent

近期来，Astra，Fable5.2等大模型涌现出来对机器人任务精细的控制能力与强大的推理、泛化能力。llm是经过scale up的模型，其具有的零样本泛化能力和上下文学习能力天然解决了目前具身模型所不充分具有的scaling带来的ICL泛化能力。当我们把具身任务视为是llm一个下游domain的时候，很多一两年前在llm和·agentic AI发展中的经验就可以被复用上来。

llm对自然语言处理的能力日益精进之后，外部工具调用、记忆框架、复杂的上下文系统管理等等让它在真实世界操作执行任务中释放出了巨大潜力，逐渐成熟为agent，以及现在被广泛提及的agent harness概念。各个基模大厂也基本都release出了自己coding agent的harness框架。coding agent不局限于coding，而是借助coding为接口，理论上可以解决发生在computer上的所有任务。随着 VLM 视觉能力不断增强，computer-use agent 逐渐发展起来，coding 与 visual 能力也在这一场景中不断成熟并形成协同。

llm的训练与其harness要适配。预训练带来foundational的先验能力之后，以harness（这里说的是llm的agent harness）为基础，在各类环境中进行RL-based的post-training带来更大收益。post-training是个资源消耗的事，实践中对时间和compute等都有很高要求。这部分当然演化出许多post-training的方法，许多核心是如何做到更efficient。个人感觉，相比于RL，sft带来的收益似乎可以被划到pre-training，middle-training中解决。

## Harness 与具身任务

将robotics任务视为基模的一个domain。天然的，我们首先希望模型有关于物理空间的先验理解（当然，它可能来自language，来自vision，来自latent representation，等等）。然后一个可以输出自然语言的model当然可以控制robotics的关节角如何变化，如何移动等等，这是自然的想法，也很早一直有工作在探索，近期o/a基模在这些任务上的出色表现给它带来更多关注。

Follow llm 2 agent的范式，我们可以给基模提供robotics的环境和工具接口让它执行任务。执行方式有不同粒度和层级各种方式，比如通过coding，比如直接调用vla policy等等，输出的目标也可以是EEF-position，action chunks等等。robotics community称为robot harness。这里其实有了两个harness的概念。我认为后者主要是在agent原有的harness上提供外部的robotics接口。也就是说，你在使用codex做robotics，你需要codex带来的工具调用、长程任务、memory、上下文压缩等等为llm带来的能力，而不只是一个chat model。而robotics-harness是针对robotics任务的，为llm agent提供的各种环境、接口、函数了。目前来看它更加外部，可以直接注入到agent的工作区。在将来，它可以被各大厂内化集成到自己的agent框架里，just 类比 现在agent自带的browser-use，computer-use等等能力。

## Harness 适配与 Agentic-RL

llm的训练要适应自己工作的环境。这就是每个模型最适配自己的harness，A模型在A-harness上RL训练，它的工具调用可能就更长，更适合完成复杂任务，换到B-harness上可能就做不到了那么多轮的工具调用和思考了。这种llm的后训练在工业界非常成熟，我们尤其对agentic-RL，这类长程任务感兴趣。因为它很具有现实和实用性，牵扯到很多奖励信号稀疏，数据采样和训练的efficient问题。

一个自然的想法是，在具身仿真环境中，对基模做后训练，以提高基模在robotics任务上的效果。这里有几篇工作已经做了类似事情。分别是 CaP-X、AgenticRoboRL，以及近期 HanSong 老师组的 Training Reasoning Models in Simulation to Natively Use Real Robots。

<div class="vm-resource-links" aria-label="Paper links">
  <span class="vm-resource-links-title">Links</span>
  <a href="https://capgym.github.io/" target="_blank" rel="noopener"><span class="vm-resource-link-label">CaP-X</span><span class="vm-resource-link-url">https://capgym.github.io/</span></a>
  <a href="https://xinxinliu-ai.github.io/AgenticRoboRL/" target="_blank" rel="noopener"><span class="vm-resource-link-label">AgenticRoboRL</span><span class="vm-resource-link-url">https://xinxinliu-ai.github.io/AgenticRoboRL/</span></a>
  <a href="https://mit-han-lab.github.io/pear-blog/" target="_blank" rel="noopener"><span class="vm-resource-link-label">PEAR</span><span class="vm-resource-link-url">https://mit-han-lab.github.io/pear-blog/</span></a>
</div>

## 三篇 Post-training 工作

### CaP-X：Code-as-Policy 的 RL post-training

<div class="vm-resource-links" aria-label="CaP-X links">
  <span class="vm-resource-links-title">Links</span>
  <a href="https://capgym.github.io/" target="_blank" rel="noopener"><span class="vm-resource-link-label">Project</span><span class="vm-resource-link-url">https://capgym.github.io/</span></a>
</div>

CaP-X 的 RL 闭环比较直接：Qwen2.5-Coder-7B 生成机器人控制代码，CaP-Gym 执行代码并返回任务是否完成的环境奖励，CaP-RL 再用 GRPO 更新模型。训练的 action 不是关节角，而是可执行的 Python 程序；因此每次 rollout 都包含 code generation、execution 和 environment feedback。

作者主要使用 privileged state-based API 做训练，先减少视觉和控制噪声，让 reward 更容易归因，再把模型放到更复杂的 API 和真实机器人上测试。官方结果显示，模型在仿真中的平均成功率从 20% 提升到 72%，在真实 Franka 机器人上，cube lifting 和 cube stacking 分别达到 84% 和 76%。这说明 RL 优化的是代码里的操作顺序、工具调用和几何计算，而不是一个单独的低层 policy。

### AgenticRoboRL：把 Coding Agent post-training 迁移到 Robotics Harness

<div class="vm-resource-links" aria-label="AgenticRoboRL links">
  <span class="vm-resource-links-title">Links</span>
  <a href="https://xinxinliu-ai.github.io/AgenticRoboRL/" target="_blank" rel="noopener"><span class="vm-resource-link-label">Project</span><span class="vm-resource-link-url">https://xinxinliu-ai.github.io/AgenticRoboRL/</span></a>
  <a href="https://arxiv.org/abs/2610.28589" target="_blank" rel="noopener"><span class="vm-resource-link-label">Paper</span><span class="vm-resource-link-url">https://arxiv.org/abs/2610.28589</span></a>
</div>

AgenticRoboRL 的重点是把不同 harness 的 rollout 接到同一套 RL 训练里。RPent 的 planner 通过 tool call 调用冻结的 VLA skill，CaP-X 的 planner 生成控制代码，但训练时都由 proxy 记录每次 model call 的 prompt、token 和 log-probability，再由 adapter 把它们和 episode 的最终结果对齐。

训练分成 SFT 和 multi-turn RL 两步。SFT 先提供成功轨迹作为 cold start；进入 RL 后，同一个 group 使用相同 task 和 initial state，通过不同采样得到多条 episode，再用 terminal success reward 计算 leave-one-out advantage，更新 episode 中被选中的模型响应。这样不需要额外的 value model，也不需要改动 VLA、motion tool 或 code executor。

在 LIBERO-PRO 上，9B planner 从 18.1% 提升到 71.0%，而且不使用 external memory。这里真正值得关注的是，RL 的训练单位不是某个底层动作，而是长程 episode 中的一系列模型调用；harness 只负责提供 rollout 和 outcome，planner 才是被优化的对象。

### Training Reasoning Models in Simulation to Natively Use Real Robots：Robot-use RL

<div class="vm-resource-links" aria-label="PEAR links">
  <span class="vm-resource-links-title">Links</span>
  <a href="https://mit-han-lab.github.io/pear-blog/" target="_blank" rel="noopener"><span class="vm-resource-link-label">Project</span><span class="vm-resource-link-url">https://mit-han-lab.github.io/pear-blog/</span></a>
  <a href="https://mit-han-lab.github.io/pear-blog/paper.pdf" target="_blank" rel="noopener"><span class="vm-resource-link-label">Paper</span><span class="vm-resource-link-url">https://mit-han-lab.github.io/pear-blog/paper.pdf</span></a>
  <a href="https://github.com/mit-han-lab/pear" target="_blank" rel="noopener"><span class="vm-resource-link-label">Code</span><span class="vm-resource-link-url">https://github.com/mit-han-lab/pear</span></a>
</div>

PEAR 采用 Robot-use RL：模型观察相机图像和机器人状态，输出下一步 end-effector pose，IK 和 controller 执行动作，再把新的 observation 加回 context。每个 episode 是多轮 observe、reason、act、execute，最终 reward 只有 task success 或 failure。

它不使用 demonstrations，Qwen3.8-27B 直接在仿真中做 GRPO。一个 group 内的 rollout 共享 task 和 initial state，使用 episode-level binary reward 计算 group-normalized advantage；如果一个 group 全部成功或全部失败，就过滤掉重新采样。由于 base model 在复杂任务上的初始成功率接近零，作者再用 curriculum 先训练有学习信号的 LIBERO 任务，再加入 LIBERO-Long 和 RoboDojo。

LIBERO 上的成功率从 1.6% 提升到 74.4%，在没有真实机器人训练数据的情况下，真实双臂机器人上达到 60%。PEAR 还把 long-context rollout、prefix cache、异步采样和动态 sampling 放进训练系统里，因为这里真正消耗资源的不是单轮更新，而是长程 episode 的反复 rollout。它展示的是一种直接用最终任务 reward 训练 reasoning model 学会 robot-use 的路径。

## 从大模型到小模型

小模型，比如qwen8B这种学校lab的常见配置，可以看到它实际效果很差，基本在有限时间内一个任务都无法完成。这时候有一些方法，比如给它一些sft的提升，在一些工作上我们也看到了这种提升。然后可以再做RL探索。

## Efficient 的问题

还有更多问题围绕着这部分的efficient。就比如冷启动，上面聊到了sft，但是sft是否一定有必要做，可以看hansong组新发的paper。再比如数据sample的问题。我们面对一个非常复杂而长程的agent任务。

再比如reward问题。仿真环境一般常见的是二值的reward（表示任务是否做成）。当然可以考虑一些工作，去给出更细粒度的reward，以及去更细粒度的分配奖励信号到每条轨迹的token-level，修改GRPO-BASED的算法鼓励模型探索等等。总之工业界会很快给出scaling up的方式，到时候很多目前学界的harness工作就会直接内化到大厂的model自身的能力以及配套harness上。

## 理论问题

这方面一个重要的理论问题是，模型做robotics任务到底需要什么能力。这些能力在先验的时候是否已经有了，RL又带来了什么。让我们不禁想到huanggao老师组的关于RLVR的讨论。那篇ICML best paper。例如，RL对于更好的物理理解，更合适的写code，等等，以及RL是否能显示的控制思维链长度以减少inference时间，进而缩短延迟等等。
