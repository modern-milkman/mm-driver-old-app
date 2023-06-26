//testID supported
import React from 'react';
import PropTypes from 'prop-types';

import { mock } from 'Helpers';
import Text from 'Components/Text';
import Icon from 'Components/Icon';
import { CustomIcon } from 'Images';

import { defaults } from 'Theme';
import { ColumnView, RowView, useTheme } from 'Containers';

const NavBar = props => {
  const { colors } = useTheme();
  const {
    LeftComponent,
    leftIcon,
    leftIconAction = mock,
    leftIconColor = colors.inputSecondary,
    marginHorizontal = defaults.marginHorizontal,
    RightComponent,
    rightAction,
    rightActionDisabled = false,
    rightText,
    rightIcon,
    rightCustomIcon,
    rightColor = colors.primary,
    testID,
    title
  } = props;

  return (
    <RowView
      justifyContent={'space-between'}
      height={defaults.topNavigation.height}
      alignItems={'center'}
      paddingHorizontal={marginHorizontal}
      testID={testID}>
      {(LeftComponent && <LeftComponent />) || (
        <Icon
          name={leftIcon}
          color={leftIconColor}
          size={defaults.topNavigation.iconSize}
          containerSize={defaults.topNavigation.height}
          onPress={leftIconAction}
        />
      )}

      <Text.Input color={colors.inputSecondary}>{title}</Text.Input>
      {RightComponent || rightText || rightIcon || rightCustomIcon ? (
        renderRight({
          rightAction,
          rightActionDisabled,
          rightColor,
          RightComponent,
          rightCustomIcon,
          rightIcon,
          rightText
        })
      ) : (
        <RowView
          width={defaults.topNavigation.height}
          height={defaults.topNavigation.height}
        />
      )}
    </RowView>
  );
};

const renderRight = ({
  rightAction,
  rightActionDisabled,
  rightColor,
  RightComponent,
  rightCustomIcon,
  rightIcon,
  rightText
}) => {
  if (RightComponent) {
    return <RightComponent />;
  }

  if (rightText) {
    return (
      <ColumnView
        width={60}
        alignItems={'flex-end'}
        justifyContent={'center'}
        height={defaults.topNavigation.height}>
        <Text.Label
          color={rightColor}
          disabled={rightActionDisabled}
          onPress={rightAction}
          align={'right'}
          lineHeight={defaults.topNavigation.height}>
          {rightText}
        </Text.Label>
      </ColumnView>
    );
  }

  if (rightCustomIcon) {
    return (
      <CustomIcon
        width={defaults.topNavigation.iconSize}
        containerWidth={defaults.topNavigation.height}
        disabled={rightActionDisabled}
        icon={rightCustomIcon}
        iconColor={rightColor}
        onPress={rightAction}
      />
    );
  }

  if (rightIcon) {
    return (
      <Icon
        name={rightIcon}
        color={rightColor}
        disabled={rightActionDisabled}
        size={defaults.topNavigation.iconSize}
        containerSize={defaults.topNavigation.height}
        onPress={rightAction}
      />
    );
  }
};

NavBar.propTypes = {
  LeftComponent: PropTypes.func,
  leftIcon: PropTypes.string,
  leftIconAction: PropTypes.func,
  leftIconColor: PropTypes.any,
  marginHorizontal: PropTypes.number,
  RightComponent: PropTypes.func,
  rightColor: PropTypes.string,
  rightCustomIcon: PropTypes.string,
  rightAction: PropTypes.func,
  rightActionDisabled: PropTypes.bool,
  rightIcon: PropTypes.string,
  rightText: PropTypes.string,
  testID: PropTypes.string,
  title: PropTypes.string
};

export default NavBar;
