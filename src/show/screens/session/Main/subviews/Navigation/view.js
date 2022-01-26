import React from 'react';
import PropTypes from 'prop-types';
import { Pressable, View } from 'react-native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';
import { deliveryStates as DS } from 'Helpers';
import NavigationService from 'Services/navigation';
import { Icon, ProgressBar, Text } from 'Components';

import style from './style';

const renderCountDown = (completed, stopCount) => (
  <>
    {renderProgressBar({
      completed,
      stopCount,
      props: { marginRight: defaults.marginHorizontal / 4 }
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
      props: { marginHorizontal: defaults.marginHorizontal / 4 }
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

const renderLowConnection = () => (
  <Icon
    size={30}
    color={colors.warning}
    name={'wifi-strength-1-alert'}
    onPress={NavigationService.navigate.bind(null, {
      routeName: 'LowConnectionModal'
    })}
  />
);

const Navigation = props => {
  const {
    completedStopsIds,
    countDown,
    lowConnection,
    network,
    openDrawer,
    updateDeviceProps,
    status,
    stopCount
  } = props;

  const completed = completedStopsIds.length;

  return (
    <View style={[style.container]}>
      <RowView
        justifyContent={'space-between'}
        height={48}
        marginHorizontal={defaults.marginHorizontal * 0.75}
        width={'auto'}>
        <CustomIcon
          width={30}
          bgColor={'transparent'}
          icon={'hamburger'}
          onPress={openDrawer}
        />
        {status === DS.DEL && (
          <RowView flex={1} marginHorizontal={defaults.marginHorizontal / 2}>
            <Pressable
              style={style.flex1}
              onPress={updateDeviceProps.bind(null, { countDown: !countDown })}>
              <RowView height={48}>
                {countDown
                  ? renderCountDown(completed, stopCount)
                  : renderCountUp(completed, stopCount)}
              </RowView>
            </Pressable>
          </RowView>
        )}
        {lowConnection && network.status === 0 && renderLowConnection()}
      </RowView>
    </View>
  );
};

Navigation.defaultProps = {
  countDown: false,
  completedStopsIds: [],
  lowConnection: false,
  status: DS.NCI,
  stopCount: 0
};

Navigation.propTypes = {
  countDown: PropTypes.bool,
  completedStopsIds: PropTypes.array,
  lowConnection: PropTypes.bool,
  network: PropTypes.object,
  openDrawer: PropTypes.func,
  status: PropTypes.string,
  stopCount: PropTypes.number,
  updateDeviceProps: PropTypes.func
};

export default Navigation;
