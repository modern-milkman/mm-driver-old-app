import React from 'react';
import PropTypes from 'prop-types';
import { Animated, Platform } from 'react-native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';
import { statusBarHeight, deliveryStates as DS } from 'Helpers';
import { ProgressBar, Text } from 'Components';

import style from './style';

const navigationBottom = Platform.OS === 'android' ? -statusBarHeight() : 0;

const renderCountDown = (completed, stopCount) => (
  <>
    {renderProgressBar({
      completed,
      stopCount,
      props: { marginRight: defaults.marginHorizontal }
    })}

    <Text.List color={colors.secondary}>
      {I18n.t('screens:main.navigation.deliveriesLeft', {
        nr: stopCount - completed
      })}
    </Text.List>
  </>
);

const renderCountUp = (completed, stopCount) => (
  <>
    <Text.List color={colors.secondary}>
      {I18n.t('screens:main.navigation.deliveries')}
    </Text.List>

    {renderProgressBar({
      completed,
      stopCount,
      props: { marginHorizontal: defaults.marginHorizontal }
    })}

    <Text.List color={colors.secondary}>{completed} </Text.List>

    <Text.List color={colors.secondary}>/ {stopCount}</Text.List>
  </>
);

const renderProgressBar = ({ completed, stopCount, props }) => (
  <RowView flex={1} {...props}>
    <ProgressBar height={4} progress={completed} total={stopCount} />
  </RowView>
);

const Navigation = (props) => {
  const {
    countDown,
    completedStopsIds,
    paddingBottom,
    panY,
    status,
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
        {status === DS.DEL && (
          <RowView flex={1} marginLeft={defaults.marginHorizontal / 2}>
            {countDown
              ? renderCountDown(completed, stopCount)
              : renderCountUp(completed, stopCount)}
          </RowView>
        )}
      </RowView>
    </Animated.View>
  );
};

Navigation.defaultProps = {
  countDown: false,
  completedStopsIds: [],
  panY: new Animated.Value(0),
  status: DS.NCI,
  stopCount: 0
};

Navigation.propTypes = {
  countDown: PropTypes.bool,
  completedStopsIds: PropTypes.array,
  paddingBottom: PropTypes.number,
  panY: PropTypes.object,
  status: PropTypes.string,
  stopCount: PropTypes.number,
  updateProps: PropTypes.func
};

export default Navigation;
