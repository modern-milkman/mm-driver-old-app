import PropTypes from 'prop-types';
import { Animated, Platform, View } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import I18n from 'Locales/I18n';
import List from 'Components/List';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';
import { deliveryStates as DS, statusBarHeight, mock } from 'Helpers';
import TextInput, { height as textInputHeight } from 'Components/TextInput';

import style from './style';

const searchReference = React.createRef();

const handleSearchFilter = (items, searchValue) => {
  if (items && items.length <= 0) {
    return [];
  }
  return items.filter(item =>
    item?.searchHandle?.includes(searchValue.toLowerCase())
  );
};

const Search = props => {
  const {
    completedStopsIds,
    panY,
    searchValue,
    status,
    stops,
    updateDeviceProps,
    updateProps,
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

  const handleChange = val => {
    updateTransientProps({ searchValue: val });
  };

  const handleFocus = (isSearchBar, isFocused) => {
    if ((isSearchBar && isFocused) || !isSearchBar) {
      setFocused(isFocused);
    }
  };

  const onPressAddress = key => {
    updateDeviceProps({
      shouldTrackHeading: false,
      shouldTrackLocation: false
    });
    updateProps({ optimisedRouting: false });
    updateSelectedStop(key);
    handleFocus(false, false);
  };

  const dataSearched = handleSearchFilter(stops, searchValue);

  const search = [
    {
      title: I18n.t('general:upNext'),
      data: dataSearched.filter(item => !completedStopsIds.includes(item.key))
    },
    {
      title: I18n.t('screens:deliver.status.completed'),
      data: dataSearched.filter(item => completedStopsIds.includes(item.key))
    }
  ];

  if (searchValue.length > 0) {
    if (dataSearched.length > 0) {
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
    [DS.DEL, DS.DELC, DS.SEC].includes(status) && (
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
                data={search}
                hasSections
                renderListEmptyComponent={null}
              />
            </Animated.View>
          </View>
        )}
      </>
    )
  );
};

Search.propTypes = {
  completedStopsIds: PropTypes.array,
  panY: PropTypes.object,
  searchValue: PropTypes.string,
  status: PropTypes.string,
  stops: PropTypes.array,
  updateDeviceProps: PropTypes.func,
  updateProps: PropTypes.func,
  updateSelectedStop: PropTypes.func,
  updateTransientProps: PropTypes.func
};

Search.defaultProps = {
  completedStopsIds: [],
  panY: new Animated.Value(0),
  searchValue: '',
  stops: [],
  updateDeviceProps: mock,
  updateProps: mock,
  updateSelectedStop: mock,
  updateTransientProps: mock
};

export default Search;
