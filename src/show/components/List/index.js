import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, SectionList, TouchableOpacity } from 'react-native';

import { mock } from 'Helpers';
import Icon from 'Components/Icon';
import Text from 'Components/Text';
import { CustomIcon } from 'Images';
import Image from 'Components/Image';
import { colors, defaults } from 'Theme';
import Separator from 'Components/Separator';
import { ColumnView, RowView } from 'Containers';

import style from './style.js';

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
        width={style.image.width}
        containerWidth={style.image.width}
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
  { onPress: listOnPress, onLongPress: listOnLongPress },
  { item }
) => {
  const {
    customIcon,
    customIconProps,
    customRightIcon,
    customRightIconProps,
    description,
    disabled = false,
    icon = 'package-variant',
    iconColor = colors.secondary,
    image,
    key,
    miscelaneousColor,
    miscelaneousLarge,
    miscelaneousSmall,
    onLongPress,
    onPress,
    rightIcon,
    rightIconColor = colors.primary,
    rightImage,
    title,
    titleExpands = false,
    titleColor = colors.secondary
  } = item;

  const computedOnPress =
    onPress?.bind(null, key) || listOnPress?.bind(null, key);
  const computedOnLongPress =
    onLongPress?.bind(null, key) || listOnLongPress?.bind(null, key);

  return (
    <TouchableOpacity
      style={style.listItemWrapper}
      disabled={disabled}
      onPress={computedOnPress}
      onLongPress={computedOnLongPress}
      {...(key && { key })}>
      {(customIcon || image || icon) && (
        <RowView
          width={style.image.width + defaults.marginHorizontal / 2}
          justifyContent={'flex-start'}>
          {renderImageIcon(customIcon, customIconProps, icon, iconColor, image)}
        </RowView>
      )}

      {(title || description) && (
        <ColumnView
          flex={4}
          justifyContent={title && description ? 'space-between' : 'center'}
          alignItems={'flex-start'}
          height={style.listItemWrapper.height - defaults.marginVertical}>
          <Text.List
            align={'left'}
            color={titleColor}
            {...(titleExpands && { numberOfLines: 2 })}>
            {title}
          </Text.List>
          <Text.Caption color={colors.secondary}>{description}</Text.Caption>
        </ColumnView>
      )}

      {(miscelaneousLarge || miscelaneousSmall) && (
        <RowView
          flex={2}
          justifyContent={'flex-end'}
          alignItems={
            miscelaneousLarge && miscelaneousSmall ? 'space-between' : 'center'
          }>
          <Text.Button
            align={'right'}
            color={miscelaneousColor || colors.secondaryLight}
            noMargin
            noPadding>
            {miscelaneousLarge}
          </Text.Button>
          <Text.Caption
            align={'right'}
            color={miscelaneousColor || colors.inputDark}
            noMargin
            noPadding>
            {miscelaneousSmall}
          </Text.Caption>
        </RowView>
      )}
      {(customRightIcon || rightImage || rightIcon) && (
        <RowView width={style.image.width} justifyContent={'flex-end'}>
          {renderImageIcon(
            customRightIcon,
            customRightIconProps,
            rightIcon,
            rightIconColor,
            rightImage
          )}
        </RowView>
      )}
    </TouchableOpacity>
  );
};

const List = (props) => {
  const {
    data,
    extraData,
    hasSections,
    onPress,
    onLongPress,
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
      renderItem={renderItem.bind(null, { onPress, onLongPress })}
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

const SectionHeader = ({ section }) => {
  return (
    (section && (
      <RowView
        backgroundColor={colors.neutral}
        justifyContent={'flex-start'}
        alignItems={'flex-end'}
        marginHorizontal={defaults.marginHorizontal}
        width={'auto'}
        height={Text.Label.height + defaults.marginVertical}>
        <Text.Label color={colors.inputDark}>{section.title}</Text.Label>
      </RowView>
    )) ||
    null
  );
};

List.propTypes = {
  data: PropTypes.array.isRequired,
  extraData: PropTypes.any,
  hasSections: PropTypes.bool,
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
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  image: PropTypes.string,
  item: PropTypes.object,
  miscelaneousLarge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  miscelaneousSmall: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  rightIcon: PropTypes.string,
  rightIconColor: PropTypes.string,
  rightImage: PropTypes.string,
  title: PropTypes.string,
  titleExpands: PropTypes.bool,
  titleColor: PropTypes.string
};

ListItem.defaultProps = {
  // should also be added to renderItemInterface method
  customIcon: null,
  customIconProps: null,
  customRightIcon: null,
  customRightIconProps: null,
  description: null,
  disabled: false,
  icon: 'package-variant',
  iconColor: colors.secondary,
  image: null,
  onLongPress: mock,
  onPress: mock,
  rightIcon: null,
  rightIconColor: colors.primary,
  rightImage: null,
  miscelaneousLarge: null,
  miscelaneousSmall: null,
  title: null,
  titleExpands: false,
  titleColor: colors.secondary
};

export default List;
export { ListItem, SectionHeader };
