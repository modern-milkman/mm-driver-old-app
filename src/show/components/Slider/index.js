//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { Slider as SliderRN } from '@miblanchard/react-native-slider';

import { mock } from 'Helpers';

import { colors } from 'Theme';

import style from './style';

const Slider = props => {
  const {
    disabled,
    maximumValue,
    minimumValue,
    onSlidingComplete,
    step,
    testID,
    value
  } = props;

  return (
    <SliderRN
      animateTransitions
      disabled={disabled}
      maximumTrackTintColor={disabled ? colors.input : colors.secondary}
      maximumValue={maximumValue}
      minimumTrackTintColor={disabled ? colors.input : colors.primary}
      minimumValue={minimumValue}
      onSlidingComplete={onSlidingComplete}
      step={step}
      thumbStyle={{ ...style.thumbStyle, ...(disabled && style.disabled) }}
      trackStyle={style.trackStyle}
      value={value}
      containerStyle={style.containerStyle}
      testID={testID}
    />
  );
};

Slider.defaultProps = {
  disabled: false,
  maximumValue: 1,
  minimumValue: 0,
  title: '',
  value: false,
  onSlidingComplete: mock,
  step: 0
};

Slider.propTypes = {
  disabled: PropTypes.bool,
  maximumValue: PropTypes.number,
  minimumValue: PropTypes.number,
  testID: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.number,
  onSlidingComplete: PropTypes.func,
  step: PropTypes.number
};

export default Slider;
