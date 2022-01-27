import { Nav } from '../components/Nav';
import { Container } from '../components/Container';
import { Footer } from '../components/Footer';
import { Center, Heading, Text, Link } from '@chakra-ui/react';

const Index = () => (
  <Container height="100vh">
    <Nav />
    <Center h={'full'} flexDirection={'column'}>
      <Heading color={'marquee'} fontSize={'9xl'}>404</Heading>
      <Text fontSize={'3xl'} textAlign={'center'}>
        Oupsi, you've found a<br />
        hole in our <Link href='/' as='a' color={'marquee'} _hover={{}}>marquee</Link>!</Text>
    </Center>
    <Footer />
  </Container>
);

export default Index;
