import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import dark from 'react-syntax-highlighter/dist/cjs/styles/prism/atom-dark';
import light from 'react-syntax-highlighter/dist/cjs/styles/prism/nord';
import { Heading, Box, UnorderedList, OrderedList, useColorMode, Link } from "@chakra-ui/react";
import React, { ReactElement } from 'react';

const BLACKLIST_LINKS = [
  'badge.svg',
  'apphb.com'
];

const getNodeText = node => {
  if (['string', 'number'].includes(typeof node)) {
    return node;
  }
  if (node instanceof Array) {
    return node.map(getNodeText).join('');
  }
  if (typeof node === 'object' && node) {
    return getNodeText(node.props.children);
  }
};

const h1 = ({ children }: any) => (
  <Heading as='h1' mt={10} mb={2}>{Array.isArray(children) ? children[0] : children}</Heading>
);

const h2 = ({ children }: any) => (
  <Heading as='h2' fontSize={'3xl'} mt={8} mb={1}>{children}</Heading>
);

const h3 = ({ children }: any) => (
  <Heading as='h3' fontSize={'large'} mt={4} mb={2}>{children}</Heading>
);

const h4 = ({ children }: any) => (
  <Heading as='h4' fontSize={'medium'}>{children}</Heading>
);

const p = ({ children }: any) => (
  <Box my={5}>{children}</Box>
);

const ul = ({ children }: any) => (
  <UnorderedList>{children}</UnorderedList>
);

const ol = ({ children }: any) => (
  <OrderedList>{children}</OrderedList>
);

const a = (elem: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
  const children = elem.children as ReactElement<{src: string}>
  /**
   * ignore readme badges of all sorts
   */
  if (BLACKLIST_LINKS.find((bl) => (
    children &&
    children.props &&
    typeof children.props.src === 'string' &&
    children.props.src.includes(bl)))
  ) {
    return null;
  }
  return <Link color={'marquee'} _hover={{ textDecoration: 'underline' }} {...elem} />;
};

const pre = ({ children }: any) => {
  const { colorMode } = useColorMode();
  const style = { dark, light }[colorMode];
  return (
    <SyntaxHighlighter
      showLineNumbers={true}
      customStyle={{ borderRadius: '10px' }}
      language="typescript"
      style={style}
    >
      {getNodeText(children)}
    </SyntaxHighlighter>
  );
};

export default { h1, h2, h3, h4, p, ul, ol, pre, a };
