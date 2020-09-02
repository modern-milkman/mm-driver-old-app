import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, View } from 'react-native';

import { mock } from 'Helpers';
import { colors } from 'Theme';
import I18n from 'Locales/I18n';
import { Icon } from 'Components';
import { RowView } from 'Containers';

import style from './style';
import TextInput from '../TextInput';

const defaultLeftIcon = (
  <Icon
    type={'material'}
    name={'search'}
    color={colors.primary}
    size={20}
    containerSize={20}
    disabled
  />
);

const renderLeftIcon = (processing, LeftIcon) => {
  if (processing) {
    return <ActivityIndicator />;
  }

  return LeftIcon;
};

const SearchBar = (props) => {
  const {
    leftIcon,
    onChangeText,
    onFocusChanged,
    placeholder,
    processing,
    returnKeyType,
    rightIcon,
    rightIconAction,
    value
  } = props;

  return (
    <RowView alignItems={'stretch'}>
      <RowView alignItems={'stretch'} flex={1} marginHorizontal={8}>
        <View style={[style.iconWrapper, style.searchIconWrapper]}>
          {renderLeftIcon(processing, leftIcon)}
        </View>

        <TextInput
          onFocusChanged={onFocusChanged}
          style={style.input}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          returnKeyType={returnKeyType}
          noMargin
          rightIcon={rightIcon}
          rightIconAction={rightIconAction}
        />
      </RowView>
    </RowView>
  );
};

SearchBar.propTypes = {
  leftIcon: PropTypes.node,
  onChangeText: PropTypes.func.isRequired,
  onFocusChanged: PropTypes.func.isRequired,
  processing: PropTypes.bool,
  placeholder: PropTypes.string,
  returnKeyType: PropTypes.string,
  rightIcon: PropTypes.string.isRequired,
  rightIconAction: PropTypes.func,
  value: PropTypes.string.isRequired
};

SearchBar.defaultProps = {
  leftIcon: defaultLeftIcon,
  onChangeText: mock,
  onFocusChanged: mock,
  processing: false,
  placeholder: I18n.t('screens:main.search.placeholder'),
  returnKeyType: 'search',
  rightIcon: 'close-circle-outline',
  value: ''
};

export default SearchBar;
