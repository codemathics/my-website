export interface ProjectImage {
  src: string;
  alt: string;
}

/* placeholder image pool — 16:9, replace with real assets later */
const PLACEHOLDERS = {
  hero: [
    "https://picsum.photos/seed/cs-hero-1/1200/675",
    "https://picsum.photos/seed/cs-hero-2/1200/675",
    "https://picsum.photos/seed/cs-hero-3/1200/675",
    "https://picsum.photos/seed/cs-hero-4/1200/675",
    "https://picsum.photos/seed/cs-hero-5/1200/675",
    "https://picsum.photos/seed/cs-hero-6/1200/675",
    "https://picsum.photos/seed/cs-hero-7/1200/675",
    "https://picsum.photos/seed/cs-hero-8/1200/675",
    "https://picsum.photos/seed/cs-hero-9/1200/675",
    "https://picsum.photos/seed/cs-hero-10/1200/675",
  ],
  insight: [
    "https://picsum.photos/seed/insight-1/800/450",
    "https://picsum.photos/seed/insight-2/800/450",
    "https://picsum.photos/seed/insight-3/800/450",
    "https://picsum.photos/seed/insight-4/800/450",
    "https://picsum.photos/seed/insight-5/800/450",
    "https://picsum.photos/seed/insight-6/800/450",
    "https://picsum.photos/seed/insight-7/800/450",
    "https://picsum.photos/seed/insight-8/800/450",
    "https://picsum.photos/seed/insight-9/800/450",
    "https://picsum.photos/seed/insight-10/800/450",
  ],
  step: [
    "https://picsum.photos/seed/step-1/800/450",
    "https://picsum.photos/seed/step-2/800/450",
    "https://picsum.photos/seed/step-3/800/450",
    "https://picsum.photos/seed/step-4/800/450",
    "https://picsum.photos/seed/step-5/800/450",
    "https://picsum.photos/seed/step-6/800/450",
    "https://picsum.photos/seed/step-7/800/450",
    "https://picsum.photos/seed/step-8/800/450",
    "https://picsum.photos/seed/step-9/800/450",
    "https://picsum.photos/seed/step-10/800/450",
  ],
  learning: [
    "https://picsum.photos/seed/learn-1/800/450",
    "https://picsum.photos/seed/learn-2/800/450",
    "https://picsum.photos/seed/learn-3/800/450",
    "https://picsum.photos/seed/learn-4/800/450",
    "https://picsum.photos/seed/learn-5/800/450",
    "https://picsum.photos/seed/learn-6/800/450",
    "https://picsum.photos/seed/learn-7/800/450",
    "https://picsum.photos/seed/learn-8/800/450",
    "https://picsum.photos/seed/learn-9/800/450",
    "https://picsum.photos/seed/learn-10/800/450",
  ],
  project: [
    "https://picsum.photos/seed/proj-1/800/450",
    "https://picsum.photos/seed/proj-2/800/450",
    "https://picsum.photos/seed/proj-3/800/450",
    "https://picsum.photos/seed/proj-4/800/450",
    "https://picsum.photos/seed/proj-5/800/450",
    "https://picsum.photos/seed/proj-6/800/450",
    "https://picsum.photos/seed/proj-7/800/450",
    "https://picsum.photos/seed/proj-8/800/450",
    "https://picsum.photos/seed/proj-9/800/450",
    "https://picsum.photos/seed/proj-10/800/450",
  ],
};

export interface ShowcaseProject {
  name: string;
  slug: string;
  description: string;
  primaryImage?: ProjectImage;
  primaryLottie?: object;
  link?: string;
  highlights?: string[];
}

export interface ResearchInsight {
  image?: string;
  caption: string;
}

export interface SolutionStep {
  title: string;
  description: string;
  image?: string;
}

export interface LearningItem {
  title: string;
  description: string;
}

export interface CaseStudyData {
  slug: string;
  name: string;
  logoIcon?: string;
  logoWide?: boolean;
  headline: string;
  heroImage?: string;
  heroLottieKey?: string;
  overviewImage?: string;
  role: string;
  timeline: string;
  team: string[];
  skills: string[];
  overview: string;
  problem: {
    title: string;
    description: string;
    question: string;
  };
  research: {
    title: string;
    insights: ResearchInsight[];
  };
  solution: {
    title: string;
    steps: SolutionStep[];
  };
  learnings: {
    title: string;
    items: LearningItem[];
    images?: string[];
  };
}

/* ── showcase data for homepage cards ── */

