import Script from 'next/script';
import { Flex, FlexProps, Text, Link, Image, useColorModeValue, Icon, Box } from '@chakra-ui/react';
import { SiGithub, SiTwitter, SiDiscord, SiGitter } from "react-icons/si";

import { GOOGLE_ANALYTICS_ID, IS_PROD } from '../constants';

const socialLinks = [{
  href: 'https://twitter.com/statefulhq',
  icon: SiTwitter
}, {
  href: 'https://github.com/stateful/marquee',
  icon: SiGithub
}, {
  href: 'https://discord.com/channels/878764303052865537/900787619728871484',
  icon: SiDiscord
}, {
  href: 'https://gitter.im/stateful/marquee',
  icon: SiGitter
}];

export const Footer = (props: FlexProps) => {
  return (
    <>
      <Flex
        as="footer"
        flexDirection={'column'}
        align={'center'}
        py="8rem"
        {...props}
      >
        <Box mb={3} justifyContent={'space-around'}>
          {socialLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              isExternal
              bottom={0}
              display={'inline-block'}
              lineHeight={'2em'}
              position={'relative'}
              color={useColorModeValue('gray.600', "gray.400")}
              transitionProperty={'color, bottom'}
              transitionDuration={'0.5s'}
              _hover={{ color: 'marquee', bottom: '5px' }}
            >
              <Icon mx={2} boxSize={5} as={link.icon} />
            </Link>
          ))}
        </Box>
        <Text mb={2} color={'gray.500'}>&copy; 2022 Stateful, Inc. All rights reserved.</Text>
        <Link href='https://stateful.com' isExternal>
          <Image
            w={100}
            filter={'grayscale(100%)'}
            src={useColorModeValue("/assets/logo.png", "/assets/logo_white.png")}
            padding={'10px'}
            width={'200px'}
          />
        </Link>
      </Flex>
      {IS_PROD && (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} />
          <Script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ANALYTICS_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
};
