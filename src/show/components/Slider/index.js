import React from 'react';
import PropTypes from 'prop-types';
import { Slider as SliderRN } from '@miblanchard/react-native-slider';

import { mock } from 'Helpers';

import { colors } from 'Theme';

import style from './style';

const Slider = (props) => {
  const { maximumValue, minimumValue, onSlidingComplete, step, value } = props;

  return (
    <SliderRN
      animateTransitions
      maximumTrackTintColor={colors.secondary}
      maximumValue={maximumValue}
      minimumTrackTintColor={colors.primary}
      minimumValue={minimumValue}
      onSlidingComplete={onSlidingComplete}
      step={step}
      thumbStyle={style.thumbStyle}
      trackStyle={style.trackStyle}
      value={value}
      containerStyle={style.containerStyle}
    />
  );
};

Slider.defaultProps = {
  maximumValue: 1,
  minimumValue: 0,
  title: '',
  value: false,
  onSlidingComplete: mock,
  step: 0
};

Slider.propTypes = {
  maximumValue: PropTypes.number,
  minimumValue: PropTypes.number,
  title: PropTypes.string,
  value: PropTypes.number,
  onSlidingComplete: PropTypes.func,
  step: PropTypes.number
};

export default Slider;
