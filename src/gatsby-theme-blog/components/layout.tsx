import * as React from 'react';
import { css, Themed } from 'theme-ui';
// @ts-ignore
import Header from './header';
// @ts-ignore
import useBlogThemeConfig from 'gatsby-theme-blog/src/hooks/configOptions';
// @ts-ignore
import { Helmet } from 'react-helmet';

const Layout: React.FC = ({ children, ...props }) => {
  const blogThemeConfig = useBlogThemeConfig();
  const { webfontURL } = blogThemeConfig;

  return (
    <Themed.root>
      <Helmet>
        <link rel="stylesheet" href={webfontURL} />
      </Helmet>
      <Header {...props} />
      <div>
        <div
          // @ts-ignore
          css={css({
            maxWidth: `container`,
            mx: `auto`,
            px: 3,
            py: 4,
          })}
        >
          {children}
        </div>
      </div>
    </Themed.root>
  );
};

export default Layout;
