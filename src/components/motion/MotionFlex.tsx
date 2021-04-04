import { Flex, FlexProps } from '@chakra-ui/react';
import { HTMLMotionProps, motion } from 'framer-motion';

import { Merge } from '../../types/Merge';

export type MotionFlexProps = Merge<FlexProps, HTMLMotionProps<'div'>>;

const MotionFlex: React.FC<MotionFlexProps> = motion(Flex);

export default MotionFlex;
