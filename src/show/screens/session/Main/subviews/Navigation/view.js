import React from 'react';
import PropTypes from 'prop-types';
import { Pressable, View } from 'react-native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { defaults } from 'Theme';
import { deliveryStates as DS } from 'Helpers';
import NavigationService from 'Services/navigation';
import { Icon, ProgressBar, Text } from 'Components';
import { RowView, useTheme, useThemedStyles } from 'Containers';

import unthemedStyle from './style';

const renderCountDown = (colors, completed, stopCount) => (
  <>
    {renderProgressBar({
      completed,
      stopCount,
      props: { marginRight: defaults.marginHorizontal / 4 }
    })}

    <Text.List color={colors.inputSecondary}>
      {I18n.t('screens:main.navigation.deliveriesLeft', {
        nr: stopCount - completed
      })}
    </Text.List>
  </>
);

const renderCountUp = (colors, completed, stopCount) => (
  <>
    <Text.List testID={'home-deliveries-label'} color={colors.inputSecondary}>
      {I18n.t('screens:main.navigation.deliveries')}
    </Text.List>

    {renderProgressBar({
      completed,
      stopCount,
      props: { marginHorizontal: defaults.marginHorizontal / 4 }
    })}

    <Text.List color={colors.inputSecondary}>{completed} </Text.List>

    <Text.List color={colors.inputSecondary}>/ {stopCount}</Text.List>
  </>
);

const renderProgressBar = ({ completed, stopCount, props }) => (
  <RowView flex={1} {...props}>
    <ProgressBar height={4} progress={completed} total={stopCount} />
  </RowView>
);

const renderLowConnection = colors => (
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
  const { colors } = useTheme();
  const style = useThemedStyles(unthemedStyle);

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
                  ? renderCountDown(colors, completed, stopCount)
                  : renderCountUp(colors, completed, stopCount)}
              </RowView>
            </Pressable>
          </RowView>
        )}
        {lowConnection && network.status === 0 && renderLowConnection(colors)}
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
