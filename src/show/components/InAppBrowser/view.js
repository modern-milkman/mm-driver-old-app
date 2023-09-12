import PropTypes from 'prop-types';
import { Platform } from 'react-native';
import React, { createRef } from 'react';
import { WebView } from 'react-native-webview';

import { defaults } from 'Theme';
import { Icon, Text } from 'Components';
import { openURL, mock } from 'Helpers';
import { Modal, RowView, SafeAreaView, useThemedStyles } from 'Containers';

import unthemedStyle from './style';

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
  const {
    canGoBack = false,
    canGoForward = false,
    theme: { colors },
    showAddressBar = true,
    updateProps = mock,
    url: uri = 'http://themodernmilkman.co.uk',
    html = '',
    visible = false
  } = props;
  const style = useThemedStyles(unthemedStyle);

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
          {showAddressBar && (
            <>
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
            </>
          )}
        </RowView>

        <WebView
          source={{ uri, html }}
          onNavigationStateChange={navState => {
            updateProps({
              canGoBack: navState.canGoBack,
              canGoForward: navState.canGoForward,
              url: navState.url
            });
          }}
          originWhitelist={['*']}
          ref={webview}
        />
      </SafeAreaView>
    </Modal>
  );
};

InAppBrowser.propTypes = {
  canGoBack: PropTypes.bool,
  canGoForward: PropTypes.bool,
  html: PropTypes.string,
  showAddressBar: PropTypes.bool,
  theme: PropTypes.object,
  updateProps: PropTypes.func,
  url: PropTypes.string,
  visible: PropTypes.bool
};

export default InAppBrowser;
