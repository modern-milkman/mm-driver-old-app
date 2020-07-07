//TODO refactor after branding
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import { Animated, View, TouchableOpacity } from 'react-native';

import I18n from '/process/locales/I18n';

import { ColumnView, SafeAreaView, RowView } from '/show/containers';
import { Text, Separator } from '/show/components';
import { colors } from '/show/resources/theme';

import styles from './styles';

const SideBar = (props) => {
  const { top, bottom, name, updateProps, visible } = props;
  const [left] = useState(new Animated.Value(-310));
  const [opacity] = useState(new Animated.Value(0));
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (!visible) {
      Animated.parallel([
        Animated.timing(left, {
          toValue: -310,
          duration: 250,
          useNativeDriver: false
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        })
      ]).start(() => {
        setShow(false);
      });
    } else {
      setShow(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(left, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false
        })
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    show && (
      <View style={styles.sideBarWrapper}>
        <Animated.View style={{ ...styles.closeArea, opacity: opacity }}>
          <TouchableOpacity
            style={styles.fullView}
            onPress={() => updateProps({ sideBarOpen: false })}
          />
        </Animated.View>

        <Animated.View style={{ ...styles.content, left: left }}>
          <SafeAreaView top={top} bottom={bottom} style={styles.fullView}>
            <ColumnView
              height={'100%'}
              justifyContent={'space-between'}
              paddingHorizontal={24}>
              <ColumnView>
                <RowView width={'100%'} marginVertical={30}>
                  <View style={styles.profilePicture} />

                  <ColumnView
                    alignItems={'flex-start'}
                    flex={1}
                    paddingLeft={12}>
                    <Text.Subhead
                      noMargin
                      noPadding
                      color={'#000000'}>{`${name}`}</Text.Subhead>
                    <Text.Caption noPadding noMargin color={'#000000'}>
                      Driver ID #123224
                    </Text.Caption>
                  </ColumnView>
                </RowView>

                <Separator height={1} width={'100%'} />

                <RowView
                  width={'100%'}
                  justifyContent={'flex-start'}
                  marginVertical={30}>
                  <Text.Subhead color={colors.black} noPadding noMargin>
                    {I18n.t('routes:settings')}
                  </Text.Subhead>
                </RowView>
              </ColumnView>

              <RowView>
                <Text.Caption textAlign={'center'} color={colors.black}>
                  {`V: ${Config.APP_VERSION_NAME}`}
                </Text.Caption>
              </RowView>
            </ColumnView>
          </SafeAreaView>
        </Animated.View>
      </View>
    )
  );
};

SideBar.propTypes = {
  bottom: PropTypes.bool,
  top: PropTypes.bool,
  logout: PropTypes.func,
  name: PropTypes.string,
  updateProps: PropTypes.func,
  visible: PropTypes.bool
};

export default SideBar;
