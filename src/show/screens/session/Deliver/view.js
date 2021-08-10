import PropTypes from 'prop-types';
import RNFS from 'react-native-fs';
import React, { useState } from 'react';
import Config from 'react-native-config';
import { NavigationEvents } from 'react-navigation';
import { Animated } from 'react-native';

import I18n from 'Locales/I18n';
import { CustomIcon } from 'Images';
import { colors, defaults } from 'Theme';
import NavigationService from 'Navigation/service';
import { deliveredStatuses, deviceFrame, mock } from 'Helpers';
import { ColumnView, Modal, RowView, SafeAreaView } from 'Containers';
import {
  Button,
  List,
  ListItem,
  NavBar,
  Picker,
  Separator,
  Text,
  TextInput
} from 'Components';

import { renderImageTextModal } from 'Renders';

import style from './style';

const reasonMessageRef = React.createRef();

const forFade = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress
  }
});

const { width } = deviceFrame();

const animateContent = ({
  contentTranslateYValue,
  contentOpacityValue,
  callback = mock,
  reverse = false
}) => {
  let index = 0;
  let delayIndex = 0;
  if (reverse) {
    index = contentTranslateY.length - 1;
  }
  const runAnimations = [];
  for (
    index;
    (index < contentTranslateY.length && !reverse) || (index >= 0 && reverse);
    reverse ? (index--, delayIndex++) : (index++, delayIndex++)
  ) {
    runAnimations.push(
      Animated.timing(contentTranslateY[index], {
        toValue: contentTranslateYValue,
        useNativeDriver: false,
        duration: 75,
        delay: delayIndex * 100
      }),
      Animated.timing(contentOpacity[index], {
        toValue: contentOpacityValue,
        useNativeDriver: false,
        duration: 75,
        delay: delayIndex * 100
      })
    );
  }
  Animated.parallel(runAnimations).start(callback);
};

const contentTranslateY = [
  new Animated.Value(100),
  new Animated.Value(100),
  new Animated.Value(100)
];
const contentOpacity = [
  new Animated.Value(0),
  new Animated.Value(0),
  new Animated.Value(0)
];

const handleChangeSkip = (updateTransientProps, key, value) => {
  updateTransientProps({ [key]: value });
};

const navigateBack = callback => {
  animateContent({
    contentTranslateYValue: 100,
    contentOpacityValue: 0,
    callback,
    reverse: true
  });

  NavigationService.goBack();
};

const rejectAndNavigateBack = (callback, setModalVisible) => {
  setModalVisible(false);
  setTimeout(navigateBack.bind(null, callback), 250);
};

const renderFallbackCustomerImage = () => (
  <RowView height={width - defaults.marginHorizontal * 2}>
    <CustomIcon
      width={width - defaults.marginHorizontal * 2}
      icon={'frontDeliveryPlaceholder'}
      disabled
    />
  </RowView>
);

const renderSkipModal = ({
  outOfStockIds,
  reasonMessage,
  rejectReasons,
  selectedStop,
  setModalVisible,
  setRejected,
  reasonType = rejectReasons[2].id,
  updateTransientProps
}) => (
  <ColumnView
    marginHorizontal={defaults.marginHorizontal}
    width={width - defaults.marginHorizontal * 2}
    flex={1}>
    <ColumnView
      alignItems={'flex-start'}
      backgroundColor={colors.neutral}
      overflow={'hidden'}
      borderRadius={defaults.borderRadius}>
      <ColumnView paddingHorizontal={defaults.marginHorizontal}>
        <Picker
          items={rejectReasons}
          selected={reasonType}
          onChange={handleChangeSkip.bind(
            null,
            updateTransientProps,
            'reasonType'
          )}
        />
        <RowView paddingBottom={defaults.marginVertical}>
          <TextInput
            disableErrors
            multiline
            value={reasonMessage}
            placeholder={I18n.t('screens:deliver.modal.inputPlaceholder')}
            onChangeText={handleChangeSkip.bind(
              null,
              updateTransientProps,
              'reasonMessage'
            )}
            ref={reasonMessageRef}
          />
        </RowView>
      </ColumnView>

      <Separator color={colors.input} width={'100%'} />

      <RowView>
        <Button.Tertiary
          title={I18n.t('general:cancel')}
          onPress={setModalVisible.bind(null, false)}
          width={'50%'}
          noBorderRadius
        />
        {selectedStop && (
          <Button.Primary
            title={I18n.t('general:skip')}
            width={'50%'}
            disabled={reasonMessage === ''}
            onPress={rejectAndNavigateBack.bind(
              null,
              setRejected.bind(
                null,
                selectedStop.orderID,
                selectedStop.key,
                outOfStockIds,
                reasonType,
                reasonMessage
              ),
              setModalVisible
            )}
            noBorderRadius
          />
        )}
      </RowView>
    </ColumnView>
  </ColumnView>
);

