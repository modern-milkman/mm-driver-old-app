import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, SectionList, TouchableOpacity } from 'react-native';

import { mock } from 'Helpers';
import Icon from 'Components/Icon';
import Text from 'Components/Text';
import { CustomIcon } from 'Images';
import Image from 'Components/Image';
import Separator from 'Components/Separator';
import { colors, defaults, sizes } from 'Theme';
import { ColumnView, RowView } from 'Containers';

import style from './style.js';
import ListHeader from './ListHeader';

const defaultRenderListEmptyComponent = () => null;
const defaultRenderItemSeparator = () => <Separator marginLeft={20} />;
const defaultSectionFooter = () => <Separator />;
const widthReducer = 0.8;

const renderImageIcon = (
  customIcon,
  customIconProps,
  icon,
  iconColor,
  image
) => {
  if (image) {
    return (
      <Image
        requiresAuthentication
        style={style.image}
        source={{
          uri: image
        }}
        resizeMode={'contain'}
        width={style.image.width}
      />
    );
  }
  if (customIcon) {
    return (
      <CustomIcon
        width={customIconProps?.width || style.image.width}
        containerWidth={customIconProps?.containerWidth || style.image.width}
        icon={customIcon}
        iconColor={customIconProps?.color}
        bgColor={customIconProps?.bgColor}
        disabled
      />
    );
  }
  if (icon) {
    return (
      <Icon
        name={icon}
        color={iconColor}
        size={style.image.width * widthReducer}
        containerSize={style.image.width}
        disabled
      />
    );
  }
};

const renderItemInterface = (
  {
    disabled: listDisabled,
    onPress: listOnPress,
    onLongPress: listOnLongPress,
    listItemStyle: listStyle
  },
  { item }
) => {
  const {
    customIcon,
    customIconProps,
    customRightIcon,
    customRightIconProps,
    description,
    disabled = listDisabled || false,
    enforceLayout = false,
    icon,
    iconColor = colors.secondary,
    image,
    key,
    listItemStyle,
    miscelaneousBottom,
    MiscelaneousBottomTextComponent = Text.Caption,
    miscelaneousColor,
    miscelaneousTop,
    MiscelaneousTopTextComponent = Text.Button,
    moreInfo,
    onLongPress,
    onPress,
    rightComponent = mock,
    rightIcon,
    rightIconColor = colors.primary,
    rightImage,
    secondaryCustomRightIcon,
    secondaryCustomRightIconProps,
    secondaryRightImage,
    secondaryRightIcon,
    title,
    titleColor = colors.secondary,
    titleExpands = false
  } = item;

  const computedOnPress =
    onPress?.bind(null, key) || listOnPress?.bind(null, key);
  const computedOnLongPress =
    onLongPress?.bind(null, key) || listOnLongPress?.bind(null, key);

  return (
    <TouchableOpacity
      style={[style.listItemWrapper, listStyle, listItemStyle]}
      disabled={disabled}
      onPress={computedOnPress}
      onLongPress={computedOnLongPress}
      {...(key && { key })}>
      <RowView
        minHeight={sizes.list.height - defaults.marginVertical / 2}
        justifyContent={'space-between'}
        alignItems={'center'}>
        {(customIcon || image || icon || enforceLayout) && (
          <RowView
            width={style.image.width + defaults.marginHorizontal / 2}
            justifyContent={'flex-start'}>
            {(customIcon || image || icon) &&
              renderImageIcon(
                customIcon,
                customIconProps,
                icon,
                iconColor,
                image
              )}
          </RowView>
        )}

        {(title || description) && (
          <ColumnView
            flex={4}
            justifyContent={title && description ? 'space-between' : 'center'}
            alignItems={'flex-start'}>
            <Text.List
              align={'left'}
              color={titleColor}
              {...(titleExpands && { numberOfLines: 2 })}>
              {title}
            </Text.List>
            <Text.Caption color={colors.secondary}>{description}</Text.Caption>
          </ColumnView>
        )}

        {(miscelaneousTop || miscelaneousBottom) && (
          <ColumnView
            flex={2}
            justifyContent={'flex-end'}
            alignItems={
              miscelaneousTop && miscelaneousBottom ? 'space-between' : 'center'
            }>
            <MiscelaneousTopTextComponent
              align={'right'}
              color={miscelaneousColor || colors.secondaryLight}
              noMargin
              noPadding>
              {miscelaneousTop}
            </MiscelaneousTopTextComponent>
            <MiscelaneousBottomTextComponent
              align={'right'}
              color={miscelaneousColor || colors.inputDark}
              noMargin
              noPadding>
              {miscelaneousBottom}
            </MiscelaneousBottomTextComponent>
          </ColumnView>
        )}
        {rightComponent}

        {(secondaryCustomRightIcon ||
          secondaryRightImage ||
          secondaryRightIcon) && (
          <RowView
            width={style.image.width}
            justifyContent={'flex-end'}
            marginRight={defaults.marginHorizontal / 4}>
            {(secondaryCustomRightIcon ||
              secondaryRightImage ||
              secondaryRightIcon) &&
              renderImageIcon(
                secondaryCustomRightIcon,
                secondaryCustomRightIconProps
              )}
          </RowView>
        )}
        {(customRightIcon || rightImage || rightIcon || enforceLayout) && (
          <RowView width={style.image.width} justifyContent={'flex-end'}>
            {(customRightIcon || rightImage || rightIcon) &&
              renderImageIcon(
                customRightIcon,
                customRightIconProps,
                rightIcon,
                rightIconColor,
                rightImage
              )}
          </RowView>
        )}
      </RowView>

      {moreInfo?.length > 0 && (
        <RowView
          justifyContent={'flex-start'}
          alignItems={'flex-start'}
          marginVertical={defaults.marginVertical / 2}>
          <ColumnView
            alignItems={'flex-start'}
            justifyContent={'flex-start'}
            width={'auto'}
            flex={1}>
            <Text.List align={'left'} color={colors.secondary}>
              {moreInfo}
            </Text.List>
          </ColumnView>
        </RowView>
      )}
    </TouchableOpacity>
  );
};

