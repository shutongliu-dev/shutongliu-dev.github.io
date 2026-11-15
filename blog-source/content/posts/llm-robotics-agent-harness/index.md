---
title: "llm4robotics"
date: 2026-11-15
lastmod: 2026-11-15
draft: false
layout: videomimic
kicker: "BLOG / EMBODIED AI"
subtitle: "post-training in harness"
description: "从 LLM、Agent Harness 到 Robotics Harness，讨论具身任务中的后训练、Agentic-RL 与效率问题。"
authors: "Shutong Liu"
ShowToc: true
TocOpen: true
---

## 从 LLM 到 Agent

近期来，Astra，Fable5.2等大模型涌现出来对机器人任务精细的控制能力与强大的推理、泛化能力。llm是经过scale up的模型，其具有的零样本泛化能力和上下文学习能力天然解决了目前具身模型所不充分具有的scaling带来的ICL泛化能力。当我们把具身任务视为是llm一个下游domain的时候，很多一两年前在llm和·agentic AI发展中的经验就可以被复用上来。

llm对自然语言处理的能力日益精进之后，外部工具调用、记忆框架、复杂的上下文系统管理等等让它在真实世界操作执行任务中释放出了巨大潜力，逐渐成熟为agent，以及现在被广泛提及的agent harness概念。各个基模大厂也基本都release出了自己coding agent的harness框架。coding agent不局限于coding，而是借助coding为接口，理论上可以解决发生在computer上的所有任务。随着 VLM 视觉能力不断增强，computer-use agent 逐渐发展起来，coding 与 visual 能力也在这一场景中不断成熟并形成协同。

llm的训练与其harness要适配。预训练带来foundational的先验能力之后，以harness（这里说的是llm的agent harness）为基础，在各类环境中进行RL-based的post-training带来更大收益。post-training是个资源消耗的事，实践中对时间和compute等都有很高要求。这部分当然演化出许多post-training的方法，许多核心是如何做到更efficient。个人感觉，相比于RL，sft带来的收益似乎可以被划到pre-training，middle-training中解决。

## llm4robotics

将robotics任务视为基模的一个domain。天然的，我们首先希望模型有关于物理空间的先验理解（当然，它可能来自language，来自vision，来自latent representation，等等）。然后一个可以输出自然语言的model当然可以控制robotics的关节角如何变化，如何移动等等，这是自然的想法，也很早一直有工作在探索，近期o/a基模在这些任务上的出色表现给它带来更多关注。

Follow llm 2 agent的范式，我们可以给基模提供robotics的环境和工具接口让它执行任务。执行方式有不同粒度和层级各种方式，比如通过coding，比如直接调用vla policy等等，输出的目标也可以是EEF-position，action chunks等等。robotics community称为robot harness。这里其实有了两个harness的概念。我认为后者主要是在agent原有的harness上提供外部的robotics接口。也就是说，你在使用codex做robotics，你需要codex带来的工具调用、长程任务、memory、上下文压缩等等为llm带来的能力，而不只是一个chat model。而robotics-harness是针对robotics任务的，为llm agent提供的各种环境、接口、函数了。目前来看它更加外部，可以直接注入到agent的工作区。在将来，它可以被各大厂内化集成到自己的agent框架里，just 类比 现在agent自带的browser-use，computer-use等等能力。

## Post-Training 4 Robotics

llm的训练要适应自己工作的环境。这就是每个模型最适配自己的harness，A模型在A-harness上RL训练，它的工具调用可能就更长，更适合完成复杂任务，换到B-harness上可能就做不到了那么多轮的工具调用和思考了。这种llm的后训练在工业界非常成熟，我们尤其对agentic-RL，这类长程任务感兴趣。因为它很具有现实和实用性，牵扯到很多奖励信号稀疏，数据采样和训练的efficient问题。

一个自然的想法是，在具身仿真环境中，对基模做后训练，以提高基模在robotics任务上的效果。这里有几篇工作已经做了类似事情。分别是 CaP-X、AgenticRoboRL，以及近期 HanSong 老师组的 Training Reasoning Models in Simulation to Natively Use Real Robots。

