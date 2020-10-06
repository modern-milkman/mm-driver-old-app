import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

import Icon from 'Components/Icon';
import Text from 'Components/Text';
import { CustomIcon } from 'Images';
import { ColumnView, RowView } from 'Containers';

import { colors, defaults, sizes } from 'Theme';

import style from './style';

const widthReducer = 0.8;

const ExpandingRows = (props) => {
  const { children, leftIcon, title } = props;

  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity onPress={setExpanded.bind(null, !expanded)}>
      <ColumnView justifyContent={'flex-start'} alignItems={'flex-start'}>
        <RowView
          justifyContent={'flex-start'}
          alignItems={'flex-start'}
          minHeight={sizes.list.height}
          marginHorizontal={defaults.marginHorizontal}
          width={'auto'}>
          <ColumnView
            width={style.image.width + defaults.marginHorizontal / 2}
            alignItems={'flex-start'}
            height={sizes.list.height}>
            <CustomIcon
              width={style.image.width * widthReducer}
              containerWidth={style.image.width}
              icon={leftIcon}
            />
          </ColumnView>
          <ColumnView
            flex={1}
            paddingVertical={defaults.paddingHorizontal / 2}
            minHeight={sizes.list.height}
            alignItems={'flex-start'}>
            <Text.Caption
              {...(!expanded && { numberOfLines: 2 })}
              color={colors.secondary}
              noPadding>
              {title}
            </Text.Caption>
          </ColumnView>
          <ColumnView
            width={style.image.width * widthReducer}
            height={sizes.list.height}>
            <Icon
              name={`chevron-${expanded ? 'up' : 'down'}`}
              size={style.image.width * widthReducer}
              containerSize={style.image.width * widthReducer}
              disabled
              // style={{ TODO FIX ALIGMENT HERE
              //   transform: [{ translateX: style.image.width * 0.2 }]
              // }}
            />
          </ColumnView>
        </RowView>
        {expanded && children && (
          <RowView
            marginRight={defaults.marginHorizontal}
            marginLeft={
              style.image.width +
              defaults.marginHorizontal +
              defaults.marginHorizontal / 2
            }
            width={'auto'}
            justifyContent={'flex-start'}
            marginBottom={defaults.paddingHorizontal / 2}>
            {children}
          </RowView>
        )}
      </ColumnView>
    </TouchableOpacity>
  );
};

ExpandingRows.propTypes = {
  children: PropTypes.any,
  leftIcon: PropTypes.string,
  title: PropTypes.string
};

ExpandingRows.defaultProps = {
  children: null,
  leftIcon: 'list'
};

export default ExpandingRows;
