/*
GUIDELINES
iOS:      https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/typography/
Android:  https://material.io/guidelines/style/typography.html#typography-styles
*/
import React from 'react';
import PropTypes from 'prop-types';
import { Text as RNText, Platform } from 'react-native';
import { material, human } from 'react-native-typography';

import { colors } from 'Resources/theme';

import Types from './Types';
import style from './style';

const currentPlatform = Platform.OS;

const Text = (props) => {
  const {
    align,
    color,
    flex,
    noMargin,
    noMarginLeft,
    noMarginVertical,
    noPadding,
    type,
    weight
  } = props;
  let humanoidMaterialStyles = null;
  switch (type) {
    case Types.CAPTION:
      humanoidMaterialStyles =
        currentPlatform === 'ios' ? human.caption2 : material.caption;
      break;

    case Types.CALLOUT:
      humanoidMaterialStyles =
        currentPlatform === 'ios' ? human.callout : material.subtitle1;
      break;

    case Types.SUBHEAD:
      humanoidMaterialStyles =
        currentPlatform === 'ios' ? human.subhead : material.subtitle2;
      break;

    case Types.FOOTNOTE:
      humanoidMaterialStyles =
        currentPlatform === 'ios' ? human.footnote : material.footnote;
      break;

    case Types.TITLE:
      humanoidMaterialStyles =
        currentPlatform === 'ios' ? human.title1 : material.headline5;
      break;

    default:
      humanoidMaterialStyles =
        currentPlatform === 'ios' ? human.body : material.subheading;
  }

  return (
    <RNText
      {...props}
      style={[
        humanoidMaterialStyles,
        style[type].textStyle,
        weight && style.fontWeight(weight),
        { color, textAlign: align },
        noMargin && style.noMargins,
        noMarginLeft && style.noMarginLeft,
        noMarginVertical && style.noMarginVertical,
        noPadding && style.noPaddings,
        flex && style.flex
      ]}
    />
  );
};

const Callout = (props) => <Text {...props} type={Types.CALLOUT} />;
const Caption = (props) => <Text {...props} type={Types.CAPTION} />;
const Footnote = (props) => <Text {...props} type={Types.FOOTNOTE} />;
const Subhead = (props) => <Text {...props} type={Types.SUBHEAD} />;
const Title = (props) => <Text {...props} type={Types.TITLE} />;

Text.propTypes = {
  align: PropTypes.string,
  color: PropTypes.any,
  flex: PropTypes.number,
  noMargin: PropTypes.bool,
  noMarginLeft: PropTypes.bool,
  noMarginVertical: PropTypes.bool,
  noPadding: PropTypes.bool,
  type: PropTypes.string,
  weight: PropTypes.string
};

Text.defaultProps = {
  align: 'left',
  color: colors.standard,
  flex: null,
  noMargin: false,
  noMarginLeft: false,
  noMarginVertical: false,
  noPadding: false,
  type: Types.CAPTION,
  weight: null
};

export default { Callout, Caption, Footnote, Subhead, Title };