<div class="vm-resource-links" aria-label="Paper links">
  <span class="vm-resource-links-title">Links</span>
  <a href="https://capgym.github.io/" target="_blank" rel="noopener"><span class="vm-resource-link-label">CaP-X</span><span class="vm-resource-link-url">https://capgym.github.io/</span></a>
  <a href="https://xinxinliu-ai.github.io/AgenticRoboRL/" target="_blank" rel="noopener"><span class="vm-resource-link-label">AgenticRoboRL</span><span class="vm-resource-link-url">https://xinxinliu-ai.github.io/AgenticRoboRL/</span></a>
  <a href="https://mit-han-lab.github.io/pear-blog/" target="_blank" rel="noopener"><span class="vm-resource-link-label">PEAR</span><span class="vm-resource-link-url">https://mit-han-lab.github.io/pear-blog/</span></a>
</div>

## Related Work：LLM Post-training for Robotics

### CaP-X：Code-as-Policy 的 RL post-training

<div class="vm-resource-links" aria-label="CaP-X links">
  <span class="vm-resource-links-title">Links</span>
  <a href="https://capgym.github.io/" target="_blank" rel="noopener"><span class="vm-resource-link-label">Project</span><span class="vm-resource-link-url">https://capgym.github.io/</span></a>
</div>

{{< figure src="https://raw.githubusercontent.com/shutongliu-dev/shutongliu-dev.github.io/main/assets/images/blog/capx-overview.png" alt="CaP-Agent0 overview showing parallel coding agents, generated robot code, visual feedback, and the robot environment" caption="CaP-Agent0 and the code execution loop used by CaP-X." >}}

CaP-X 的 RL 闭环比较直接：Qwen2.5-Coder-7B 生成机器人控制代码，CaP-Gym 执行代码并返回任务是否完成的环境奖励，CaP-RL 再用 GRPO 更新模型。训练的 action 不是关节角，而是可执行的 Python 程序；因此每次 rollout 都包含 code generation、execution 和 environment feedback。

作者在 RL 训练阶段主要使用 privileged state-based API。这个 API 直接从仿真器提供物体的真实位置、姿态和 mask，模型不需要先从 RGB-D 图像中做视觉估计，因此可以先排除感知误差和控制误差的干扰，让任务 reward 更容易归因。这里的 privileged information 只用于训练；训练完成后，模型还要在带有真实感知噪声的 API 和真实机器人上测试。官方结果显示，模型在仿真中的平均成功率从 20% 提升到 72%，在真实 Franka 机器人上，cube lifting 和 cube stacking 分别达到 84% 和 76%。这说明 RL 优化的是代码里的操作顺序、工具调用和几何计算，而不是一个单独的低层 policy。

### AgenticRoboRL：把 Coding Agent post-training 迁移到 Robotics Harness

<div class="vm-resource-links" aria-label="AgenticRoboRL links">
  <span class="vm-resource-links-title">Links</span>
  <a href="https://xinxinliu-ai.github.io/AgenticRoboRL/" target="_blank" rel="noopener"><span class="vm-resource-link-label">Project</span><span class="vm-resource-link-url">https://xinxinliu-ai.github.io/AgenticRoboRL/</span></a>
  <a href="https://arxiv.org/abs/2610.28589" target="_blank" rel="noopener"><span class="vm-resource-link-label">Paper</span><span class="vm-resource-link-url">https://arxiv.org/abs/2610.28589</span></a>
</div>

{{< figure src="https://raw.githubusercontent.com/shutongliu-dev/shutongliu-dev.github.io/main/assets/images/blog/agenticroborl-overview.png" alt="AgenticRoboRL overview showing a robot planner, robot harness, SFT, planner rollouts, and LIBERO-PRO results" caption="AgenticRoboRL: planner post-training across robot harnesses." >}}

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

{{< figure src="https://raw.githubusercontent.com/shutongliu-dev/shutongliu-dev.github.io/main/assets/images/blog/pear-overview.png" alt="PEAR overview showing robot-use RL in simulation, reward training, and real-world deployment" caption="PEAR: robot-use RL in simulation and transfer to a real robot." >}}

