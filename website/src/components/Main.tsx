import { Stack, StackProps, StackDivider } from '@chakra-ui/react';

export const Main = (props: StackProps) => (
  <Stack
    spacing="1.5rem"
    width="100%"
    maxWidth="75rem"
    divider={<StackDivider borderColor='gray.600' />}
    align='stretch'
    pt="8rem"
    px="1rem"
    {...props}
  />
);
