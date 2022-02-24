import PropTypes from 'prop-types';
import { Platform } from 'react-native';
import React, { createRef } from 'react';
import { WebView } from 'react-native-webview';

import { openURL } from 'Helpers';
import { Icon, Text } from 'Components';
import { colors, defaults } from 'Theme';
import { Modal, RowView, SafeAreaView } from 'Containers';

import style from './style';

const webview = createRef();

const dismiss = ({ updateProps }) => {
  updateProps({ visible: false });
};

const goBackOrDismiss = ({ canGoBack, updateProps }) => {
  if (Platform.OS === 'android' && canGoBack) {
    webview?.current?.goBack();
    return;
  }
  dismiss({ updateProps });
};

const InAppBrowser = props => {
  const { canGoBack, canGoForward, updateProps, url: uri, visible } = props;

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={goBackOrDismiss.bind(null, {
        canGoBack,
        updateProps
      })}>
      <SafeAreaView style={style.inappwrapper}>
        <RowView
          justifyContent={'space-between'}
          height={defaults.topNavigation.height}>
          <Icon
            name="close"
            size={defaults.topNavigation.iconSize}
            containerSize={defaults.topNavigation.height}
            color={colors.white}
            onPress={dismiss.bind(null, { updateProps })}
          />
          <Icon
            name="arrow-left"
            size={defaults.topNavigation.iconSize}
            containerSize={defaults.topNavigation.height}
            color={canGoBack ? colors.white : colors.input}
            disabled={!canGoBack}
            onPress={webview?.current?.goBack}
          />
          <Text.Caption
            align={'left'}
            color={colors.white}
            flex={1}
            numberOfLines={1}>
            {uri}
          </Text.Caption>

          <Icon
            name="arrow-right"
            size={defaults.topNavigation.iconSize}
            containerSize={defaults.topNavigation.height}
            color={canGoForward ? colors.white : colors.input}
            disabled={!canGoForward}
            onPress={webview?.current?.goForward}
          />
          <Icon
            type={'material'}
            name="open-in-browser"
            size={defaults.topNavigation.iconSize}
            containerSize={defaults.topNavigation.height}
            color={colors.white}
            onPress={openURL.bind(null, uri)}
          />
        </RowView>

        <WebView
          source={{ uri }}
          onNavigationStateChange={navState => {
            updateProps({
              canGoBack: navState.canGoBack,
              canGoForward: navState.canGoForward,
              url: navState.url
            });
          }}
          ref={webview}
        />
      </SafeAreaView>
    </Modal>
  );
};

InAppBrowser.defaultProps = {
  url: 'http://themodernmilkman.co.uk',
  visible: false
};

InAppBrowser.propTypes = {
  canGoBack: PropTypes.bool,
  canGoForward: PropTypes.bool,
  updateProps: PropTypes.func,
  url: PropTypes.string,
  visible: PropTypes.bool
};

export default InAppBrowser;
