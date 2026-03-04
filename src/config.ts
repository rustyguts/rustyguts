export const SITE = {
  website: "https://rustyguts.dev",
  author: "Brendan Kennedy",
  profile: "https://github.com/rustyguts",
  desc: "Chicken wings and computer things",
  title: "rustyguts",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/rustyguts/rustyguts.dev/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "America/New_York",
} as const;
