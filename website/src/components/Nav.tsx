import NextLink from 'next/link'
import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Image,
  Switch,
  Link,
  useColorMode,
  useDisclosure,
  IconButton,
  Collapse,
  Stack,
  Icon
} from '@chakra-ui/react'
import { BG_COLOR, HERO_BG_COLOR, NAVIGATION, Navigation } from '../constants'
import { ChevronDownIcon, CloseIcon, HamburgerIcon } from '@chakra-ui/icons'

export const Nav = () => {
  const { isOpen, onToggle } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <Box as='nav' width={'100%'}>
      <Flex
        bg={BG_COLOR[colorMode]}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex
          my={'0'}
          mx={'auto'}
          align={'center'}
          maxWidth={'75rem'}
          justifyContent={'space-between'}
          flex={{ base: 1 }}
          justify={{ base: 'center', md: 'left' }}
        >
          <Link href="https://stateful.com" isExternal>
            <Image
              src={useColorModeValue('/assets/logo.png', '/assets/logo_white.png')}
              padding={'10px'}
              width={'200px'}
            />
          </Link>
          <Flex ml={'auto'} display={{ base: 'flex', sm: 'none' }}>
            <IconButton
              onClick={onToggle}
              icon={ isOpen ? <CloseIcon w={15} h={15} /> : <HamburgerIcon w={30} h={30} /> }
              variant={'outline'}
              aria-label={'Toggle Navigation'}
              size="large" />
          </Flex>
          <Flex align={'center'} justify={{ base: 'right' }} ml={10}>
            <Box display={{ base: 'none', sm: 'flex' }}>
              {Object.entries(NAVIGATION).map(([title, { href }], i) => (
                href.startsWith('http')
                  ? <Button
                    key={i}
                    as="a"
                    href={href}
                    bg={BG_COLOR[colorMode]}
                    ml={2}
                    target={'_blank'}
                    rel='noopener noreferrer'
                  >
                    {title}
                  </Button>
                  : <NextLink key={i} href={href} passHref>
                    <Button
                      as="a"
                      bg={BG_COLOR[colorMode]}
                      ml={2}
                    >
                      {title}
                    </Button>
                  </NextLink>
              ))}
            </Box>
            <Flex ml={{ base: -5, sm: 2}}>
              <Button
                as="a"
                px={{ base: 10 }}
                mx={{ base: 4, md: 0 }}
                flex={{ base: 1, md: 0 }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'marquee'}
                href={'vscode:extension/stateful.marquee'}
                _hover={{
                  bg: 'pink.300',
                }}
                display={{ base: 'none', sm: 'flex' }}
              >
                Install
              </Button>
            </Flex>
            <Flex>
              <Switch
                size='lg'
                colorScheme='whiteAlpha'
                isChecked={isDark}
                onChange={toggleColorMode}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  )
}

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Navigation;
  href?: string;
}

const MobileNav = () => {
  const { colorMode } = useColorMode()
  return (
    <Stack
      bg={HERO_BG_COLOR[colorMode]}
      p={4}
      display={{ md: 'none' }}>
      {Object.entries(NAVIGATION).map(([label, { href, children }], i) => (
        <MobileNavItem key={i} label={label} href={href} children={children} />
      ))}
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        px={3}
        as={Link}
        fontWeight={600}
        href={children ? '#' : href}
        justify={'space-between'}
        align={'center'}
        color={useColorModeValue('gray.600', 'gray.200')}
        _hover={{
          textDecoration: 'none',
          color: 'marquee'
        }}>
        {label}
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>
      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          ml={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            Object.entries(children).map(([label, { href }], i) => (
              <Link key={i} py={2} href={href} _hover={{
                textDecoration: 'none',
                color: 'marquee'
              }}>
                {label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}
