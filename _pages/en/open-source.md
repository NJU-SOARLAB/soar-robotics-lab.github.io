---
layout: page
permalink: /open-source/
title: open source
description: Open-source projects, paper code, and research tools from SOARLAB.
nav: true
nav_order: 4
lang: en
translation_url: /zh/open-source/
---

<div class="soar-open-hero">
  <img src="{{ '/assets/img/soarlab-256.png' | relative_url }}" alt="SOARLAB logo">
  <div>
    <p class="soar-eyebrow">Open systems for flying general intelligence</p>
    <h1>Open Source</h1>
    <p>SOARLAB releases reproducible systems, real-robot platforms, and research tools. This page collects new lab projects and code/project pages connected to representative publications.</p>
    <p><a class="btn btn-primary" href="https://github.com/NJU-SOARLAB" rel="external nofollow noopener" target="_blank">Visit SOARLAB GitHub</a></p>
  </div>
</div>

## Lab Projects

<div class="soar-open-grid">
  <article class="soar-open-card">
    <p class="soar-open-card__tag">SOARLAB · Humanoid · Open Source</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/echo-g.jpg' | relative_url }}" alt="ECHO-G overview: speech and text conditioning, dataset, benchmark, and real-robot execution">
    <h3>ECHO-G</h3>
    <p class="soar-live-stars" data-github-repo="NJU-SOARLAB/ECHO-G" data-star-label="stars" data-star-fallback="★ stars unavailable">Stars loading...</p>
    <p>Co-speech whole-body gestures for humanoids: ECHO-G generates Unitree G1 motion directly from speech audio and word-timed transcripts, with end-to-end whole-body control that runs on a Jetson Orin AGX. Code, dataset, and model weights are released.</p>
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
    <p class="soar-live-stars" data-github-repo="NJU-SOARLAB/OpenPrism" data-star-label="stars" data-star-fallback="★ stars unavailable">Stars loading...</p>
    <p>A multi-tier drawing plugin for the OpenCode ecosystem, bringing Mermaid diagrams, Matplotlib publication-quality plots, Plotly.js interactive charts, and AIGC image generation into AI coding-agent workflows.</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/NJU-SOARLAB/OpenPrism" rel="external nofollow noopener" target="_blank">GitHub</a>
    </div>
  </article>
</div>

## Paper-Linked Projects

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
    <p class="soar-live-stars" data-github-repo="HKUST-Aerial-Robotics/FINT" data-star-label="stars" data-star-fallback="★ stars unavailable">Stars loading...</p>
    <p>Code and system resources for <em>Autonomous Flights Inside Narrow Tunnels</em>, targeting autonomous flight in narrow tunnel environments.</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/HKUST-Aerial-Robotics/FINT" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://doi.org/10.1109/TRO.2025.3548525" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">IROS 2024</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/omninxt.jpg' | relative_url }}" alt="OmniNxt system preview">
    <h3>OmniNxt</h3>
    <p class="soar-live-stars" data-github-repo="HKUST-Aerial-Robotics/OmniNxt" data-star-label="stars" data-star-fallback="★ stars unavailable">Stars loading...</p>
    <p>An open-source compact aerial robot with omnidirectional visual perception for localization, dense mapping, and real-world flight validation.</p>
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
    <p class="soar-live-stars" data-github-repo="HKUST-Aerial-Robotics/D2SLAM" data-star-label="stars" data-star-fallback="★ stars unavailable">Stars loading...</p>
    <p>A decentralized and distributed collaborative visual-inertial SLAM system for aerial swarms, covering near-field relative estimation and globally consistent trajectories.</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/HKUST-Aerial-Robotics/D2SLAM" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://doi.org/10.1109/TRO.2024.3422003" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">TRO 2023 · Best Paper</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/racer.jpg' | relative_url }}" alt="RACER exploration preview">
    <h3>RACER</h3>
    <p class="soar-live-stars" data-github-repo="SYSU-STAR/RACER" data-star-label="stars" data-star-fallback="★ stars unavailable">Stars loading...</p>
    <p>A decentralized multi-UAV rapid collaborative exploration system and IEEE TRO King-Sun Fu Memorial Best Paper Award winner.</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/SYSU-STAR/RACER" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://doi.org/10.1109/TRO.2023.3236945" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">TRO 2022</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/omni-swarm.jpg' | relative_url }}" alt="Omni-Swarm system preview">
    <h3>Omni-Swarm</h3>
    <p class="soar-live-stars" data-github-repo="HKUST-Aerial-Robotics/Omni-swarm" data-star-label="stars" data-star-fallback="★ stars unavailable">Stars loading...</p>
    <p>A decentralized omnidirectional visual-inertial-UWB state-estimation system for aerial swarms, supporting centimeter-level relative estimation and global consistency.</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/HKUST-Aerial-Robotics/Omni-swarm" rel="external nofollow noopener" target="_blank">Code</a>
      <a href="https://doi.org/10.1109/TRO.2022.3182503" rel="external nofollow noopener" target="_blank">Paper</a>
    </div>
  </article>

  <article class="soar-open-card">
    <p class="soar-open-card__tag">SLAM Software</p>
    <img class="soar-open-card__image" src="{{ '/assets/img/publication_preview/vins-fisheye.jpg' | relative_url }}" alt="VINS-Fisheye point cloud preview">
    <h3>VINS-Fisheye</h3>
    <p class="soar-live-stars" data-github-repo="xuhao1/VINS-Fisheye" data-star-label="stars" data-star-fallback="★ stars unavailable">Stars loading...</p>
    <p>A fisheye version of VINS-Fusion with GPU/VisionWorks acceleration. It is part of Omni-Swarm and can also be used independently for robot localization.</p>
    <div class="soar-open-card__links">
      <a href="https://github.com/xuhao1/VINS-Fisheye" rel="external nofollow noopener" target="_blank">Code</a>
    </div>
  </article>
</div>
