import { Nav } from '../components/Nav';
import { Hero } from '../components/Hero';
import { Container } from '../components/Container';
import { Main } from '../components/Main';
import { Features } from '../components/sections/features';
import { Widgets } from '../components/sections/widgets';
import { Review } from '../components/sections/review';
import { Footer } from '../components/Footer';

const Index = () => (
  <Container height="100vh">
    <Nav />
    <Hero />
    <Main>
      <Features />
      <Widgets />
      <Review />
    </Main>
    <Footer />
  </Container>
);

export default Index;
