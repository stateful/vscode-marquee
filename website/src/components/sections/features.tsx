import { CheckCircleIcon, EditIcon, CopyIcon } from '@chakra-ui/icons'
import { SimpleGrid, Box, Flex, Heading, IconButton } from '@chakra-ui/react'

const features = [{
  title: 'Productivity Tools',
  icon: <EditIcon color={'whiteAlpha.900'} />,
  description: <Box>
    Keep track of workspace specific context through a better
    workspace manager, flexible todo's, a code snippet stash,
    and powerful wysiwyg notes widget.
  </Box>
}, {
  title: 'News and Trending',
  icon: <CopyIcon color={'whiteAlpha.900'} />,
  description: <Box>
    Stay on top of what's going on outside your editor, by quickly checking
    trending repo's on Github and the HackerNews feed. Not to mention
    planning your breaks by checking the weather widget.
  </Box>
}, {
  title: 'Deeply Integrated',
  icon: <CheckCircleIcon color={'whiteAlpha.900'} />,
  description: <Box>
    Manage all your Marquee data directly through the native tree view
    to avoid leaving the editor. You can also automatically generate
    todo's from code comments and create or insert code snippets with
  </Box>
}]

export const Features = () => (
  <SimpleGrid minChildWidth={300} spacingX={{ sm: 10, md: 20 }} columns={{ sm: 1, md: 1}}>
    {features.map((f, i) => (
      <Flex
        key={i}
        mb={{ base: 10 }}
        flexFlow={{ base: 'row wrap', sm: 'wrap' }}
        flexDirection={{ base: 'row', sm: 'column' }}
      >
        <IconButton
          as='div'
          aria-label={f.title}
          bg={'marquee'}
          icon={f.icon}
          mb={5}
          mr={5}
          _hover={{}}
          _active={{}}
          width={10} 
          height={10} 
          p={3}
          size="large" />
        <Heading w={{ base: 'auto', sm: 'full' }} mb={{ base: 4 }} as="h3" fontSize="2em">{f.title}</Heading>
        {f.description}
      </Flex>
    ))}
  </SimpleGrid>
)
