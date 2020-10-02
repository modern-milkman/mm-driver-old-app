import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Circle } from 'react-native-svg';

import { colors } from 'Theme';

const CurrentLocation = (props) => {
  const { bgColor, borderColor, iconColor, width } = props;
  const ratio = 68 / 68;
  const height = width / ratio;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 68 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Circle cx={34} cy={34} r={34} fill={bgColor} strokeWidth={0} />
      <Circle
        cx={34}
        cy={34}
        r={15}
        stroke={borderColor}
        strokeWidth={3}
        fill={iconColor}
      />
    </Svg>
  );
};

CurrentLocation.propTypes = {
  bgColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  iconColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.number
};

CurrentLocation.defaultProps = {
  bgColor: colors.input,
  borderColor: colors.white,
  iconColor: colors.primary,
  width: 33
};

export default CurrentLocation;
