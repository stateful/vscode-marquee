import NextLink from 'next/link'
import { Box, Heading, Image, Link, SimpleGrid, SkeletonCircle, SkeletonText } from '@chakra-ui/react'

const widgets = [{
  image: 'projects.png',
  heading: 'Projects',
  description: <Box>
    A better way to search, sort, organize and switch between workspaces
    and projects. We automatically order projects based on associated
    Marquee artifacts.
  </Box>
}, {
  image: 'weather.png',
  heading: 'Weather',
  description: <Box>
    Keep an eye on the local weather to know when it's time to head
    outside for a break, or to organize your day as the forecast changes.
  </Box>
}, {
  image: 'news.png',
  heading: 'News',
  description: <Box>
    See if there's anything worth reading in real-time without leaving
    your editor when you need a break.
  </Box>
}, {
  image: 'snippets.png',
  heading: 'Snippets',
  description: <Box>
    The inter-workspace smart clipboard for your thoughts, code snippets,
    logs, or terminal traces. Anything you want to recall later.
  </Box>
}, {
  image: 'todo.png',
  heading: 'Todo',
  description: <Box>
    Keep track of workspace-specific todos. Create, archive and complete
    todos from the todo widget or the tree view while you are deep in code.
  </Box>
}, {
  image: 'notes.png',
  heading: 'Notes',
  description: <Box>
    Create several notes for your development process that help you get back
    to information whenever needed and never forget a single thing again.
  </Box>
}, {
  image: 'github.png',
  heading: 'GitHub',
  description: <Box>
    Search for popular projects on GitHub to find code needed for your project.
  </Box>
}]

export const Widgets = () => (
  <Box mt={10}>
    <Heading>Widgets</Heading>
    <Heading
      as='h3'
      fontSize={'1.5em'}
      mt={5}
      mb={10}
    >
      The ever growing collection of productivity widgets you
      can bring into your Marquee workspaces.
    </Heading>
    <SimpleGrid minChildWidth={250} spacingX={{ sm: 10, md: 20 }} columns={{ sm: 1, md: 3}}>
      {widgets.map((w, i) => (
        <Box mb={10} key={i}>
          <Image src={`/assets/widgets/${w.image}`} rounded={10} />
          <Heading color={'marquee'} my={{ base: 4 }} as="h3" fontSize="1.5em">
            {w.heading}
          </Heading>
          {w.description}
        </Box>
      ))}

      {/* custom widget */}
      <Box mb={10} key={widgets.length}>
        <Box height={263} rounded={10} padding={6} boxShadow='lg' bg='white'>
          <SkeletonCircle size='10' />
          <SkeletonText mt='4' noOfLines={4} spacing='4' />
        </Box>
        <Heading fontFamily={'monospace'} color={'marquee'} my={{ base: 4 }} as="h3" fontSize="1.5em">
          {'<insert widget here />'}
        </Heading>
        <Box>
          Everyone can build their own widget and add it to Marquee. Check
          out <NextLink href="/docs" passHref><Link color={'marquee'}>our docs</Link></NextLink> for more information.
        </Box>
      </Box>
    </SimpleGrid>
  </Box>
)