export const projects: ShowcaseProject[] = [
  {
    name: "BLOCKRADAR",
    slug: "blockradar",
    primaryImage: { src: "/bgbr.png", alt: "Blockradar" },
    description:
      "blockradar is a stablecoin wallet infrastructure for fintechs, enabling secure custody,\nsettlement, and visibility across multi-chain payment flows.",
    link: "https://blockradar.co",
    highlights: [
      "$350M+ processed volume post beta",
      "0→1 product + brand + interaction",
      "creative direction and motion design",
    ],
  },
  {
    name: "PAYCREST",
    slug: "paycrest",
    primaryImage: { src: "/bgPaycrest.png", alt: "Paycrest" },
    description:
      "paycrest is a decentralized stablecoin-to-fiat settlement protocol, powering seamless cross-border payment rails for fintechs and businesses.",
    highlights: [
      "decentralized settlement protocol",
      "cross-border payment infrastructure",
      "product design + brand identity",
    ],
  },
  {
    name: "NOBLOCKS",
    slug: "noblocks",
    primaryImage: { src: "/bgNoblocks.png", alt: "Noblocks" },
    description:
      "noblocks is a seamless financial interface that allows you to transact your stablecoins for cash, instantly!",
    highlights: [
      "seamless payment experience",
      "product design + UX strategy",
      "visual identity system",
    ],
  },
  {
    name: "OFFGRID",
    slug: "offgrid",
    primaryImage: { src: "/bgOffgrid.png", alt: "Offgrid" },
    description:
      "Offgrid is a Dutch design studio by Fons Mans. We create bold identities, striking campaigns, and sticky interfaces for companies shaping tomorrow. Clients include Lovable, Intercom, Meta, Cosmos, and Loops.",
    highlights: [
      "senior interaction designer",
      "design system architecture",
      "micro-interactions + motion",
    ],
  },
  {
    name: "GIGA AI",
    slug: "giga-ai",
    primaryImage: { src: "/bgGiga.png", alt: "Giga AI" },
    description:
      "an AI company, backed by Y Combinator, that provides advanced, on-premise AI agents designed to replace traditional customer support call centers for large enterprises.",
    highlights: [
      "creative direction",
      "video production + storytelling",
      "brand narrative + motion design",
    ],
  },
  {
    name: "NUBIAN",
    slug: "nubian",
    primaryImage: { src: "/bgNubian.png", alt: "Nubian" },
    description:
      "nubian is a defi savings wallet app that allows anyone to save stablecoins and digital assets to get rewards.",
    highlights: [
      "product design + UX",
      "visual identity + branding",
      "community-driven platform",
    ],
  },
  {
    name: "HYPER",
    slug: "hyper",
    primaryImage: { src: "/bgHyper.png", alt: "Hyper" },
    description:
      "hyper is africa's leading crypto-gaming community and play-to-earn guild, onboarding the next generation of gamers into web3.",
    highlights: [
      "gaming community platform",
      "product design + brand system",
      "web3 onboarding experience",
    ],
  },
  // {
  //   name: "INDEX COOP",
  //   slug: "index-coop",
  //   primaryImage: { src: PLACEHOLDERS.project[7], alt: "Index Coop" },
  //   description:
  //     "index coop is a decentralized autonomous organization building structured defi index products that make crypto investing simple and accessible.",
  //   highlights: [
  //     "product designer",
  //     "defi dashboard + index products",
  //     "design system + data visualization",
  //   ],
  // },
  // {
  //   name: "BUILDABLE FM",
  //   slug: "buildable-fm",
  //   primaryImage: { src: PLACEHOLDERS.project[8], alt: "Buildable FM" },
  //   description:
  //     "buildable fm is a platform empowering creators and builders with tools and infrastructure to ship products faster.",
  //   highlights: [
  //     "product design + strategy",
  //     "creator tooling UX",
  //     "brand identity system",
  //   ],
  // },
  {
    name: "BLOCASSET",
    slug: "blocasset",
    primaryImage: { src: "/bgBlocasset.png", alt: "Blocasset" },
    description:
      "blocasset is the one-stop web3 design asset marketplace, enabling designers to create, sell, and earn cryptocurrency for their digital assets.",
    highlights: [
      "founder + product designer",
      "marketplace UX + design system",
      "web3 asset ecosystem",
    ],
  },
];

/* ── full case study data for project pages ── */

