import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://rustyguts.dev", // replace this with your deployed domain
  author: "Brendan Kennedy",
  desc: "Chicken wings and computer things",
  title: "rustyguts",
  // ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/rustyguts",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
];
