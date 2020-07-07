//TODO refactor for touch size and image size
import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '/show/resources/theme';

import style from './style';

const Menu = (props) => {
  const { disabled, fill, touchableWidth, onPress, width } = props;
  const ratio = 1;
  const height = width / ratio;
  const touchableHeight = touchableWidth / ratio;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        ...style.centerImage,
        width: touchableWidth,
        height: touchableHeight
      }}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <Path
          d="M14.375 10.2752H0.625C0.279999 10.2752 0 9.92056 0 9.48356C0 9.04656 0.279999 8.69189 0.625 8.69189H14.375C14.72 8.69189 15 9.04656 15 9.48356C15 9.92056 14.72 10.2752 14.375 10.2752Z"
          fill={fill}
        />
        <Path
          d="M18.2083 4.20589H0.791667C0.354665 4.20589 0 3.85123 0 3.41422C0 2.97722 0.354665 2.62256 0.791667 2.62256H18.2083C18.6453 2.62256 19 2.97722 19 3.41422C19 3.85123 18.6453 4.20589 18.2083 4.20589Z"
          fill={fill}
        />
        <Path
          d="M18.2083 16.3446H0.791667C0.354665 16.3446 0 15.9899 0 15.5529C0 15.1159 0.354665 14.7612 0.791667 14.7612H18.2083C18.6453 14.7612 19 15.1159 19 15.5529C19 15.9899 18.6453 16.3446 18.2083 16.3446Z"
          fill={fill}
        />
      </Svg>
    </TouchableOpacity>
  );
};

Menu.propTypes = {
  disabled: PropTypes.bool,
  fill: PropTypes.any,
  onPress: PropTypes.func,
  touchableWidth: PropTypes.number,
  width: PropTypes.number
};

Menu.defaultProps = {
  disabled: false,
  fill: colors.primary,
  onPress: () => {},
  touchableWidth: 44,
  width: 19
};

export default Menu;
