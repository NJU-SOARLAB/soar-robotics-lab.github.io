---
layout: page
permalink: /zh/open-source/
title: 开源
description: SOARLAB 的开源项目、论文代码和研究工具。
nav: true
nav_order: 4
lang: zh
translation_url: /open-source/
---

<div class="soar-open-hero">
  <img src="{{ '/assets/img/soarlab-256.png' | relative_url }}" alt="SOARLAB logo">
  <div>
    <p class="soar-eyebrow">Open systems for flying general intelligence</p>
    <h1>开源项目</h1>
    <p>SOARLAB 坚持把可复现系统、真实机器人平台和研究工具开源出来。这里汇总实验室新项目以及与代表论文对应的代码、项目主页和硬件平台。</p>
    <p><a class="btn btn-primary" href="https://github.com/NJU-SOARLAB" rel="external nofollow noopener" target="_blank">访问 SOARLAB GitHub</a></p>
  </div>
</div>

## 实验室项目

<div class="soar-open-grid">
  <article class="soar-open-card">
    <p class="soar-open-card__tag">SOARLAB · 人形机器人 · 开源</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/echo-g.jpg' | relative_url }}" alt="ECHO-G overview: speech and text conditioning, dataset, benchmark, and real-robot execution">
    <h3>ECHO-G</h3>
    <p class="soar-live-stars" data-github-repo="NJU-SOARLAB/ECHO-G" data-star-label="stars" data-star-fallback="★ stars unavailable">Loading stars...</p>
    <p>让人形机器人说话时手舞足蹈、踩准节拍：从语音和带时间戳的文本直接生成 Unitree G1 全身动作，端到端全身控制，可在 Jetson Orin AGX 上运行。代码、数据集与模型权重均已开源。</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/NJU-SOARLAB/ECHO-G" rel="external nofollow noopener" target="_blank">GitHub</a>
      <a href="https://echo-g-project.github.io/" rel="external nofollow noopener" target="_blank">Project</a>
      <a href="https://arxiv.org/abs/2609.39575" rel="external nofollow noopener" target="_blank">Paper</a>
      <a href="https://www.bilibili.com/video/BV1dJHi6DELp/" rel="external nofollow noopener" target="_blank">Video</a>
      <a href="https://huggingface.co/gaopusen/ECHO-G" rel="external nofollow noopener" target="_blank">Models</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">SOARLAB · Agent Tooling</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/openprism.jpg' | relative_url }}" alt="OpenPrism architecture preview">
    <h3>OpenPrism</h3>
    <p class="soar-live-stars" data-github-repo="NJU-SOARLAB/OpenPrism" data-star-label="stars" data-star-fallback="★ stars unavailable">Loading stars...</p>
    <p>面向 OpenCode 生态的多层级绘图插件，把 Mermaid 结构图、Matplotlib 论文级可视化、Plotly.js 交互图表和 AIGC 图像生成带到 AI coding agent 工作流中。</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/NJU-SOARLAB/OpenPrism" rel="external nofollow noopener" target="_blank">GitHub</a>
    </div>
  </article>
</div>

## 论文关联项目

<div class="soar-open-grid">
  <article class="soar-open-card">
    <p class="soar-open-card__tag">IROS 2026</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/aug.jpg' | relative_url }}" alt="AUG figure 1 preview">
    <h3>AUG</h3>
    <p>A perception-aware UAV graph-based planner for GNSS-denied navigation in feature-sparse environments. It routes through structure-rich corridors and keeps the onboard estimator better conditioned.</p>
    <div class="soar-open-card__links">
      <a href="https://fegkkd.github.io/IROS2026AUG/" rel="external nofollow noopener" target="_blank">Project</a>
      <a href="{{ '/publications/#feng2026aug' | relative_url }}">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">TRO 2025</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/fint.jpg' | relative_url }}" alt="FINT tunnel flight preview">
    <h3>FINT</h3>
    <p class="soar-live-stars" data-github-repo="HKUST-Aerial-Robotics/FINT" data-star-label="stars" data-star-fallback="★ stars unavailable">Loading stars...</p>
    <p>对应论文 <em>Autonomous Flights Inside Narrow Tunnels</em>，面向狭窄隧道自主飞行的系统与代码。</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/HKUST-Aerial-Robotics/FINT" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://doi.org/10.1109/TRO.2025.3548525" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">IROS 2024</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/omninxt.jpg' | relative_url }}" alt="OmniNxt system preview">
    <h3>OmniNxt</h3>
    <p class="soar-live-stars" data-github-repo="HKUST-Aerial-Robotics/OmniNxt" data-star-label="stars" data-star-fallback="★ stars unavailable">Loading stars...</p>
    <p>开源、紧凑、具备全向视觉感知能力的无人机平台，支持全向定位、稠密建图与真实飞行验证。</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/HKUST-Aerial-Robotics/OmniNxt" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://hkust-aerial-robotics.github.io/OmniNxt" rel="external nofollow noopener" target="_blank">Project</a>
      <a href="https://doi.org/10.1109/IROS58592.2024.10802134" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">TRO 2024</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/d2slam.jpg' | relative_url }}" alt="D2SLAM system preview">
    <h3>D<sup>2</sup>SLAM</h3>
    <p class="soar-live-stars" data-github-repo="HKUST-Aerial-Robotics/D2SLAM" data-star-label="stars" data-star-fallback="★ stars unavailable">Loading stars...</p>
    <p>面向无人机集群的去中心化、分布式协同视觉惯性 SLAM 系统，强调近场相对状态估计和全局一致性。</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/HKUST-Aerial-Robotics/D2SLAM" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://doi.org/10.1109/TRO.2024.3422003" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">TRO 2023 · Best Paper</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/racer.jpg' | relative_url }}" alt="RACER exploration preview">
    <h3>RACER</h3>
    <p class="soar-live-stars" data-github-repo="SYSU-STAR/RACER" data-star-label="stars" data-star-fallback="★ stars unavailable">Loading stars...</p>
    <p>去中心化多无人机快速协同探索系统，获 IEEE TRO King-Sun Fu Memorial Best Paper Award。</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/SYSU-STAR/RACER" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://doi.org/10.1109/TRO.2023.3236945" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">TRO 2022</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/omni-swarm.jpg' | relative_url }}" alt="Omni-Swarm system preview">
    <h3>Omni-Swarm</h3>
    <p class="soar-live-stars" data-github-repo="HKUST-Aerial-Robotics/Omni-swarm" data-star-label="stars" data-star-fallback="★ stars unavailable">Loading stars...</p>
    <p>面向无人机集群的全向视觉惯性 UWB 状态估计系统，支撑厘米级相对状态估计和集群一致性。</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/HKUST-Aerial-Robotics/Omni-swarm" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://doi.org/10.1109/TRO.2022.3182503" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">SLAM Software</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/vins-fisheye.jpg' | relative_url }}" alt="VINS-Fisheye point cloud preview">
    <h3>VINS-Fisheye</h3>
    <p class="soar-live-stars" data-github-repo="xuhao1/VINS-Fisheye" data-star-label="stars" data-star-fallback="★ stars unavailable">Loading stars...</p>
    <p>VINS-Fusion 的鱼眼版本，支持 GPU/VisionWorks 加速，是 Omni-Swarm 系统的一部分，也可独立用于机器人定位。</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/xuhao1/VINS-Fisheye" rel="external nofollow noopener" target="_blank">Code</a>
    </div>
  </article>
</div>
