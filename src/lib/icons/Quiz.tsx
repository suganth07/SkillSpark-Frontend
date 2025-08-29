import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface QuizIconProps {
  size?: number;
  color?: string;
}

const Quiz = ({ size = 24, color = '#000' }: QuizIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Quiz;
