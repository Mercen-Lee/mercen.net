export type Locale = "ko" | "en";

export const defaultLocale: Locale = "ko";

const ui = {
  ko: {
    htmlLang: "ko",
    ogLocale: "ko_KR",
    alternateOgLocale: "en_US",
    path: "/",
    siteTitleRole: "소프트웨어 개발자",
    siteDescription:
      "소프트웨어 개발자 이석호의 포트폴리오. 실서비스 제품 개발, 웹/앱/API/인프라 프로젝트와 주요 경력, 수상, 자격 이력을 소개합니다.",
    keywords: [
      "이석호",
      "mercen",
      "소프트웨어 개발자",
      "포트폴리오",
      "웹 개발",
      "앱 개발",
      "API 개발",
      "인프라",
      "TypeScript",
      "Swift",
      "Flutter",
      "Rust",
    ],
    navLabel: "주요 섹션",
    navItems: [
      { href: "#intro", label: "소개" },
      { href: "#education", label: "학력" },
      { href: "#career", label: "경력" },
      { href: "#projects", label: "프로젝트" },
      { href: "#awards", label: "수상" },
      { href: "#licenses", label: "자격" },
    ],
    languageSelectorLabel: "언어 선택",
    profileLabel: "프로필",
    profilePhotoAlt: (name: string) => `${name} 프로필 사진`,
    achievementsLabel: "주요 성과",
    contactLinksLabel: "연락처와 링크",
    galleryLabel: "개인 이미지 슬라이드",
    galleryImageAlt: (name: string, description: string) =>
      `${name} 개인 이미지: ${description}`,
    galleryItems: [
      { filename: "apple-park", description: "Apple Park 초대" },
      { filename: "timcook", description: "팀 쿡 Apple CEO와의 만남" },
      {
        filename: "wwdc24",
        description: "WWDC24에 Swift 공모전 수상자 자격으로 참가",
      },
      { filename: "kbs", description: "KBS 스카우트 5 얼리어잡터 출연" },
      { filename: "ducami", description: "교육봉사동아리 DUCAMI 활동" },
      { filename: "ict-expo", description: "ICT 융합 엑스포 출품" },
      { filename: "softwave", description: "대한민국 소프트웨어대전 출품" },
      { filename: "impact", description: "Impact Lounge 연사" },
      { filename: "ai-expo", description: "국제인공지능대전 출품" },
    ],
    sections: {
      education: "학력",
      career: "경력",
      awards: "수상이력",
      projects: "프로젝트",
      licenses: "자격 및 점수",
    },
    projectGroups: {
      company: "회사 프로젝트",
      team: "팀 프로젝트",
      personal: "개인 프로젝트",
    },
    projectCount: (count: number) => `${count}개`,
    majorContributionsLabel: "주요 기여",
    awardsListLabel: "전체 수상이력",
    licensesListLabel: "전체 자격 및 점수",
    logoAlt: (name: string) => `${name} 로고`,
    projectScreenshotsLabel: (title: string) => `${title} 스크린샷과 목업`,
    projectScreenshotAlt: (title: string, index: number) =>
      `${title} 스크린샷 ${index}`,
    sourceCodeScopeAria: "소스 코드 공개 범위",
    sourceCodeScopeLabel: "공개 범위",
    problemSolutions: {
      sectionLabel: "문제와 해결",
      heading: "문제와 해결",
      problem: "문제",
      solution: "해결",
    },
    ogImageAlt: (name: string) => `${name} 포트폴리오 미리보기 이미지`,
    winnerLevel: "Winner",
    achievements: {
      gifted: "대구교육대학교 정보영재교육원 수료",
      isef: "국제과학기술경진대회 임베디드시스템 부문 Finalist",
      swiftChallenge: (count: number) =>
        `${count}년 연속 Swift Student Challenge Winner 선정`,
    },
    resume: {
      downloadTitle: "이력서 다운로드",
      downloadLink: "이력서 다운로드",
      jobTitle: "소프트웨어 개발자",
      documentLabel: "이력서",
      sections: {
        primaryStacks: "주요 개발 스택",
        about: "소개",
        education: "학력",
        career: "경력",
        teamProjects: "팀 프로젝트",
        personalProjects: "개인 프로젝트",
        awards: "수상이력",
        licenses: "자격 및 점수",
      },
      projectRole: "내 역할",
      projectContribution: "기여",
      roleSectionHeading: "내 역할",
      resultsSectionHeading: "수치화된 성과",
    },
  },
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    alternateOgLocale: "ko_KR",
    path: "/en/",
    siteTitleRole: "Software Developer",
    siteDescription:
      "Seokho Lee's software development portfolio, featuring production products, web, app, API, and infrastructure projects, along with professional experience, awards, and certifications.",
    keywords: [
      "Seokho Lee",
      "mercen",
      "software developer",
      "portfolio",
      "web development",
      "app development",
      "API development",
      "infrastructure",
      "TypeScript",
      "Swift",
      "Flutter",
      "Rust",
    ],
    navLabel: "Main sections",
    navItems: [
      { href: "#intro", label: "About" },
      { href: "#education", label: "Education" },
      { href: "#career", label: "Experience" },
      { href: "#projects", label: "Projects" },
      { href: "#awards", label: "Awards" },
      { href: "#licenses", label: "Credentials" },
    ],
    languageSelectorLabel: "Language selector",
    profileLabel: "Profile",
    profilePhotoAlt: (name: string) => `Profile photo of ${name}`,
    achievementsLabel: "Key achievements",
    contactLinksLabel: "Contact details and links",
    galleryLabel: "Personal photo gallery",
    galleryImageAlt: (name: string, description: string) =>
      `${name}: ${description}`,
    galleryItems: [
      { filename: "apple-park", description: "Invited to Apple Park" },
      { filename: "timcook", description: "Meeting Tim Cook, CEO of Apple" },
      {
        filename: "wwdc24",
        description: "Attending WWDC24 as a Swift Student Challenge winner",
      },
      { filename: "kbs", description: "Appearing on the KBS program Scout 5" },
      {
        filename: "ducami",
        description: "Volunteering with the DUCAMI education club",
      },
      {
        filename: "ict-expo",
        description: "Exhibiting at the ICT Convergence Expo",
      },
      {
        filename: "softwave",
        description: "Exhibiting at Korea's SoftWave software expo",
      },
      { filename: "impact", description: "Speaking at Impact Lounge" },
      { filename: "ai-expo", description: "Exhibiting at AI EXPO KOREA" },
    ],
    sections: {
      education: "Education",
      career: "Experience",
      awards: "Awards",
      projects: "Projects",
      licenses: "Credentials and Scores",
    },
    projectGroups: {
      company: "Company Projects",
      team: "Team Projects",
      personal: "Personal Projects",
    },
    projectCount: (count: number) =>
      `${count} project${count === 1 ? "" : "s"}`,
    majorContributionsLabel: "Key contributions",
    awardsListLabel: "Complete award history",
    licensesListLabel: "Complete credentials and scores",
    logoAlt: (name: string) => `${name} logo`,
    projectScreenshotsLabel: (title: string) =>
      `${title} screenshots and mockups`,
    projectScreenshotAlt: (title: string, index: number) =>
      `${title} screenshot ${index}`,
    sourceCodeScopeAria: "Source code availability",
    sourceCodeScopeLabel: "Availability",
    problemSolutions: {
      sectionLabel: "Problems and solutions",
      heading: "Problems and Solutions",
      problem: "Problem",
      solution: "Solution",
    },
    ogImageAlt: (name: string) => `Portfolio preview image for ${name}`,
    winnerLevel: "Winner",
    achievements: {
      gifted:
        "Completed the Gifted Institute for Information Technology at DNUE",
      isef: "Finalist in Embedded Systems at the ISEF",
      swiftChallenge: (count: number) =>
        `Apple WWDC Swift Student Challenge winner for ${count} consecutive years`,
    },
    resume: {
      downloadTitle: "Download Resume",
      downloadLink: "Download Resume",
      jobTitle: "Software Developer",
      documentLabel: "Resume",
      sections: {
        primaryStacks: "Core Development Stack",
        about: "About",
        education: "Education",
        career: "Experience",
        teamProjects: "Team Projects",
        personalProjects: "Personal Projects",
        awards: "Awards",
        licenses: "Credentials and Scores",
      },
      projectRole: "My Role",
      projectContribution: "Contributions",
      roleSectionHeading: "My Role",
      resultsSectionHeading: "Quantified Results",
    },
  },
} as const;

export function getUi(locale: Locale) {
  return ui[locale];
}

export function localePath(locale: Locale): string {
  return ui[locale].path;
}
