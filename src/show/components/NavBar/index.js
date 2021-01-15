import React from 'react';
import PropTypes from 'prop-types';

import { mock } from 'Helpers';
import Text from 'Components/Text';
import Icon from 'Components/Icon';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';

const NavBar = ({
  LeftComponent,
  leftIcon,
  leftIconAction,
  leftIconColor,
  marginHorizontal,
  RightComponent,
  title
}) => {
  return (
    <RowView
      justifyContent={'space-between'}
      height={defaults.topNavigation.height}
      alignItems={'center'}
      paddingHorizontal={marginHorizontal}>
      {(LeftComponent && <LeftComponent />) || (
        <Icon
          name={leftIcon}
          color={leftIconColor}
          size={defaults.topNavigation.iconSize}
          containerSize={defaults.topNavigation.height}
          onPress={leftIconAction}
        />
      )}

      <Text.Input color={colors.secondary}>{title}</Text.Input>
      {(RightComponent && <RightComponent />) || (
        <RowView
          width={defaults.topNavigation.height}
          height={defaults.topNavigation.height}
        />
      )}
    </RowView>
  );
};

NavBar.propTypes = {
  LeftComponent: PropTypes.func,
  leftIcon: PropTypes.string,
  leftIconAction: PropTypes.func,
  leftIconColor: PropTypes.any,
  marginHorizontal: PropTypes.number,
  RightComponent: PropTypes.func,
  title: PropTypes.string
};

NavBar.defaultProps = {
  leftIconAction: mock,
  leftIconColor: colors.secondary,
  marginHorizontal: defaults.marginHorizontal
};

export default NavBar;
