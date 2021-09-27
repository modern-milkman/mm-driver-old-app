import React from 'react';
import { TouchableOpacity } from 'react-native';

import { deviceFrame } from 'Helpers';
import { defaults } from 'Theme';
import { Image, Text } from 'Components';
import { ColumnView, RowView } from 'Containers';

import style from './style';

export const renderImageTextModal = ({
  imageSource,
  onPress,
  renderFallback,
  text
}) => {
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
            <Text.List>{text}</Text.List>
          </RowView>
        )}
      </ColumnView>
    </TouchableOpacity>
  );
};
