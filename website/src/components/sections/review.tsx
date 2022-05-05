import { Avatar, Box, Flex, Stat, StatLabel, StatNumber, Text, useColorModeValue } from '@chakra-ui/react'

export const Review = () => (
  <Flex
    my={{ base: 10, md: 20 }}
    align={'center'}
    flexDirection={{ base: 'column', md: 'row'}}
    justifyContent={'space-between'}
  >
    <Box my={10}>
      <Text as="div" fontSize={'4xl'}>
        Supercharge your VS Code
        <Text as='p' fontWeight={'bold'} color={'marquee'}>Just two clicks away...</Text>
      </Text>
    </Box>
    <Flex
      boxShadow={'xl'}
      maxWidth={{ base: '100%', sm: '75%', md: '50%' }}
      minW={'300px'}
      background={useColorModeValue('gray.200', 'gray.700')}
      rounded={30}
      borderBottomLeftRadius={0}
      flexDirection={'row'}
      px={5}
      py={10}
    >
      <Box px={3}>
        <Flex flexDirection={'row'} mb={4}>
          <Avatar name="Trevor Little" size='lg' />
          <Stat mx={5}>
            <StatNumber>Trevor Little</StatNumber>
            <StatLabel>22/07/2020</StatLabel>
          </Stat>
        </Flex>
        <Text>
          The scratch and todo sections are fantastic! I used to have a markdown
          tab opened for my scratch/notes and I've tried some todo extensions but
          never stuck with one. This keeps everything together nicely. It's a
          good productivity boost.
        </Text>
      </Box>
    </Flex>
  </Flex>
)
