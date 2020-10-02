import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Path, Rect } from 'react-native-svg';
import { TouchableOpacity } from 'react-native';

import { mock } from 'Helpers';
import { colors, defaults } from 'Theme';

import internalStyle from './style';

const CustomIcon = (props) => {
  const {
    bgColor,
    containerWidth,
    disabled,
    icon,
    iconColor,
    onLongPress,
    onPress,
    style,
    width
  } = props;
  const ratio = 24 / 24;
  const height = width / ratio;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        style,
        {
          width: containerWidth,
          height: containerWidth,
          ...internalStyle.centerImage
        }
      ]}>
      <Svg
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">
        {icon === 'close' && (
          <Path
            fill={iconColor}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21 11.728c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zM8.022 15.705c-.33-.33-.33-.863 0-1.193l2.785-2.784-2.785-2.784c-.33-.33-.33-.864 0-1.194.33-.33.864-.33 1.194 0L12 10.535l2.784-2.785c.33-.33.864-.33 1.193 0 .33.33.33.864 0 1.194l-2.784 2.784 2.784 2.784c.33.33.33.864 0 1.193-.33.33-.863.33-1.193 0L12 12.921l-2.784 2.784c-.33.33-.864.33-1.194 0z"
          />
        )}
        {icon === 'chevron-back' && (
          <Path
            fill={iconColor}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.889 21.422c-.05.05-.119.078-.19.078-.07 0-.139-.028-.189-.078L7.3 13.269c-.125-.124-.196-.292-.196-.468v-.6c.003-.176.074-.346.198-.473l8.206-8.148.002-.002c.05-.05.118-.078.19-.078.07 0 .138.028.188.078l1.136 1.13.004.004c.048.047.075.11.075.178 0 .067-.027.13-.075.178L9.54 12.5l7.484 7.429.002.001c.05.05.078.118.078.188s-.028.138-.078.188l-1.133 1.111-.005.005z"
          />
        )}
        {icon === 'search' && (
          <Path
            fill={iconColor}
            d="M20.946 19.706l-5.843-5.843c.906-1.172 1.397-2.605 1.397-4.113 0-1.805-.704-3.497-1.978-4.772C13.25 3.702 11.552 3 9.75 3s-3.499.704-4.772 1.978C3.702 6.25 3 7.945 3 9.75c0 1.802.704 3.499 1.978 4.772C6.25 15.798 7.945 16.5 9.75 16.5c1.508 0 2.938-.49 4.11-1.395l5.844 5.84c.017.018.037.032.06.04.022.01.046.015.07.015.025 0 .049-.005.071-.014.022-.01.043-.023.06-.04l.98-.979c.018-.017.032-.037.04-.06.01-.022.015-.046.015-.07 0-.025-.005-.049-.014-.071-.01-.022-.023-.043-.04-.06zm-7.632-6.392c-.954.952-2.219 1.476-3.564 1.476-1.346 0-2.61-.524-3.564-1.476-.952-.954-1.476-2.219-1.476-3.564 0-1.346.524-2.612 1.476-3.564C7.14 5.234 8.404 4.71 9.75 4.71c1.345 0 2.612.522 3.564 1.476S14.79 8.404 14.79 9.75c0 1.345-.524 2.612-1.476 3.564z"
          />
        )}
        {icon === 'cart' && (
          <>
            <Rect
              x={0}
              y={0}
              width={24}
              height={24}
              fill={bgColor}
              rx={(defaults.borderRadius * width) / containerWidth}
              ry={(defaults.borderRadius * width) / containerWidth}
            />
            <Path
              fill={iconColor}
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.825 3.041c-.237-.105-.516-.002-.624.234-.055.12-.055.255-.007.37H4l2.338 1.377 3.53 11.73c-1.075.556-1.527 1.858-1.005 2.955.536 1.125 1.892 1.607 3.029 1.078 1.01-.47 1.528-1.597 1.219-2.66v-.001c-.161-.537-.517-.991-.993-1.28l7.222-2.126.004-.001c.243-.093.365-.364.27-.606-.08-.206-.295-.328-.515-.293l-.007.002-8.363 2.468L7.192 4.58V4.58c-.035-.112-.111-.208-.213-.267L4.83 3.044l-.006-.003zm6.09 14.398c.597 0 1.122.388 1.293.952.203.697-.203 1.426-.91 1.628-.708.203-1.447-.201-1.65-.9-.204-.696.202-1.426.91-1.628.116-.033.236-.05.357-.052zm7.698-5.265l.107-.03v-.002c.133.452-.128.924-.582 1.055l-5.701 1.677c-.08.024-.162.036-.244.037-.381.001-.719-.245-.83-.607l-1.057-3.531-.001-.006.106-.031-.107.03c-.133-.45.129-.922.583-1.053l5.7-1.677.006-.002.03.107-.029-.107c.453-.13.93.126 1.063.576l1.06 3.527.002.004v.002l-.106.031zm-4.157-2.523l2.306-.69 1.013 3.367-2.3.679-1.02-3.356zm-2.212 4.292l-1.01-3.358 2.312-.682 1.019 3.355-2.321.685z"
            />
          </>
        )}
        {icon === 'hamburger' && (
          <>
            <Rect
              x={0}
              y={0}
              width={24}
              height={24}
              fill={bgColor}
              rx={(defaults.borderRadius * width) / containerWidth}
              ry={(defaults.borderRadius * width) / containerWidth}
            />
            <Path
              fill={iconColor}
              d="M16.618 12.735H3.592c-.327 0-.592-.336-.592-.75 0-.415.265-.75.592-.75h13.026c.327 0 .593.335.593.75 0 .414-.266.75-.593.75zM20.25 6.984H3.75c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h16.5c.414 0 .75.336.75.75s-.336.75-.75.75zM20.25 18.484H3.75c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h16.5c.414 0 .75.336.75.75s-.336.75-.75.75z"
            />
          </>
        )}
      </Svg>
    </TouchableOpacity>
  );
};

CustomIcon.propTypes = {
  bgColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  containerWidth: PropTypes.number,
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  iconColor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  style: PropTypes.any,
  width: PropTypes.number
};

CustomIcon.defaultProps = {
  bgColor: colors.input,
  borderColor: colors.white,
  icon: 'close',
  iconColor: colors.secondary,
  onLongPress: mock,
  onPress: mock,
  style: {},
  width: 24,
  containerWidth: 40
};

export default CustomIcon;
