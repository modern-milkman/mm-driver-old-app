import PropTypes from 'prop-types';
import { Animated, Platform, View } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import I18n from 'Locales/I18n';
import List from 'Components/List';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';
import { statusBarHeight, mock } from 'Helpers';
import SafeKeyboardAreaView from 'Containers/SafeKeyboardAreaView';
import TextInput, { height as textInputHeight } from 'Components/TextInput';

import style from './style';

const searchReference = React.createRef();

const handleSearchFilter = (items, searchValue) => {
  if (items && items.length <= 0) {
    return [];
  }
  return items.filter(
    (item) =>
      item?.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
      item?.forename.toLowerCase().includes(searchValue.toLowerCase()) ||
      item?.surname.toLowerCase().includes(searchValue.toLowerCase())
  );
};

const Search = (props) => {
  const {
    deliveryStatus,
    panY,
    searchValue,
    stops,
    updateSelectedStop,
    updateTransientProps
  } = props;

  const [focused, setFocused] = useState(false);

  const top = Platform.select({
    android: statusBarHeight(),
    ios: useSafeAreaInsets().top
  });

  const inputHeight = textInputHeight('normal', true);

  let height = useRef(new Animated.Value(0)).current;

  const handleChange = (val) => {
    updateTransientProps({ searchValue: val });
  };

  const handleFocus = (isSearchBar, isFocused) => {
    if ((isSearchBar && isFocused) || !isSearchBar) {
      setFocused(isFocused);
    }
  };

  const onPressAddress = (key) => {
    updateSelectedStop(key);
    handleFocus(false, false);
  };

  const search = {
    title: I18n.t('general:upNext'),
    data: handleSearchFilter(stops, searchValue)
  };

  if (searchValue.length > 0) {
    if (search.data.length > 0) {
      search.title = I18n.t('screens:main.search.results');
    } else {
      search.title = I18n.t('screens:main.search.noResults');
    }
  }

  useEffect(() => {
    if (focused) {
      Animated.timing(height, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false
      }).start();
    } else {
      searchReference?.current?.blur();
      Animated.timing(height, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false
      }).start();
    }
  }, [focused, height]);

  return (
    deliveryStatus === 2 && (
      <>
        <View
          style={[
            style.container,
            {
              height: top + inputHeight + defaults.marginVertical / 4
            },
            focused && { backgroundColor: colors.neutral, ...style.elevation7 }
          ]}>
          <Animated.View
            style={[
              {
                top,
                transform: [{ translateY: panY }]
              }
            ]}>
            <RowView
              marginHorizontal={defaults.marginHorizontal}
              width={'auto'}>
              <TextInput
                disableErrors
                leftIcon={focused ? 'chevron-back' : 'search'}
                onChangeText={handleChange.bind(this)}
                onFocusChanged={handleFocus.bind(null, true)}
                onLeftIconPress={handleFocus.bind(null, false, false)}
                placeholder={I18n.t('screens:main.search.placeholder')}
                ref={searchReference}
                shadow
                size={'normal'}
                value={searchValue}
              />
            </RowView>
          </Animated.View>
        </View>
        {focused && (
          <View
            style={[
              style.listWrapper,
              style.elevation7,
              {
                top: top + inputHeight
              }
            ]}>
            <SafeKeyboardAreaView style={style.safeArea} scrollEnabled={false}>
              <Animated.View
                style={[
                  {
                    height: height.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  },
                  style.animatedList
                ]}>
                <List
                  onPress={onPressAddress}
                  data={[search]}
                  hasSections
                  renderListEmptyComponent={null}
                />
              </Animated.View>
            </SafeKeyboardAreaView>
          </View>
        )}
      </>
    )
  );
};

Search.propTypes = {
  panY: PropTypes.object,
  searchValue: PropTypes.string,
  stops: PropTypes.array,
  deliveryStatus: PropTypes.number,
  updateSelectedStop: PropTypes.func,
  updateTransientProps: PropTypes.func
};

Search.defaultProps = {
  panY: new Animated.Value(0),
  searchValue: '',
  stops: [],
  updateSelectedStop: mock,
  updateTransientProps: mock
};

export default Search;
