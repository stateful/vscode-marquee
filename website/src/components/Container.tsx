import { Flex, useColorMode, FlexProps } from '@chakra-ui/react';
import { BG_COLOR, COLOR } from '../constants';

export const Container = (props: FlexProps) => {
  const { colorMode } = useColorMode();
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      bg={BG_COLOR[colorMode]}
      color={COLOR[colorMode]}
      {...props}
    />
  );
};
