import { Text, TextProps } from '@chakra-ui/react';
import { HTMLMotionProps, motion } from 'framer-motion';

import { Merge } from '../../types/Merge';

type Props = Merge<TextProps, HTMLMotionProps<'div'>>;

const MotionText: React.FC<Props> = motion(Text);

export default MotionText;