const List = (props) => {
  const {
    data,
    disabled,
    extraData,
    hasSections,
    listItemStyle,
    onLongPress,
    onPress,
    renderFooterComponent,
    renderHeaderComponent,
    renderItem,
    renderItemSeparator,
    renderSectionFooter,
    renderSectionHeader,
    style: styleProps
  } = props;
  const RenderComponent = hasSections ? SectionList : FlatList;

  return (
    <RenderComponent
      {...(!hasSections && { data })}
      {...(hasSections && { sections: data })}
      extraData={extraData}
      keyExtractor={(item, index) => index}
      renderItem={renderItem.bind(null, {
        disabled,
        onPress,
        onLongPress,
        listItemStyle
      })}
      renderSectionFooter={renderSectionFooter}
      renderSectionHeader={renderSectionHeader}
      ListFooterComponent={renderFooterComponent}
      ListHeaderComponent={renderHeaderComponent}
      ItemSeparatorComponent={renderItemSeparator}
      style={[style.renderWrapper, styleProps]}
      initialNumToRender={15}
      keyboardShouldPersistTaps={'handled'}
    />
  );
};

const ListItem = (item) => renderItemInterface({}, { item });

const SectionHeader = ({ section }) =>
  (section && <ListHeader title={section.title} />) || null;

List.propTypes = {
  data: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  extraData: PropTypes.any,
  hasSections: PropTypes.bool,
  listItemStyle: PropTypes.object,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  renderFooterComponent: PropTypes.func,
  renderHeaderComponent: PropTypes.func,
  renderItem: PropTypes.func.isRequired,
  renderItemSeparator: PropTypes.func,
  renderSectionFooter: PropTypes.func,
  renderSectionHeader: PropTypes.func,
  style: PropTypes.any
};

List.defaultProps = {
  data: {},
  extraData: null,
  hasSections: false,
  listItemStyle: {},
  onLongPress: mock,
  onPress: mock,
  renderFooterComponent: mock,
  renderHeaderComponent: mock,
  renderItem: renderItemInterface,
  renderItemSeparator: defaultRenderItemSeparator,
  renderListEmptyComponent: defaultRenderListEmptyComponent,
  renderSectionFooter: defaultSectionFooter,
  renderSectionHeader: SectionHeader,
  style: {}
};

ListItem.propTypes = {
  customIcon: PropTypes.string,
  customIconProps: PropTypes.object,
  customRightIcon: PropTypes.string,
  customRightIconProps: PropTypes.object,
  description: PropTypes.string,
  disabled: PropTypes.bool,
  enforceLayout: PropTypes.bool,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  image: PropTypes.string,
  item: PropTypes.object,
  listItemStyle: PropTypes.object,
  miscelaneousBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  miscelaneousTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  moreInfo: PropTypes.any,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  rightComponent: PropTypes.func,
  rightIcon: PropTypes.string,
  rightIconColor: PropTypes.string,
  rightImage: PropTypes.string,
  secondaryCustomRightIcon: PropTypes.any,
  secondaryCustomRightIconProps: PropTypes.object,
  secondaryRightImage: PropTypes.any,
  secondaryRightIcon: PropTypes.any,
  title: PropTypes.string,
  titleColor: PropTypes.string,
  titleExpands: PropTypes.bool
};

ListItem.defaultProps = {
  // should also be added to renderItemInterface method
  customIcon: null,
  customIconProps: null,
  customRightIcon: null,
  customRightIconProps: null,
  description: null,
  enforceLayout: false,
  disabled: false,
  icon: null,
  iconColor: colors.secondary,
  image: null,
  listItemStyle: {},
  miscelaneousBottom: null,
  MiscelaneousBottomTextComponent: Text.Caption,
  miscelaneousTop: null,
  MiscelaneousTopTextComponent: Text.Button,
  moreInfo: null,
  onLongPress: mock,
  onPress: mock,
  rightComponent: mock,
  rightIcon: null,
  rightIconColor: colors.primary,
  rightImage: null,
  secondaryCustomRightIcon: null,
  secondaryCustomRightIconProps: {},
  secondaryRightImage: null,
  secondaryRightIcon: null,
  title: null,
  titleColor: colors.secondary,
  titleExpands: false
};

export default List;
export { ListItem, ListHeader, SectionHeader };