const showClaims = toggleModal => {
  toggleModal('showClaimModal', true);
  NavigationService.navigate({
    routeName: 'CustomerIssueModal'
  });
};

const showModal = (type, setModalType, setModalVisible) => {
  setModalType(type);
  setModalVisible(true);
};

const Deliver = props => {
  const [modalType, setModalType] = useState('skip');
  const [modalVisible, setModalVisible] = useState(false);

  const {
    allItemsDone,
    confirmedItem,
    outOfStockIds,
    routeDescription,
    selectedStop,
    setDelivered,
    toggleConfirmedItem,
    toggleModal,
    toggleOutOfStock
  } = props;

  if (!selectedStop) {
    return null;
  }

  const {
    claims: { acknowledgedList, showClaimModal, unacknowledgedList }
  } = selectedStop;

  const optimizedStopOrders = selectedStop
    ? Object.values(selectedStop.orders).map(order => {
        const isOutOfStock = outOfStockIds.includes(order.key);
        return {
          ...order,
          prefix: order.quantity + ' X',
          title: order.title,
          customIcon: 'productPlaceholder',
          disabled:
            deliveredStatuses.includes(selectedStop.status) ||
            unacknowledgedList.length > 0,
          image: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${order.productId}`,
          rightIcon:
            isOutOfStock || order.status === 3
              ? 'alert'
              : confirmedItem.includes(order.key) || order.status === 2
              ? 'check'
              : null,
          enforceLayout: true,
          ...((isOutOfStock || order.status === 3) && {
            rightIconColor: colors.error,
            suffixColor: colors.error
          })
        };
      })
    : null;

  return (
    <SafeAreaView top bottom>
      <NavigationEvents
        onDidFocus={animateContent.bind(null, {
          contentTranslateYValue: 0,
          contentOpacityValue: 1,
          callback: showClaimModal
            ? NavigationService.navigate.bind(null, {
                routeName: 'CustomerIssueModal'
              })
            : null
        })}
      />

      <Modal visible={modalVisible} transparent={true} animationType={'fade'}>
        {modalType === 'skip' && renderSkipModal({ ...props, setModalVisible })}
        {modalType === 'image' &&
          renderImageTextModal({
            imageSource: {
              uri: `file://${RNFS.DocumentDirectoryPath}/${Config.FS_CUSTOMER_IMAGES}/${selectedStop.customerId}-${selectedStop.key}`
            },
            onPress: setModalVisible,
            renderFallback: renderFallbackCustomerImage,
            text: selectedStop.deliveryInstructions
          })}
      </Modal>

      <ColumnView
        backgroundColor={colors.neutral}
        flex={1}
        justifyContent={'flex-start'}>
        <NavBar
          leftIcon={'chevron-down'}
          leftIconAction={navigateBack.bind(null, null)}
          title={I18n.t('general:details')}
          rightCustomIcon={
            acknowledgedList?.length > 0 ? 'customerIssue' : null
          }
          rightColor={colors.error}
          rightAction={NavigationService.navigate.bind(null, {
            routeName: 'CustomerIssueList'
          })}
        />
        {selectedStop && selectedStop.status !== 'pending' && (
          <Animated.View
            style={[
              style.fullWidth,
              {
                transform: [{ translateY: contentTranslateY[0] }],
                opacity: contentOpacity[0]
              }
            ]}>
            <Separator />
            <RowView
              backgroundColor={
                selectedStop.status === 'completed'
                  ? colors.primary
                  : colors.error
              }>
              <Text.Button>
                {I18n.t(`screens:deliver.status.${selectedStop.status}`)}
              </Text.Button>
            </RowView>
          </Animated.View>
        )}
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[0] }],
              opacity: contentOpacity[0]
            }
          ]}>
          <Separator />
          <ListItem
            suffixBottom={I18n.t('screens:deliver.routeDescription', {
              routeDescription
            })}
            suffixColor={colors.Primarylight}
            description={I18n.t('screens:deliver.userID', {
              userId: selectedStop?.userId
            })}
            disabled
          />
        </Animated.View>
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[0] }],
              opacity: contentOpacity[0]
            }
          ]}>
          <>
            <Separator />
            <ListItem
              customIcon={'location'}
              title={selectedStop?.title}
              titleExpands
              disabled
            />
          </>
        </Animated.View>
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[0] }],
              opacity: contentOpacity[0]
            }
          ]}>
          {selectedStop &&
            (selectedStop.deliveryInstructions ||
              selectedStop.hasCustomerImage ||
              selectedStop.coolBox) && (
              <>
                <Separator />
                <ListItem
                  onPress={showModal.bind(
                    null,
                    'image',
                    setModalType,
                    setModalVisible
                  )}
                  image={`file://${RNFS.DocumentDirectoryPath}/${Config.FS_CUSTOMER_IMAGES}/${selectedStop.customerId}-${selectedStop.key}`}
                  customIcon={'frontDeliveryPlaceholder'}
                  customIconProps={{ color: colors.primary }}
                  customRightIconProps={{
                    color: colors.primary
                  }}
                  customRightIcon={
                    selectedStop.deliveryInstructions ||
                    selectedStop.hasCustomerImage
                      ? 'expand'
                      : null
                  }
                  title={selectedStop.deliveryInstructions}
                  titleExpands
                  {...(selectedStop.coolBox && {
                    secondaryCustomRightIcon: 'coolbox',
                    secondaryCustomRightIconProps: { color: colors.secondary }
                  })}
                />
              </>
            )}
        </Animated.View>
        <Animated.View
          style={[
            style.flex1,
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[1] }],
              opacity: contentOpacity[1]
            }
          ]}>
          {optimizedStopOrders && (
            <>
              <Separator />
              <List
                data={[
                  {
                    title: I18n.t('screens:deliver.deliveryItems'),
                    data: optimizedStopOrders
                  }
                ]}
                onLongPress={toggleOutOfStock}
                onPress={toggleConfirmedItem}
                hasSections
              />
            </>
          )}
        </Animated.View>
      </ColumnView>
      {selectedStop && selectedStop.status === 'pending' && (
        <Animated.View
          style={[
            style.fullWidth,
            {
              transform: [{ translateY: contentTranslateY[2] }],
              opacity: contentOpacity[2]
            }
          ]}>
          <ColumnView
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}
            marginTop={defaults.marginVertical / 2}>
            {unacknowledgedList.length > 0 && (
              <RowView marginVertical={defaults.marginVertical}>
                <Button.Secondary
                  title={I18n.t('screens:deliver.viewClaims', {
                    claimNo: unacknowledgedList.length
                  })}
                  onPress={showClaims.bind(null, toggleModal)}
                />
              </RowView>
            )}
            {unacknowledgedList.length === 0 && (
              <>
                <RowView>
                  <Button.Primary
                    title={I18n.t('general:done')}
                    onPress={navigateBack.bind(
                      null,
                      setDelivered.bind(
                        null,
                        selectedStop.orderID,
                        selectedStop.key,
                        outOfStockIds
                      )
                    )}
                    disabled={!allItemsDone}
                  />
                </RowView>
                <RowView marginVertical={defaults.marginVertical}>
                  <Button.Outline
                    title={I18n.t('general:skip')}
                    onPress={showModal.bind(
                      null,
                      'skip',
                      setModalType,
                      setModalVisible
                    )}
                  />
                </RowView>
              </>
            )}
          </ColumnView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

Deliver.propTypes = {
  allItemsDone: PropTypes.bool,
  confirmedItem: PropTypes.array,
  outOfStockIds: PropTypes.array,
  reasonMessage: PropTypes.string,
  routeDescription: PropTypes.string,
  selectedStop: PropTypes.object,
  setDelivered: PropTypes.func,
  setRejected: PropTypes.func,
  toggleConfirmedItem: PropTypes.func,
  toggleModal: PropTypes.func,
  toggleOutOfStock: PropTypes.func,
  updateTransientProps: PropTypes.func
};

Deliver.defaultProps = {
  allItemsDone: false,
  confirmedItem: [],
  outOfStockIds: [],
  reasonMessage: '',
  routeDescription: null,
  selectedStop: {},
  setDelivered: mock,
  setRejected: mock,
  toggleConfirmedItem: mock,
  toggleModal: mock,
  toggleOutOfStock: mock,
  updateTransientProps: mock
};

Deliver.navigationOptions = {
  cardStyleInterpolator: forFade
};

export default Deliver;
