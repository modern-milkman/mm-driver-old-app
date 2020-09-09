import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Animated, View, TouchableOpacity, Keyboard } from 'react-native';

import { colors } from 'Theme';
import { ColumnView } from 'Containers';
import { deviceFrame, mock } from 'Helpers';
import { Icon, SearchBar, ListItem } from 'Components';

import style from './style';

const deviceHeight = deviceFrame().height;

const handleSearchFilter = (items, searchValue) => {
  return items.filter(
    (item) =>
      item.fullAddress.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.forename.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.surname.toLowerCase().includes(searchValue.toLowerCase())
  );
};

const onPressAddress = (updateSelectedStop, aId) => {
  updateSelectedStop(aId);
  Keyboard.dismiss();
};

//TODO use SafeKeyboardAreaView
const useKeyboardEvent = (event, callback) => {
  useEffect(() => {
    Keyboard.addListener(event, callback);

    return () => {
      Keyboard.removeListener(event, callback);
    };
  }, [event, callback]);
};

const searchBarLeftIcon = (
  <Icon
    name={'chevron-left'}
    color={colors.primary}
    size={24}
    containerSize={44}
    onPress={Keyboard.dismiss}
  />
);

const Search = (props) => {
  const {
    bottomHeight,
    itemsToSearch,
    focused,
    searchValue,
    updateTransientProps,
    stops,
    updateSelectedStop
  } = props;

  const height = useRef(new Animated.Value(0)).current;
  const [bottomPadding] = useState(new Animated.Value(bottomHeight));

  const handleChange = (val) => {
    updateTransientProps({ searchValue: val });
  };

  const handleFocus = (isFocused) => {
    if (isFocused) {
      updateTransientProps({ focused: true });
    }

    Animated.timing(height, {
      toValue: isFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      if (!isFocused) {
        updateTransientProps({ focused: false });
      }
    });
  };

  //TODO use SafeKeyboardAreaView
  const keyboardEvent = useCallback(
    (size = null, e) => {
      const searchBarHeight = 120;
      const value =
        deviceHeight -
        (searchBarHeight + (size ? size : e.endCoordinates.height));

      Animated.timing(bottomPadding, {
        toValue: value,
        duration: 250,
        useNativeDriver: false
      }).start();
    },
    [bottomPadding]
  );

  useKeyboardEvent('keyboardWillShow', keyboardEvent.bind(null, null));
  useKeyboardEvent('keyboardWillHide', keyboardEvent.bind(null, bottomHeight));

  return (
    <View style={[style.container, focused && style.height100]}>
      <TouchableOpacity
        onPress={Keyboard.dismiss}
        style={focused && style.height100}>
        <View style={style.searchWrapper}>
          {stops && (
            <SearchBar
              value={searchValue}
              onFocusChanged={handleFocus.bind(null)}
              onChangeText={handleChange.bind(this)}
              {...(focused && { leftIcon: searchBarLeftIcon })}
            />
          )}
        </View>
        {focused && (
          <Animated.View
            maxHeight={bottomPadding}
            style={[
              style.listWrapper,
              style.overflowHidden,
              {
                height: height.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}>
            <ColumnView scrollable>
              {handleSearchFilter(itemsToSearch, searchValue).map((item) => {
                return (
                  <ListItem
                    leftIcon={'package-variant'}
                    title={item?.fullAddress}
                    description={`${item?.forename} ${item.surname}`}
                    onPress={onPressAddress.bind(
                      null,
                      updateSelectedStop,
                      item.addressId
                    )}
                    key={item.addressId}
                  />
                );
              })}
            </ColumnView>
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  );
};

Search.propTypes = {
  bottomHeight: PropTypes.number,
  focused: PropTypes.bool,
  itemsToSearch: PropTypes.array,
  searchValue: PropTypes.string,
  stops: PropTypes.bool,
  updateSelectedStop: PropTypes.func,
  updateTransientProps: PropTypes.func
};

Search.defaultProps = {
  bottomHeight: 0,
  focused: false,
  itemsToSearch: [],
  searchValue: '',
  stops: false,
  updateSelectedStop: mock,
  updateTransientProps: mock
};

export default Search;
