import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Svg, { Polygon } from 'react-native-svg';

import { useTheme } from 'Containers';

const CurrentLocation = props => {
  const { colors } = useTheme();
  const {
    borderColor = colors.white,
    heading,
    iconColor = colors.primary,
    mapNoTrackingHeading,
    shouldTrackHeading,
    width
  } = props;
  const ratio = 68 / 68;
  const height = width / ratio;

  const rotateHeading = shouldTrackHeading ? 0 : heading - mapNoTrackingHeading;
  const style = {
    transform: [{ rotateZ: `${rotateHeading}deg` }]
  };

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 1000 1000"
      fill="none"
      style={style}
      xmlns="http://www.w3.org/2000/svg">
      <Polygon
        points="500,10 76.2,990 500,777 923.8,990 "
        fill={iconColor}
        stroke={borderColor}
        strokeWidth={30}
      />
    </Svg>
  );
};

CurrentLocation.propTypes = {
  bgColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  heading: PropTypes.number,
  iconColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  mapNoTrackingHeading: PropTypes.number,
  shouldTrackHeading: PropTypes.bool,
  width: PropTypes.number
};

CurrentLocation.defaultProps = {
  heading: 0,
  mapNoTrackingHeading: 0,
  shouldTrackHeading: false,
  width: 33
};

export default connect(
  state => ({
    heading: state.device?.position?.heading,
    mapNoTrackingHeading: state.device?.mapNoTrackingHeading,
    shouldTrackHeading: state.device?.shouldTrackHeading
  }),
  {}
)(CurrentLocation);
