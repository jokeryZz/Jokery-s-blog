import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: "Jokery's Blog",
    author: 'Jokery.zhou',
    description: 'A collection of my thoughts and writings.',
    // siteUrl: "https://amberley.blog/",
    social: [
      {
        name: 'github',
        url: 'https://github.com/jokeryZz',
      },
    ],
  },
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {
        // basePath defaults to `/`
      },
    },
  ],
};

export default config;
