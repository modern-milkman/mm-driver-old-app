import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';

import { deviceFrame } from 'Helpers';
import { defaults } from 'Theme';
import { Image, Text } from 'Components';
import { ColumnView, RowView, useTheme } from 'Containers';

import style from './style';

export const ImageTextModal = ({
  imageSource,
  onPress,
  renderFallback,
  text
}) => {
  const { colors } = useTheme();
  const { width, height } = deviceFrame();
  return (
    <TouchableOpacity
      style={style.fullView}
      onPress={onPress.bind(null, false)}>
      <ColumnView flex={1} justifyContent={'center'} alignItems={'center'}>
        <Image
          source={imageSource}
          style={style.image}
          width={width - defaults.marginHorizontal * 2}
          maxHeight={height * 0.7}
          renderFallback={renderFallback}
        />
        {text && (
          <RowView
            height={'auto'}
            alignItems={'flex-start'}
            marginVertical={defaults.marginVertical}
            width={'auto'}
            marginHorizontal={defaults.marginHorizontal}>
            <Text.List color={colors.whiteOnly}>{text}</Text.List>
          </RowView>
        )}
      </ColumnView>
    </TouchableOpacity>
  );
};

ImageTextModal.propTypes = {
  imageSource: PropTypes.object,
  onPress: PropTypes.func,
  renderFallback: PropTypes.any,
  text: PropTypes.string
};
