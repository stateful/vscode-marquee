import { motion } from 'framer-motion'
import { Flex, Box, Heading, Image, Link, Icon, useColorMode, Text, Button, useColorModeValue } from '@chakra-ui/react'
import { SiDiscord } from 'react-icons/si'

import { MAIN_COLOR, HERO_BG_COLOR } from '../constants'

export const Hero = () => {
  const { colorMode } = useColorMode()
  return (
    <Flex
      bg={HERO_BG_COLOR[colorMode]}
      alignItems="center"
      flexDirection={'column'}
      w={'full'}
      py={12}
    >
      <Box
        bgGradient={`linear(to-l, #7928CA, ${MAIN_COLOR})`}
        bgClip="text"
      >
        <Heading as="h1" fontSize={{ base: '4em', sm: '6em', md: '9em'}}>
          Marquee
        </Heading>
      </Box>
      <Box my={6} maxWidth={'1200px'}>
        <Heading as="h2" fontSize={{ base: '1.2em', md: '1.8em'}} textAlign={'center'} mx={5} mb={{ base: 5, sm: 0 }}>
          Marquee is a <Text as="span" color={'marquee'} d={'inline'}>VS Code extension</Text> that
          brings a fully extensible homescreen right into your favorite IDE for minimal
          context switching.
        </Heading>
        <Text
          display={{ base: 'none', sm: 'block' }}
          fontSize={'small'}
          my={3}
          textAlign={'center'}
        >
          Install via:
        </Text>
        <Flex
          display={{ base: 'none', sm: 'flex' }}
          align={'center'}
          flexFlow={{ base: 'wrap', sm: 'nowrap' }}
          justifyContent={'center'}
          flexDirection={'row'}
        >
          <Button
            as="a"
            mx={3}
            width={{md:360}}
            px={{ base: 10 }}
            fontSize={'sm'}
            fontWeight={600}
            color={'white'}
            bg={'marquee'}
            href={'vscode:extension/stateful.marquee'}
            _hover={{
              bg: 'pink.300',
            }}>
            VS Code Marketplace
          </Button>
          <Text fontSize={'small'}>or</Text>
          <Text
            mx={3}
            fontFamily={'monospace'}
            backgroundColor={useColorModeValue('gray.300', 'whiteAlpha.200')}
            p={3}
            rounded={8}
            width={{md:360}}
          >
            $ <Text as='span' d={'inline'} color={'red'}>code</Text> --install-extension stateful.marquee
          </Text>
        </Flex>
        <Flex
          display={{ base: 'none', sm: 'flex' }}
          align={'center'}
          flexFlow={{ base: 'wrap', sm: 'nowrap' }}
          justifyContent={'center'}
          flexDirection={'row'}
        >
          <Link
            href="https://discord.gg/BQm8zRCBUY"
            isExternal
            bottom={0}
            display={'flex'}
            alignItems={'center'}
            lineHeight={'4em'}
            position={'relative'}
            color={useColorModeValue('gray.600', 'gray.400')}
            transitionProperty={'color, bottom'}
            transitionDuration={'0.5s'}
            _hover={{ color: 'marquee', bottom: '5px' }}
          >
              Join Discord
            <Icon mx={2} boxSize={5} as={SiDiscord} />
          </Link>
        </Flex>
      </Box>
      <Box maxWidth={1000} width={{ base: 370, xs: 480, sm: 700, md: 1000 }}>
        <motion.div
          initial={{ translateY: 100 }}
          animate={{ translateY: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'relative'
          }}
        >
          <Image src="/assets/laptop.png" position={'relative'} zIndex={10} />
          <Box
            h={'90%'}
            overflow={'hidden'}
            position={'absolute'}
            top={0}
            zIndex={0}
          >
            <Image
              src="/assets/screenshot.gif"
              margin={{ base: '20px 51px', xs: '27px 67px', sm: '37px 95px', md: '53px 137px'}}
              w={{ base: 268, xs: 346, sm: 510, md: 726 }}
            />
          </Box>
        </motion.div>
      </Box>
    </Flex>
  )
}