export const caseStudies: CaseStudyData[] = [
  {
    slug: "blockradar",
    name: "Blockradar",
    logoIcon: "/logos/blockradar.svg",
    heroLottieKey: "br",
    overviewImage: "/bgbr.png",
    headline: "Designing stablecoin wallet infrastructure from 0 to $450M+ TPV",
    role: "Founding Head of Product & Design",
    timeline: "2024 - Present",
    team: ["Clement Hugbo"],
    skills: [
      "Product Design",
      "Interaction Design",
      "Brand Identity",
      "Motion Design",
      "Creative Direction",
      "Product and Design Strategy",
    ],
    overview:
      "I built Blockradar as a team of 3 at the stage where the \"product\" was just an idea. Stablecoins could be the most practical financial rails for emerging markets, but only if we could make them feel normal. My job became turning that conviction into a system global fintech companies could actually trust with money, by shaping the product from first principles.\n\nWhen you strip stablecoins down to what matters, you realize the challenge isn't blockchain. It's uncertainty. People don't fear \"onchain\", they fear not knowing what's happening, what happens next, and what to do when something goes wrong. So I designed Blockradar around clarity: clear states, clear intent, and calm control. That mindset carried through everything I built: Gateway (with Circle), arc-powered rails, Checkout (Stripe for stablecoins), Yield, and Autosettlement, until the platform grew into infrastructure used by 100+ fintechs across Africa, LATAM, the Middle East, and Southeast Asia, processing $350M+ in volume.",
    problem: {
      title: "How do we make a complex financial system feel boring, in the best way?",
      description:
        "When we started, the real problem wasn't \"build a stablecoin wallet.\" It was that stablecoins were being sold as magic, but they were being experienced as stress. You could send money across borders in minutes, yet teams still ran operations like it was fragile: screenshots, manual reconciliations, \"did it go through?\" messages, and support threads that lived next to block explorers.\n\nThat mismatch creates a trust cliff. Once money is involved, anything that feels unclear becomes \"unsafe,\" and if a product feels unsafe, no feature matters. Boring meant predictable. Boring meant legible. Boring meant people could build on it and sleep.",
      question:
        "How do we make a complex financial system feel boring, in the best way?",
    },
    research: {
      title: "Understanding behaviors under pressure",
      insights: [
        {
          image: PLACEHOLDERS.insight[0],
          caption:
            "My research was less about collecting opinions and more about understanding behaviors under pressure. I watched how operators react when a transfer is delayed, what questions founders ask when a partner is evaluating you, and what finance teams need before they'll move funds at scale. I tried to map \"where anxiety lives\" inside a money flow, because anxiety is usually where product adoption dies.",
        },
        {
          image: PLACEHOLDERS.insight[1],
          caption:
            "I also learned quickly that stablecoin infra has two audiences at once: the end users who want a smooth experience, and the operators behind the scenes who need power, visibility, and control. If you over-design for one group, you break trust with the other. So every feature had to resolve that tension.",
        },
      ],
    },
    solution: {
      title: "First-principles design across money flows",
      steps: [
        {
          title: "Money flows as state machines",
          image: "/brAutosettlement.png",
          description:
            "The first was that money flows are basically state machines: there's always a current state, a next state, and an expected timeline, plus failure states that must be honest. We build infrastructure for fintechs and global companies, not custody of funds, so our role is to support their transactional purposes and help them manage their own users and customers. So instead of designing screens, I designed \"truth.\" I asked: what are the states we can guarantee, what are the states we can't, and how do we communicate uncertainty without sounding like we're hiding something?",
        },
        {
          title: "Trust is created at the edges",
          image: "/bgCheckout.png",
          description:
            "The second was that trust is created at the edges. The \"happy path\" is easy; the hard part is what happens when a payment is underfunded, sent on the wrong network, stuck pending, or needs review. I treated those moments like first-class design problems, because they're the moments users remember. Checkout forced us to confront a simple idea: if stablecoins are really \"money for the internet,\" paying with them should feel as easy as paying with a card. I kept describing it as \"Stripe for stablecoins,\" not because of aesthetics, but because Stripe's magic is clarity. So I designed Checkout to remove intimidation: paid, pending, expired, underpaid, wrong network, each state had to be explicit and actionable.",
        },
        {
          title: "Autopilot vs control",
          image: "/brAutosettlement1.png",
          description:
            "The third was that operators need two modes: autopilot when things are calm, and control when things are not. That principle shaped how we built automation like Autosettlement while still leaving room for visibility and overrides. Autosettlement was where my \"autopilot vs control\" principle got tested the most. When money moves automatically, users need to know exactly what triggers it, what happens during it, and what the system will do if something doesn't match expectations. So I designed Autosettlement like setting a rule in a financial system, not like flipping a feature toggle. And when something goes wrong, the product has to be honest and helpful: show what failed, what it tried, what it will try next, and how to intervene.",
        },
        {
          title: "Gateway + Circle + Arc",
          image: "/bgGateway.png",
          description:
            "Gateway was where Blockradar had to look and behave like real infrastructure, not a crypto tool. When Circle came into the picture, that bar moved even higher. So I designed Gateway around mental models fintech teams already understand: routing, settlement, traceability, while hiding unnecessary blockchain noise. Working closely with the Circle team building Arc, I was able to design a seamless flow for stablecoin settlement and onchain routing without the complexities of multiple cross-chain transactions.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: ["/key1.jpg", "/key2.jpg", "/key3.jpg"],
      items: [
        {
          title: "Impact",
          description:
            "Over time, Blockradar grew from early-stage product building into stablecoin wallet infrastructure used by 100+ fintechs across multiple regions, scaling to $450M+ in processed volume. But the deeper impact, for me, is that we made a category that often feels chaotic start to feel operational. We didn't just ship features, we shipped reassurance.",
        },
        {
          title: "Design as risk management",
          description:
            "Blockradar taught me that in fintech, design isn't decoration, it's risk management expressed as experience. The cleanest UI isn't the one with the fewest components; it's the one that reduces uncertainty. And first principles matter because in new categories, templates lie. When you start from \"what must be true for this to be trusted,\" you end up building products that scale with time, partners, and real-world messiness.",
        },
      ],
    },
  },
  {
    slug: "paycrest",
    name: "Paycrest",
    logoIcon: "/logos/paycrest.svg",
    heroImage: PLACEHOLDERS.hero[1],
    headline: "Decentralized settlement for cross-border payments",
    role: "Product Designer",
    timeline: "2024 - Present",
    team: ["Clement Hugbo", "Paycrest Team"],
    skills: [
      "Product Design",
      "UX Strategy",
      "Brand Identity",
      "Interaction Design",
    ],
    overview:
      "Paycrest is building decentralized stablecoin-to-fiat settlement infrastructure. I designed the core product experience that enables fintechs and businesses to seamlessly convert stablecoins to local currencies across multiple corridors, focusing on trust, speed, and simplicity in the cross-border payment flow.",
    problem: {
      title: "Cross-border payments are slow, expensive, and opaque",
      description:
        "Traditional cross-border payment rails are plagued by high fees, slow settlement times, and a lack of transparency. While stablecoins offer a faster alternative, converting them to local fiat currencies remains fragmented and unreliable across emerging market corridors.",
      question:
        "How can we design a decentralized settlement experience that makes stablecoin-to-fiat conversion instant, transparent, and trustworthy?",
    },
    research: {
      title: "Mapping the cross-border payment landscape",
      insights: [
        { image: PLACEHOLDERS.insight[3], caption: "Settlement speed is the primary driver — businesses need funds in local currency within minutes, not days." },
        { image: PLACEHOLDERS.insight[4], caption: "Liquidity fragmentation across corridors creates unreliable rates and failed transactions that erode user trust." },
        { image: PLACEHOLDERS.insight[5], caption: "Compliance requirements vary wildly by jurisdiction, making a one-size-fits-all approach impossible." },
      ],
    },
    solution: {
      title: "A decentralized protocol with a centralized experience",
      steps: [
        {
          title: "Transparent settlement tracking",
          image: PLACEHOLDERS.step[3],
          description:
            "Designed real-time settlement tracking that shows every stage of the stablecoin-to-fiat conversion, building trust through visibility.",
        },
        {
          title: "Corridor-aware rate engine",
          image: PLACEHOLDERS.step[4],
          description:
            "Created an interface that surfaces the best available rates across liquidity providers, with clear fee breakdowns before confirmation.",
        },
        {
          title: "Developer integration flow",
          image: PLACEHOLDERS.step[5],
          description:
            "Built an onboarding experience that guides developers from API key generation to first successful settlement with interactive documentation.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[3], PLACEHOLDERS.learning[4]],
      items: [
        {
          title: "Decentralized backend, centralized experience",
          description:
            "Users don't care about the underlying protocol architecture. The design challenge was making a decentralized system feel as reliable and simple as a traditional payment processor.",
        },
        {
          title: "Trust is earned in the details",
          description:
            "Small details like showing estimated arrival times, providing transaction receipts, and displaying liquidity depth indicators transformed user confidence in the platform.",
        },
      ],
    },
  },
  {
    slug: "noblocks",
    name: "Noblocks",
    logoIcon: "/logos/noblocks.svg",
    heroImage: PLACEHOLDERS.hero[2],
    headline: "Removing friction from digital-to-real-world payments",
    role: "Product Designer",
    timeline: "2024 - Present",
    team: ["Clement Hugbo", "Noblocks Team"],
    skills: ["Product Design", "UX Strategy", "Visual Design"],
    overview:
      "Noblocks is building frictionless payment infrastructure that bridges digital assets and real-world transactions. I led the product design effort to create seamless payment experiences that abstract away the complexity of blockchain-powered transactions for everyday users and merchants.",
    problem: {
      title: "Digital payments still feel disconnected from real commerce",
      description:
        "Despite advances in digital payment technology, there remains a significant gap between holding digital assets and using them for everyday transactions. Merchants lack simple tools to accept digital payments, and users face confusing conversion flows.",
      question:
        "How can we design a payment experience so seamless that users forget they're using blockchain technology?",
    },
    research: {
      title: "Understanding payment friction points",
      insights: [
        { image: PLACEHOLDERS.insight[6], caption: "Merchants want a single integration point — they shouldn't need to understand blockchain to accept digital payments." },
        { image: PLACEHOLDERS.insight[7], caption: "Users abandon payment flows when asked to manage gas fees, choose networks, or wait for confirmations." },
        { image: PLACEHOLDERS.insight[8], caption: "The most successful payment products are invisible — the technology fades into the background of the transaction." },
      ],
    },
    solution: {
      title: "Payments that just work",
      steps: [
        {
          title: "One-tap payment experience",
          image: PLACEHOLDERS.step[6],
          description:
            "Designed a payment flow that reduces the entire transaction to a single confirmation, handling network selection, gas optimization, and conversion automatically.",
        },
        {
          title: "Merchant dashboard",
          image: PLACEHOLDERS.step[7],
          description:
            "Created a merchant-facing dashboard that presents digital payment data in familiar financial formats — daily totals, settlement reports, and reconciliation tools.",
        },
        {
          title: "Smart defaults for every context",
          image: PLACEHOLDERS.step[8],
          description:
            "Built intelligent defaults that adapt to the user's wallet balance, preferred currency, and transaction history to minimize decision-making at checkout.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[5], PLACEHOLDERS.learning[6]],
      items: [
        {
          title: "Invisible technology is the best technology",
          description:
            "The strongest validation came when users completed transactions without realizing a blockchain was involved. Design success was measured by what users didn't notice.",
        },
        {
          title: "Design for the merchant, not just the end user",
          description:
            "Merchant adoption drives user adoption. Investing in the merchant experience — onboarding, reporting, settlement — unlocked growth more effectively than consumer-facing features.",
        },
      ],
    },
  },
  {
    slug: "offgrid",
    name: "Offgrid",
    logoIcon: "/logos/offgrid.svg",
    logoWide: true,
    heroImage: PLACEHOLDERS.hero[3],
    headline: "Interaction design that makes products feel alive",
    role: "Senior Interaction Designer",
    timeline: "2023 - 2024",
    team: ["Clement Hugbo", "Offgrid Design Team"],
    skills: [
      "Interaction Design",
      "Design Systems",
      "Micro-interactions",
      "Motion Design",
      "Prototyping",
    ],
    overview:
      "As Senior Interaction Designer at Offgrid, I focused on the details that make digital products feel responsive, intuitive, and alive. From design system architecture to micro-interactions and motion patterns, every touchpoint was crafted to create experiences that respond naturally to user intent.",
    problem: {
      title: "Digital products feel static and disconnected",
      description:
        "Most digital products treat interaction as an afterthought — buttons that don't respond, transitions that feel mechanical, and flows that lack continuity. Users instinctively sense when an interface doesn't feel right, even if they can't articulate why.",
      question:
        "How can we design interactions that make every touchpoint feel intentional, responsive, and natural?",
    },
    research: {
      title: "Studying the physics of great interactions",
      insights: [
        { image: PLACEHOLDERS.insight[9], caption: "The best interactions follow natural physics — spring curves, momentum, and gravity create familiar motion that users process without conscious effort." },
        { image: PLACEHOLDERS.insight[0], caption: "Response time under 100ms creates the illusion of direct manipulation. Every millisecond beyond that breaks the connection between intent and outcome." },
        { image: PLACEHOLDERS.insight[1], caption: "Consistency in motion language across a product creates a sense of personality — users begin to feel like the interface has character." },
      ],
    },
    solution: {
      title: "A living design system built on interaction principles",
      steps: [
        {
          title: "Interaction token system",
          image: PLACEHOLDERS.step[9],
          description:
            "Developed a token system for timing, easing, and spring curves that ensured consistent motion language across every component and transition in the product.",
        },
        {
          title: "Contextual micro-interactions",
          image: PLACEHOLDERS.step[0],
          description:
            "Designed micro-interactions that respond to context — hover states that reveal information density, scroll behaviors that adapt to content type, and feedback patterns that confirm user intent.",
        },
        {
          title: "Motion prototyping pipeline",
          image: PLACEHOLDERS.step[1],
          description:
            "Built a prototyping workflow that let the team test interaction ideas at high fidelity before engineering investment, reducing iteration cycles from weeks to days.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[7], PLACEHOLDERS.learning[8]],
      items: [
        {
          title: "Interaction design is invisible design",
          description:
            "The best interactions are the ones users never think about. When someone says an app 'feels good,' they're describing interaction design — even though they can't point to specific elements.",
        },
        {
          title: "Systems thinking scales interaction quality",
          description:
            "Without a systematic approach to motion and interaction, quality degrades as the product grows. Token systems and shared principles let teams maintain interaction quality at scale.",
        },
      ],
    },
  },
  {
    slug: "giga-ai",
    name: "Giga AI",
    logoIcon: "/logos/giga-ai.svg",
    heroImage: PLACEHOLDERS.hero[4],
    headline: "Creative direction meets artificial intelligence",
    role: "Creative Director & Video Producer",
    timeline: "2024",
    team: ["Clement Hugbo", "Giga AI Team"],
    skills: [
      "Creative Direction",
      "Video Production",
      "Brand Storytelling",
      "Motion Design",
      "Visual Design",
    ],
    overview:
      "At Giga AI, I served as Creative Director and Video Producer, shaping the visual narrative of an artificial intelligence company. From brand identity to video content strategy, every creative decision was made to translate complex AI technology into stories that resonate with both technical and non-technical audiences.",
    problem: {
      title: "AI companies struggle to communicate their value visually",
      description:
        "The AI space is crowded with companies using the same visual language — abstract neural networks, robot imagery, and generic tech aesthetics. This visual homogeneity makes it difficult for any single company to stand out or communicate its specific value proposition clearly.",
      question:
        "How can we create a visual identity and content strategy that makes AI technology feel tangible, differentiated, and human?",
    },
    research: {
      title: "Auditing the AI visual landscape",
      insights: [
        { image: PLACEHOLDERS.insight[2], caption: "90% of AI companies use blue/purple gradients with abstract geometric patterns — a visual language that has become meaningless through overuse." },
        { image: PLACEHOLDERS.insight[3], caption: "The most effective AI communications focus on outcomes and human impact rather than technology architecture and capabilities." },
        { image: PLACEHOLDERS.insight[4], caption: "Video content outperforms static content in AI communication because it can demonstrate capability through narrative rather than explanation." },
      ],
    },
    solution: {
      title: "Human-first creative direction for AI technology",
      steps: [
        {
          title: "Brand identity anchored in outcomes",
          image: PLACEHOLDERS.step[2],
          description:
            "Developed a visual identity that centers on what AI enables rather than what AI is — using human-scale metaphors, warm color palettes, and real-world imagery to ground abstract technology.",
        },
        {
          title: "Video content series",
          image: PLACEHOLDERS.step[3],
          description:
            "Produced a series of video content pieces that tell the story of AI through the lens of the people it impacts — short documentaries, product demos, and thought leadership content.",
        },
        {
          title: "Visual system for technical communication",
          image: PLACEHOLDERS.step[4],
          description:
            "Created a design system for technical content that makes complex AI concepts accessible without oversimplifying — layered information architecture with progressive disclosure.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[9], PLACEHOLDERS.learning[0]],
      items: [
        {
          title: "Technology is the tool, not the story",
          description:
            "The most compelling AI narratives don't explain how the technology works — they show what becomes possible. Creative direction for AI companies requires ruthless focus on human impact over technical capability.",
        },
        {
          title: "Video is the highest-leverage creative format for AI",
          description:
            "AI capabilities are inherently dynamic and sequential. Video can demonstrate this in ways that static design and copy cannot — making it the most effective medium for AI brand storytelling.",
        },
      ],
    },
  },
  {
    slug: "nubian",
    name: "Nubian",
    logoIcon: "/logos/nubian.svg",
    heroImage: PLACEHOLDERS.hero[5],
    headline: "Bridging culture and technology for digital communities",
    role: "Product Designer",
    timeline: "2022 - 2023",
    team: ["Clement Hugbo", "Nubian Team"],
    skills: [
      "Product Design",
      "Visual Design",
      "Brand Identity",
      "UX Research",
    ],
    overview:
      "At Nubian, I designed a platform that bridges culture and technology, enabling communities to connect, create, and transact in the digital economy. The design challenge was creating an experience that honors cultural identity while leveraging the latest in web3 technology for community empowerment.",
    problem: {
      title: "Digital platforms don't serve culturally-rooted communities",
      description:
        "Most digital platforms are designed with a one-size-fits-all approach that ignores the cultural nuances and specific needs of underrepresented communities. This creates a disconnect between the platform experience and the community it aims to serve.",
      question:
        "How can we design a platform that feels culturally authentic while being technologically forward?",
    },
    research: {
      title: "Understanding community needs and cultural context",
      insights: [
        { image: PLACEHOLDERS.insight[5], caption: "Community trust is built through cultural representation — visual design, language, and interaction patterns must reflect the community's identity." },
        { image: PLACEHOLDERS.insight[6], caption: "Onboarding is the highest-friction point — new users need to feel both welcomed and empowered from their first interaction." },
        { image: PLACEHOLDERS.insight[7], caption: "Economic participation drives long-term engagement — communities need tools to create, exchange, and capture value within the platform." },
      ],
    },
    solution: {
      title: "A culturally-rooted digital platform",
      steps: [
        {
          title: "Cultural design language",
          image: PLACEHOLDERS.step[5],
          description:
            "Developed a visual design system rooted in cultural motifs and patterns, creating a platform identity that feels authentic and representative of the community it serves.",
        },
        {
          title: "Progressive onboarding",
          image: PLACEHOLDERS.step[6],
          description:
            "Designed a step-by-step onboarding flow that introduces platform capabilities through community stories and existing member content, making technology adoption feel natural.",
        },
        {
          title: "Creator economy tools",
          image: PLACEHOLDERS.step[7],
          description:
            "Built tools for community members to create, showcase, and monetize digital assets — turning passive participants into active creators and earners.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[1], PLACEHOLDERS.learning[2]],
      items: [
        {
          title: "Culture is not a skin, it's the foundation",
          description:
            "Cultural representation in digital products goes deeper than visual theming. It influences information architecture, interaction patterns, content hierarchy, and even feature prioritization.",
        },
        {
          title: "Community-driven design requires community participation",
          description:
            "The best design decisions came from working directly with community members, not from assumptions about their needs. Regular feedback loops and co-design sessions were essential.",
        },
      ],
    },
  },
  {
    slug: "hyper",
    name: "Hyper",
    heroImage: PLACEHOLDERS.hero[6],
    headline: "Onboarding Africa into crypto-gaming and play-to-earn",
    role: "Product Designer",
    timeline: "2022 - 2023",
    team: ["Clement Hugbo", "Hyper Team"],
    skills: [
      "Product Design",
      "Brand System",
      "Web3 UX",
      "Visual Design",
      "Gaming UI",
    ],
    overview:
      "At Hyper, Africa's leading crypto-gaming community and play-to-earn guild, I designed the product experience that onboarded the next generation of gamers into web3. The challenge was making complex blockchain gaming concepts accessible to users who had never interacted with cryptocurrency or digital wallets.",
    problem: {
      title: "Blockchain gaming is inaccessible to mainstream audiences",
      description:
        "Play-to-earn gaming promised economic opportunity for underserved communities, but the reality was a UX nightmare — wallet setup, token bridges, gas fees, and complex game mechanics created barriers that excluded the very audiences who stood to benefit most.",
      question:
        "How can we design a gaming platform experience that makes web3 invisible while delivering real economic value?",
    },
    research: {
      title: "Understanding the gamer journey into web3",
      insights: [
        { image: PLACEHOLDERS.insight[8], caption: "Most potential players dropped off during wallet creation — a 12-step process involving seed phrases, network selection, and token purchases." },
        { image: PLACEHOLDERS.insight[9], caption: "Successful gaming communities prioritize social connection over financial incentives — the earning comes from sustained engagement, not initial motivation." },
        { image: PLACEHOLDERS.insight[0], caption: "Trust in the platform is heavily influenced by the experiences of peers — community testimonials and visible success stories drive adoption more than marketing." },
      ],
    },
    solution: {
      title: "Gaming-first, crypto-second experience design",
      steps: [
        {
          title: "Simplified wallet onboarding",
          image: PLACEHOLDERS.step[8],
          description:
            "Designed a custodial wallet experience that eliminated seed phrases and network selection, letting players start gaming within minutes of signing up.",
        },
        {
          title: "Community-driven guild system",
          image: PLACEHOLDERS.step[9],
          description:
            "Created a guild management interface that made it easy for experienced players to mentor newcomers, with progress tracking, shared earnings dashboards, and team coordination tools.",
        },
        {
          title: "Earnings visibility and trust",
          image: PLACEHOLDERS.step[0],
          description:
            "Built transparent earnings tracking that showed players exactly how their gaming activity translated to real value — with withdrawal flows designed to feel as simple as a bank transfer.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[3], PLACEHOLDERS.learning[4]],
      items: [
        {
          title: "The best onboarding is no onboarding",
          description:
            "Every step in the onboarding flow is an opportunity to lose a user. The most impactful design change was removing steps entirely — using progressive disclosure to introduce complexity only when users needed it.",
        },
        {
          title: "Design for community, not just individuals",
          description:
            "Gaming is inherently social. The most successful features were those that strengthened community bonds — shared achievements, team leaderboards, and mentorship tools drove retention more than individual game mechanics.",
        },
      ],
    },
  },
  {
    slug: "index-coop",
    name: "Index Coop",
    logoIcon: "/logos/index-coop.svg",
    heroImage: PLACEHOLDERS.hero[7],
    headline: "Making DeFi investing simple and accessible",
    role: "Product Designer",
    timeline: "2021 - 2022",
    team: ["Clement Hugbo", "Index Coop DAO Contributors"],
    skills: [
      "Product Design",
      "Data Visualization",
      "Design System",
      "DeFi UX",
      "Web3",
    ],
    overview:
      "At Index Coop, a decentralized autonomous organization building structured DeFi products, I designed the product experiences that made crypto index investing accessible to both DeFi natives and newcomers. Working within a DAO structure meant designing with community governance, transparent decision-making, and decentralized contribution in mind.",
    problem: {
      title: "DeFi investing is too complex for most people",
      description:
        "Decentralized finance offers powerful financial tools, but the user experience is designed for experts — managing individual token positions across protocols, understanding impermanent loss, yield farming strategies, and gas optimization. Index products simplify this, but the interfaces still speak the language of DeFi insiders.",
      question:
        "How can we design DeFi index products that feel as intuitive as buying an ETF while preserving the transparency and control that makes DeFi valuable?",
    },
    research: {
      title: "Understanding investor mental models",
      insights: [
        { image: PLACEHOLDERS.insight[1], caption: "Traditional investors think in portfolios and allocations — they understand diversification through familiar concepts like S&P 500 index funds." },
        { image: PLACEHOLDERS.insight[2], caption: "DeFi users want granular control and real-time data — they need to see underlying token allocations, rebalancing events, and protocol-level metrics." },
        { image: PLACEHOLDERS.insight[3], caption: "Trust in DeFi is built through verifiability — users need to be able to independently confirm that index compositions match what's advertised." },
      ],
    },
    solution: {
      title: "Index investing with DeFi transparency",
      steps: [
        {
          title: "Unified product dashboard",
          image: PLACEHOLDERS.step[1],
          description:
            "Designed a dashboard that presents DeFi index products in familiar investment language — portfolio allocation charts, historical performance, and comparison tools — while providing drill-down access to on-chain data.",
        },
        {
          title: "Progressive data disclosure",
          image: PLACEHOLDERS.step[2],
          description:
            "Created an information architecture that serves both audiences — a clean summary view for casual investors with expandable sections revealing token-level detail, rebalancing history, and smart contract addresses for power users.",
        },
        {
          title: "One-click minting experience",
          image: PLACEHOLDERS.step[3],
          description:
            "Designed a minting flow that reduced purchasing an index token to a single transaction, with clear cost breakdowns, slippage indicators, and gas estimation — making the process feel as simple as buying a stock.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[5], PLACEHOLDERS.learning[6]],
      items: [
        {
          title: "Designing for two audiences requires layered information",
          description:
            "The key insight was that both DeFi natives and newcomers could be served by the same interface through progressive disclosure. The challenge wasn't choosing an audience — it was designing information layers that let each user find their depth.",
        },
        {
          title: "DAO design requires designing the design process",
          description:
            "Working in a DAO meant that design decisions needed community buy-in. I learned to create design proposals that communicated intent clearly enough for asynchronous governance, turning the design review into a community exercise.",
        },
      ],
    },
  },
  {
    slug: "buildable-fm",
    name: "Buildable FM",
    heroImage: PLACEHOLDERS.hero[8],
    headline: "Empowering creators with better building tools",
    role: "Product Designer",
    timeline: "2022",
    team: ["Clement Hugbo", "Buildable Team"],
    skills: [
      "Product Design",
      "Brand Identity",
      "UX Strategy",
      "Visual Design",
    ],
    overview:
      "At Buildable FM, I designed tools and infrastructure that empower creators and builders to ship products faster. The focus was on reducing the friction between idea and execution — creating intuitive interfaces for complex development workflows.",
    problem: {
      title: "Building products is still too slow and fragmented",
      description:
        "Creators and builders face a fragmented toolchain — switching between dozens of services, APIs, and platforms to build a single product. Each tool adds cognitive overhead and integration complexity that slows down the creative process.",
      question:
        "How can we design a unified platform that lets builders focus on creating instead of configuring?",
    },
    research: {
      title: "Mapping the builder workflow",
      insights: [
        { image: PLACEHOLDERS.insight[4], caption: "Builders spend 40% of their time on integration and configuration work that adds no value to their end product." },
        { image: PLACEHOLDERS.insight[5], caption: "The most productive builders have strong mental models of their toolchain — they need interfaces that match how they think, not how tools are organized." },
        { image: PLACEHOLDERS.insight[6], caption: "Documentation quality is the single biggest predictor of tool adoption — developers evaluate platforms by their docs before trying the product." },
      ],
    },
    solution: {
      title: "A builder-first platform experience",
      steps: [
        {
          title: "Visual workflow builder",
          image: PLACEHOLDERS.step[4],
          description:
            "Designed a visual interface for connecting APIs and services, letting builders see and manipulate their entire product architecture in a single view.",
        },
        {
          title: "Template-driven quick starts",
          image: PLACEHOLDERS.step[5],
          description:
            "Created a template system that let builders start from proven patterns — pre-configured workflows for common use cases that could be customized incrementally.",
        },
        {
          title: "Integrated documentation experience",
          image: PLACEHOLDERS.step[6],
          description:
            "Built documentation directly into the product interface — contextual help, inline code examples, and interactive tutorials that appear exactly when and where builders need them.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[7], PLACEHOLDERS.learning[8]],
      items: [
        {
          title: "Developer tools need developer empathy",
          description:
            "Designing for builders requires deep empathy for their workflow, mental models, and frustrations. User testing with developers revealed assumptions about 'intuitive' interfaces that were completely wrong.",
        },
        {
          title: "Speed is the feature",
          description:
            "For builder tools, the core value proposition is time saved. Every design decision was evaluated through the lens of: does this make the builder faster? If not, it doesn't belong in the product.",
        },
      ],
    },
  },
  {
    slug: "blocasset",
    name: "Blocasset",
    logoIcon: "/logos/blocasset.svg",
    heroImage: PLACEHOLDERS.hero[9],
    headline: "The marketplace revolutionizing web3 design assets",
    role: "Founder & Product Designer",
    timeline: "2022 - 2023",
    team: ["Clement Hugbo", "Web3D Team"],
    skills: [
      "Product Design",
      "Marketplace UX",
      "Brand Identity",
      "Web3",
      "Entrepreneurship",
    ],
    overview:
      "As the founder of Blocasset, I designed and built the first dedicated web3 design asset marketplace — a platform where designers create, sell, and earn cryptocurrency for digital assets tailored to the blockchain ecosystem. From concept to launch, I led product strategy, design, and the creative vision that positioned Blocasset as the go-to resource for web3 design assets.",
    problem: {
      title: "Web3 projects can't find quality design assets",
      description:
        "The rapid growth of web3 created massive demand for design assets — token icons, wallet UI kits, NFT templates, DeFi dashboards — but existing marketplaces like Envato and Creative Market offered nothing for the blockchain ecosystem. Designers building for web3 were starting from scratch every time.",
      question:
        "How can we build a marketplace that serves both the designers creating web3 assets and the projects that need them?",
    },
    research: {
      title: "Understanding the web3 design ecosystem",
      insights: [
        { image: PLACEHOLDERS.insight[7], caption: "Web3 projects launch fast and iterate faster — they need ready-made, customizable assets that can be deployed immediately, not custom design engagements that take weeks." },
        { image: PLACEHOLDERS.insight[8], caption: "Designers in the web3 space want to earn in crypto — fiat payment rails add friction and don't align with the ecosystem's values around decentralization." },
        { image: PLACEHOLDERS.insight[9], caption: "The highest-demand assets are protocol-specific — DeFi dashboards, wallet UI kits, and token launch templates that reflect the unique patterns of blockchain products." },
      ],
    },
    solution: {
      title: "A web3-native design marketplace",
      steps: [
        {
          title: "Crypto-native purchasing and earnings",
          image: PLACEHOLDERS.step[7],
          description:
            "Designed a purchasing flow where buyers pay in crypto and designers receive instant earnings to their wallet — no intermediaries, no payout delays, no fiat conversion friction.",
        },
        {
          title: "Curated asset categories for web3",
          image: PLACEHOLDERS.step[8],
          description:
            "Created a taxonomy of web3-specific asset categories — DeFi, NFT, DAO, wallet, gaming — with filters for design tool compatibility, customization level, and protocol specificity.",
        },
        {
          title: "Designer storefront experience",
          image: PLACEHOLDERS.step[9],
          description:
            "Built a storefront system that lets designers showcase their portfolio, build a following, and earn recurring revenue from their asset library — turning individual sales into sustainable creator businesses.",
        },
      ],
    },
    learnings: {
      title: "Key Takeaways",
      images: [PLACEHOLDERS.learning[9], PLACEHOLDERS.learning[0]],
      items: [
        {
          title: "Marketplaces are two products in one",
          description:
            "The buyer experience and the seller experience are fundamentally different products with different success metrics. As a founder-designer, I had to constantly balance investment between making the marketplace attractive to buyers and empowering sellers to create and earn.",
        },
        {
          title: "Community is the moat for niche marketplaces",
          description:
            "Blocasset's defensibility wasn't technology — it was the community of web3 designers we built around the platform. The marketplace became a gathering point for web3 design culture, driving organic discovery and repeat engagement.",
        },
      ],
    },
  },
];

export function getProjectBySlug(slug: string): CaseStudyData | undefined {
  return caseStudies.find((p) => p.slug === slug);
}

export function getNextProject(
  currentSlug: string
): CaseStudyData | undefined {
  const idx = caseStudies.findIndex((p) => p.slug === currentSlug);
  if (idx === -1 || idx >= caseStudies.length - 1) return caseStudies[0];
  return caseStudies[idx + 1];
}

export function getShowcaseProjects(): ShowcaseProject[] {
  return projects;
}
