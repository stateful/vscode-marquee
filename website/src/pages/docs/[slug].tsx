import fs from 'fs/promises'
import path from 'path'

import NextLink from 'next/link'
import { serialize } from 'next-mdx-remote/serialize'
import { NextSeo } from 'next-seo'
import { HStack, Flex, Link } from '@chakra-ui/react'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'

import { Nav } from '../../components/Nav'
import { Container } from '../../components/Container'
import { Main } from '../../components/Main'
import { Footer } from '../../components/Footer'
import { DocsContainer } from '../../components/docs/Container'
import { DOCS_CONTENT, TITLE } from '../../constants'

const ROOT = path.join(__dirname, '..', '..', '..', '..', '..')

interface Props {
  currentSlug: string,
  currentTitle: string,
  source: MDXRemoteSerializeResult<Record<string, unknown>>
}

const Docs = ({ source, currentSlug, currentTitle }: Props) => {
  return (
    <>
      <NextSeo title={`${TITLE} - ${currentTitle}`} description="Docs • Marquee"/>
      <Container height="100vh">
        <Nav />
        <Main pt={8}>
          <HStack columnGap={30}>
            <Flex
              as='nav'
              display={{ base: 'none', sm: 'flex'}}
              flexGrow={0}
              flexShrink={0}
              flexDirection={'column'}
              h='full'
              borderRightColor={'gray.400'}
              borderRightWidth={1}
            >
              {Object.entries(DOCS_CONTENT).map(([title, { href }], i) => (
                <NextLink key={i} href={href}>
                  <Link
                    width={200}
                    display='block'
                    my={2}
                    color={href.endsWith(currentSlug) ? 'marquee' : null}
                    fontWeight={href.endsWith(currentSlug) ? 'bold' : null}
                    _hover={{
                      textDecoration: 'underline',
                      textDecorationColor: 'marquee',
                      textDecorationThickness: 2,
                      textUnderlineOffset: 3
                    }}
                  >
                    {title}
                  </Link>
                </NextLink>
              ))}
            </Flex>
            <Flex as='main' m={0} w={'full'} overflow={'auto'} flexDirection={'column'}>
              <DocsContainer source={source} />
            </Flex>
          </HStack>
        </Main>
        <Footer />
      </Container>
    </>
  )
}

export async function getStaticProps ({ params }) {
  const [title, meta] = Object.entries(DOCS_CONTENT)
    .find(([, d]) => d.href.replace('/docs/', '') === params.slug)!
  const docPath = path.join(ROOT, meta.content)
  const source = (await fs.readFile(docPath)).toString()
  const mdxSource = await serialize(source)
  const props: Props = {
    source: mdxSource,
    currentSlug: params.slug,
    currentTitle: title
  }
  return { props }
}

export async function getStaticPaths () {
  return {
    paths: Object.values(DOCS_CONTENT).map((doc) => (
      { params: { slug: doc.href.replace('/docs/', '') } }
    )),
    fallback: false
  }
}

export default Docs
