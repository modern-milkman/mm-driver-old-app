import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';

import { mock } from 'Helpers';
import { colors } from 'Theme';
import { Icon, Text } from 'Components';
import { ColumnView, RowView } from 'Containers';

const List = (props) => {
  const { items } = props;
  const groupLabel = Object.keys(items);

  return (
    <ColumnView scrollable width={'100%'} alignItems={'flex-start'}>
      {groupLabel.map((label) => (
        <>
          <Text.Callout color={'#000000'}>{label}</Text.Callout>

          {Object.values(items[label]).map(ListItem.bind(this))}
        </>
      ))}
    </ColumnView>
  );
};

export const ListItem = (item) => (
  <ColumnView alignItems={'flex-start'}>
    <TouchableOpacity onPress={item.onPress} onLongPress={item.onLongPress}>
      <RowView justifyContent={'space-between'}>
        <RowView width={44} justifyContent={'flex-start'}>
          <Icon
            name={'package-variant'}
            color={colors.black}
            size={32}
            containerSize={44}
          />
        </RowView>

        <ColumnView
          flex={4}
          justifyContent={'flex-start'}
          alignItems={'flex-start'}>
          <Text.Subhead color={colors.black} noPadding>
            {item.title}
          </Text.Subhead>

          {item.description && (
            <Text.Subhead color={colors.black} noPadding>
              {item.description}
            </Text.Subhead>
          )}
        </ColumnView>

        {item.rightText && (
          <RowView
            flex={2}
            marginRight={!item.rightIcon ? 15 : 0}
            justifyContent={'flex-end'}>
            <Text.Subhead color={colors.black} noMargin noPadding>
              {item.rightText}
            </Text.Subhead>
          </RowView>
        )}

        {item.rightIcon && (
          <RowView width={44} justifyContent={'flex-start'}>
            <Icon
              name={item.rightIcon}
              color={colors.black}
              size={32}
              containerSize={44}
            />
          </RowView>
        )}
      </RowView>
    </TouchableOpacity>
  </ColumnView>
);

ListItem.propTypes = {
  description: PropTypes.string,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  rightIcon: PropTypes.string,
  rightText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string
};

ListItem.defaultProps = {
  title: '',
  description: null,
  onLongPress: mock,
  onPress: mock,
  rightText: null,
  rightIcon: undefined
};

List.propTypes = {
  items: PropTypes.array
};

List.defaultProps = {
  items: []
};

export default List;
