import React from 'react';
import PropTypes from 'prop-types';
import { Animated, Platform } from 'react-native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';
import { statusBarHeight } from 'Helpers';
import { ProgressBar, Text } from 'Components';

import style from './style';

const navigationBottom = Platform.OS === 'android' ? -statusBarHeight() : 0;

const Navigation = (props) => {
  const {
    completedStopsIds,
    deliveryStatus,
    paddingBottom,
    panY,
    stopCount,
    updateProps
  } = props;
  const completed = completedStopsIds.length;

  return (
    <Animated.View
      style={[
        style.container,
        {
          bottom: navigationBottom,
          paddingBottom,
          transform: [{ translateY: panY }]
        }
      ]}>
      <RowView
        justifyContent={'space-between'}
        height={48}
        marginHorizontal={
          defaults.marginHorizontal - defaults.marginHorizontal / 3
        }
        width={'auto'}>
        <CustomIcon
          width={30}
          bgColor={'transparent'}
          icon={'hamburger'}
          onPress={() => updateProps({ sideBarOpen: true })}
        />
        {deliveryStatus === 2 && (
          <RowView flex={1} marginLeft={defaults.marginHorizontal / 2}>
            <Text.List color={colors.secondary}>
              {I18n.t('screens:main.navigation.deliveries')}
            </Text.List>

            <RowView flex={1} marginHorizontal={defaults.marginHorizontal}>
              <ProgressBar height={4} progress={completed} total={stopCount} />
            </RowView>

            <Text.List color={colors.secondary}>{completed} </Text.List>

            <Text.List color={colors.secondary}>/ {stopCount}</Text.List>
          </RowView>
        )}
      </RowView>
    </Animated.View>
  );
};

Navigation.defaultProps = {
  completedStopsIds: [],
  deliveryStatus: 0,
  panY: new Animated.Value(0),
  stopCount: 0
};

Navigation.propTypes = {
  completedStopsIds: PropTypes.array,
  deliveryStatus: PropTypes.number,
  paddingBottom: PropTypes.number,
  panY: PropTypes.object,
  stopCount: PropTypes.number,
  updateProps: PropTypes.func
};

export default Navigation;
