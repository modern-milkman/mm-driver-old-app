import React from 'react';
import PropTypes from 'prop-types';

import { mock } from 'Helpers';
import Text from 'Components/Text';
import Icon from 'Components/Icon';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';

const NavBar = ({
  leftIcon,
  leftIconAction,
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
      <Icon
        name={leftIcon}
        color={colors.secondary}
        size={defaults.topNavigation.iconSize}
        containerSize={defaults.topNavigation.height}
        onPress={leftIconAction}
      />
      {title && <Text.Input color={colors.secondary}>{title}</Text.Input>}
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
  leftIcon: PropTypes.string,
  leftIconAction: PropTypes.func,
  marginHorizontal: PropTypes.number,
  RightComponent: PropTypes.func,
  title: PropTypes.string
};

NavBar.defaultProps = {
  leftIconAction: mock,
  marginHorizontal: defaults.marginHorizontal
};

export default NavBar;
