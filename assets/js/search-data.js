// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-home",
    title: "home",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-recruiting",
          title: "recruiting",
          description: "2027 admissions information for SOARLAB.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/recruiting/";
          },
        },{id: "nav-招生",
          title: "招生",
          description: "SOARLAB 2027 级招生信息。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/zh/recruiting/";
          },
        },{id: "nav-research",
          title: "research",
          description: "Research directions and platforms of SOARLAB.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/research/";
          },
        },{id: "nav-研究",
          title: "研究",
          description: "SOARLAB 研究方向与平台。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/zh/research/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "Selected publications by Hao Xu and collaborators.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-论文",
          title: "论文",
          description: "徐浩老师与合作者的代表论文。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/zh/publications/";
          },
        },{id: "nav-open-source",
          title: "open source",
          description: "Open-source projects, paper code, and research tools from SOARLAB.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/open-source/";
          },
        },{id: "nav-开源",
          title: "开源",
          description: "SOARLAB 的开源项目、论文代码和研究工具。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/zh/open-source/";
          },
        },{id: "nav-people",
          title: "people",
          description: "SOARLAB members.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/people/";
          },
        },{id: "nav-成员",
          title: "成员",
          description: "SOARLAB 团队成员。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/zh/people/";
          },
        },{id: "nav-news",
          title: "news",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/news/";
          },
        },{id: "nav-新闻",
          title: "新闻",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/zh/news/";
          },
        },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-soarlab-飞行通用智能课题组-即将在南京大学智能科学与技术学院开展工作-面向-2027-级招收直博生-普博生和硕士研究生",
          title: 'SOARLAB（飞行通用智能课题组）即将在南京大学智能科学与技术学院开展工作，面向 2027 级招收直博生、普博生和硕士研究生。',
          description: "",
          section: "News",},{id: "news-2027-招生方向-当前最急需推进的方向包括-wam-vla-机器人基础模型与-ai-agent-同时继续欢迎对分布式感知-slam-强化学习-无人机集群和真实机器人系统有扎实兴趣的同学-详见招生页面",
          title: '2027 招生方向：当前最急需推进的方向包括 WAM/VLA 机器人基础模型与 AI Agent，同时继续欢迎对分布式感知、SLAM、强化学习、无人机集群和真实机器人系统有扎实兴趣的同学。详见招生页面。',
          description: "",
          section: "News",},{id: "news-早期成员将参与课题组基础设施建设-包括计算服务器-实验场地-无人机与机器人验证平台",
          title: '早期成员将参与课题组基础设施建设，包括计算服务器、实验场地、无人机与机器人验证平台。',
          description: "",
          section: "News",},{id: "news-echo-g-发布-让人形机器人说话时也能手舞足蹈-踩准节拍-echo-g-联合使用文本与语音潜空间信息-生成语义丰富的肢体动作-实现端到端全身控制-并可在嵌入式设备-jetson-orin-agx-上运行-本工作由课题组与妙动科技-mondo-robotics-港科大-uav-group-合作完成-论文-代码-视频",
          title: 'ECHO-G 发布：让人形机器人说话时也能手舞足蹈、踩准节拍。ECHO-G 联合使用文本与语音潜空间信息，生成语义丰富的肢体动作，实现端到端全身控制，并可在嵌入式设备 Jetson Orin AGX 上运行。本工作由课题组与妙动科技 Mondo Robotics、港科大 UAV Group 合作完成。论文 ·...',
          description: "",
          section: "News",},{id: "news-合作论文-aug-perception-aware-uav-graph-based-planning-for-gnss-denied-navigation-in-feature-sparse-environments-获得-iros-2026-安全-安保与救援机器人最佳论文奖-honorable-mention-best-paper-award-on-safety-security-and-rescue-robotics",
          title: '合作论文 AUG: Perception-Aware UAV Graph-Based Planning for GNSS-Denied Navigation in Feature-Sparse Environments 获得...',
          description: "",
          section: "News",},{id: "news-新论文-spatial-memory-by-agents-for-agents-上线-arxiv-我们让编程智能体为机器人设计-空间记忆-自动写代码-跑评测-根据反馈反复迭代-探索场景该怎么记-需要时怎么找-我们将其暂称为-gsi-引导式系统改进-guided-system-improvement-在五类任务评测中-最强配置的平均综合得分相较最强的全任务基线相对提升约-51-本工作由课题组与妙动科技合作完成-arxiv-项目主页",
          title: '新论文 Spatial Memory by Agents, for Agents 上线 arXiv：我们让编程智能体为机器人设计「空间记忆」，自动写代码、跑评测、根据反馈反复迭代，探索场景该怎么记、需要时怎么找。我们将其暂称为 GSI（引导式系统改进，Guided System Improvement）。在五类任务评测中，最强配置的平均综合得分相较最强的全任务基线相对提升约 51%。本工作由课题组与妙动科技合作完成。arXiv...',
          description: "",
          section: "News",},{id: "projects-aerial-swarm-and-distributed-slam",
          title: 'Aerial Swarm and Distributed SLAM',
          description: "Distributed perception, state estimation, SLAM, and autonomous swarm systems.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/aerial-swarm-slam/";
            },},{id: "projects-aug",
          title: 'AUG',
          description: "Perception-aware UAV graph-based planning for GNSS-denied navigation in feature-sparse environments.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/aug/";
            },},{id: "projects-robotics-agent",
          title: 'Robotics Agent',
          description: "Agent-oriented perception, world models, planning, control, and simulation.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/robotics-agent/";
            },},{id: "projects-tisa",
          title: 'TISA',
          description: "Terrain- and intent-aware shared autonomy for humanoid teleoperation.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/tisa/";
            },},{id: "projects-wam-vla-robot-foundation-models",
          title: 'WAM/VLA Robot Foundation Models',
          description: "World-action and vision-language-action models for real robots.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/wam-vla/";
            },},{id: "teachings-data-science-fundamentals",
          title: 'Data Science Fundamentals',
          description: "This course covers the foundational aspects of data science, including data collection, cleaning, analysis, and visualization. Students will learn practical skills for working with real-world datasets.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/data-science-fundamentals/";
            },},{id: "teachings-introduction-to-machine-learning",
          title: 'Introduction to Machine Learning',
          description: "This course provides an introduction to machine learning concepts, algorithms, and applications. Students will learn about supervised and unsupervised learning, model evaluation, and practical implementations.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/introduction-to-machine-learning/";
            },},{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/xuhao1", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=XF_6HvcAAAAJ", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