PEAR 采用 Robot-use RL：模型观察相机图像和机器人状态，输出下一步 end-effector pose，IK 和 controller 执行动作，再把新的 observation 加回 context。每个 episode 是多轮 observe、reason、act、execute，最终 reward 只有 task success 或 failure。

它不使用 demonstrations，Qwen3.8-27B 直接在仿真中做 GRPO。一个 group 内的 rollout 共享 task 和 initial state，使用 episode-level binary reward 计算 group-normalized advantage；如果一个 group 全部成功或全部失败，就过滤掉重新采样。由于 base model 在复杂任务上的初始成功率接近零，作者再用 curriculum 先训练有学习信号的 LIBERO 任务，再加入 LIBERO-Long 和 RoboDojo。

LIBERO 上的成功率从 1.6% 提升到 74.4%，在没有真实机器人训练数据的情况下，真实双臂机器人上达到 60%。但需要强调的是，这些 pure RL 效果建立在很高的 compute cost 上，论文报告训练总量约为 50,000 H100-equivalent GPU-hours。PEAR 还把 long-context rollout、prefix cache、异步采样和动态 sampling 放进训练系统里，因为这里真正消耗资源的不是单轮更新，而是长程 episode 的反复 rollout。它展示的是一种直接用最终任务 reward 训练 reasoning model 学会 robot-use 的路径。

## What's Next

小模型，比如 Qwenvl 的 8-9B 这种学校 lab 的常见配置，直接做仿真任务效果是很差的，基本有限时间内一个任务都无法完成。这时 SFT 在这种 cold start 阶段起到作用，让模型先学会基本的工具调用和操作顺序，再进入 RL 探索。但 PEAR 也说明，SFT 不是绝对前提：如果模型本身有足够强的 reasoning、coding 和视觉先验，配合 curriculum，RL 可以从接近零的成功率开始获得有效信号。后者需要更大的模型、更精心的任务选择和更高的 compute。

一些仍然值得关注的问题：

1. efficiency。一个完整的 robotics agent episode 可能包含几十轮图像、推理、tool call 和环境执行，采样成本远高于普通的单轮 RL。未来需要同时做 task selection、curriculum、parallel rollout、trajectory reuse 和 long-context cache。真正的 scaling 也不只是把模型参数做大，还包括每个模型能看到多少环境、产生多少次尝试，以及这些尝试能否稳定转化成训练信号。另一方面，通过 RL 训练本身也有可能帮助模型以更短的思维链完成任务，可以在 reward 中进行设计，带给我们一条让 LLM 更低延迟控制 robotics 的路线。

2. reward 和 credit assignment。仿真环境中最常见的是最终 task success 的 binary reward 这种 RLVR 的范式，但一条失败轨迹里可能包含正确的视觉理解、正确的规划和一次失败的控制动作。如果把同一个 advantage 平均给所有 reasoning token、action token 和不同交互轮次，学习信号会非常粗糙。更细粒度的 subtask reward、process reward 和 token-level credit assignment 都值得探索，也需要区分 reasoning token 和 action token 在失败中的责任。agentic-RL 算法要解决的一个重点，是如何让稀疏的环境结果正确地回到长程轨迹中的关键决策。

3. 一些理论问题。模型做 robotics 到底需要什么能力。物理理解、空间推理这些能力有多少已经存在于 foundation model，RL 在激活一些 foundation model 已有的能力之外，又带来了什么，如何做到合适 post-training 的配比，确保不损伤 foundation model 主干能力。

站在工业界的角度，针对 robotics 任务的 post-training scaling 是一件很值得做的事情。仿真环境天然提供了丰富且合适的 environment 和 reward，支撑着大规模可并行的 RL 探索。这部分 post-training 不仅是针对 model 本身的，相信会让 model 和其 harness 充分适配，在环境中不断强化自身。我们过往出色地解决了 coding、数学证明、computer-use 等等，期待在 robotics 上，我们过往的经验和崭新的知识与场景也会协同起来绽放硕果。
