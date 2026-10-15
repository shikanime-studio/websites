import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "Shikanime Studio Docs",
  tagline: "Shikanime Studio & Labs platform documentation",
  favicon: "img/favicon.ico",
  url: "https://docs.shikanime.studio",
  baseUrl: "/",
  organizationName: "shikanime-studio",
  projectName: "websites",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  themes: ["@docusaurus/theme-mermaid"],
  markdown: {
    mermaid: true,
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/shikanime-studio/websites/tree/main/apps/docs",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Shikanime Studio",
      items: [
        {
          type: "docSidebar",
          sidebarId: "platform",
          position: "left",
          label: "Platform",
        },
        {
          type: "docSidebar",
          sidebarId: "architecture",
          position: "left",
          label: "Architecture",
        },
        {
          type: "docSidebar",
          sidebarId: "networking",
          position: "left",
          label: "Networking",
        },
        {
          type: "docSidebar",
          sidebarId: "services",
          position: "left",
          label: "Services",
        },
        {
          type: "docSidebar",
          sidebarId: "automation",
          position: "left",
          label: "Automation",
        },
        {
          type: "docSidebar",
          sidebarId: "products",
          position: "left",
          label: "Products",
        },
        {
          href: "https://github.com/shikanime-studio/websites",
          position: "right",
          label: "GitHub",
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.github,
      additionalLanguages: ["nix", "yaml", "toml", "bash", "json", "diff"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
