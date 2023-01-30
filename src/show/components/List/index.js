//testID supported by List ListItem
import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, SectionList, TouchableOpacity } from 'react-native';

import { mock } from 'Helpers';
import Icon from 'Components/Icon';
import Text from 'Components/Text';
import { CustomIcon } from 'Images';
import Image from 'Components/Image';
import Separator from 'Components/Separator';
import { defaults, sizes } from 'Theme';
import { ColumnView, RowView, useTheme } from 'Containers';

import style from './style.js';
import ListHeader from './ListHeader';

const defaultRenderListEmptyComponent = () => null;
const defaultRenderItemSeparator = () => <Separator marginLeft={20} />;
const defaultSectionFooter = () => <Separator />;
const widthReducer = 0.8;

const renderCustomIcon = ({ customIcon, customIconProps, testID }) => (
  <CustomIcon
    width={customIconProps?.width || style.image.width}
    containerWidth={customIconProps?.containerWidth || style.image.width}
    icon={customIcon}
    iconColor={customIconProps?.color}
    bgColor={customIconProps?.bgColor}
    disabled
    testID={`${testID}-customIcon-${customIcon}`}
  />
);

const renderIcon = ({ customIconProps, icon, iconColor, testID }) => (
  <Icon
    name={icon}
    color={iconColor}
    size={
      customIconProps?.width
        ? customIconProps.width
        : style.image.width * widthReducer
    }
    containerSize={
      customIconProps?.containerSize
        ? customIconProps.containerSize
        : style.image.width
    }
    disabled
    testID={`${testID}-icon-${icon}`}
  />
);

const renderImage = ({ customIcon, customIconProps, image, testID }) => (
  <Image
    requiresAuthentication
    style={style.image}
    source={{
      uri: image
    }}
    resizeMode={'contain'}
    width={style.image.width}
    {...(customIcon && {
      renderFallback: renderCustomIcon.bind(null, {
        customIcon,
        customIconProps
      })
    })}
    testID={`${testID}-image`}
  />
);

const renderMedia = ({
  customIcon,
  customIconProps,
  icon,
  iconColor,
  image,
  testID
}) => {
  if (image) {
    return renderImage({ customIcon, customIconProps, image, testID });
  }
  if (customIcon) {
    return renderCustomIcon({ customIcon, customIconProps, testID });
  }
  if (icon) {
    return renderIcon({ icon, iconColor, customIconProps, testID });
  }
};

const renderPrefix = ({
  colors,
  prefix,
  prefixColor,
  PrefixTextComponent,
  testID
}) => (
  <ColumnView flex={1} justifyContent={'center'} alignItems={'flex-start'}>
    <PrefixTextComponent
      align={'left'}
      color={prefixColor || colors.inputSecondary}
      testID={`${testID}-prefix`}>
      {prefix}
    </PrefixTextComponent>
  </ColumnView>
);

const renderSuffix = ({
  colors,
  suffixBottom,
  SuffixBottomTextComponent,
  suffixColor,
  suffixTop,
  SuffixTopTextComponent,
  testID
}) => (
  <ColumnView
    flex={2}
    justifyContent={'flex-end'}
    alignItems={suffixTop && suffixBottom ? 'space-between' : 'center'}>
    <SuffixTopTextComponent
      align={'right'}
      color={suffixColor || colors.inputSecondary}
      testID={`${testID}-suffixTop`}>
      {suffixTop}
    </SuffixTopTextComponent>
    <SuffixBottomTextComponent
      align={'right'}
      color={suffixColor || colors.inputSecondary}
      testID={`${testID}-suffixBottom`}>
      {suffixBottom}
    </SuffixBottomTextComponent>
  </ColumnView>
);

const renderItemInterface = (
  {
    colors,
    disabled: listDisabled,
    onPress: listOnPress,
    onLongPress: listOnLongPress,
    listItemStyle: listStyle
  },
  { item, section }
) => {
  const {
    customIcon,
    customIconProps,
    customRightIcon,
    customRightIconProps,
    description,
    descriptionColor = colors.inputSecondary,
    disabled: listItemDisabled,
    isDeliveryItem,
    enforceLayout = false,
    icon,
    iconColor = colors.inputSecondary,
    image,
    key,
    listItemStyle,
    moreInfo,
    onLongPress,
    onPress,
    prefix,
    prefixColor,
    PrefixTextComponent = Text.Input,
    rightComponent,
    rightIcon,
    rightIconColor = colors.primary,
    rightImage,
    secondaryCustomRightIcon,
    secondaryCustomRightIconProps,
    secondaryRightImage,
    secondaryRightIcon,
    suffixBottom,
    SuffixBottomTextComponent = Text.Caption,
    suffixColor,
    suffixTop,
    SuffixTopTextComponent = Text.Button,
    testID,
    title,
    titleColor = colors.inputSecondary,
    titleExpands = false
  } = item;

  const computedOnPress =
    onPress?.bind(null, key) || listOnPress?.bind(null, key);
  const computedOnLongPress =
    onLongPress?.bind(null, key) || listOnLongPress?.bind(null, key);
  const disabled =
    listDisabled || section?.disabled || listItemDisabled || false;

  return (
    <TouchableOpacity
      style={[style.listItemWrapper, listStyle, listItemStyle]}
      disabled={disabled}
      onPress={computedOnPress}
      onLongPress={computedOnLongPress}
      {...(key && { key })}
      testID={testID}>
      <RowView
        backgroundColor={isDeliveryItem && colors.input}
        borderRadius={isDeliveryItem && defaults.borderRadius}
        paddingHorizontal={isDeliveryItem && defaults.marginHorizontal / 4}
        paddingVertical={isDeliveryItem && defaults.marginVertical / 4}
        minHeight={sizes.list.height - defaults.marginVertical / 2}
        justifyContent={'space-between'}
        alignItems={'center'}>
        {(customIcon || image || icon || enforceLayout) && (
          <RowView
            width={
              (customIconProps ? customIconProps.width : style.image.width) +
              defaults.marginHorizontal / 2
            }
            justifyContent={'flex-start'}>
            {(customIcon || image || icon) &&
              renderMedia({
                customIcon,
                customIconProps,
                icon,
                iconColor,
                image,
                testID
              })}
          </RowView>
        )}

        {prefix &&
          renderPrefix({
            colors,
            prefix,
            prefixColor,
            PrefixTextComponent,
            testID
          })}

        {(title || description) && (
          <ColumnView
            flex={4}
            justifyContent={title && description ? 'space-between' : 'center'}
            alignItems={'flex-start'}>
            {Array.isArray(title) ? (
              title.map(el => (
                <Text.List
                  key={el}
                  align={'left'}
                  color={titleColor}
                  {...(titleExpands && { numberOfLines: 2 })}
                  testID={`${testID}-title`}>
                  {el}
                </Text.List>
              ))
            ) : (
              <Text.List
                align={'left'}
                color={titleColor}
                {...(titleExpands && { numberOfLines: 2 })}
                testID={`${testID}-title`}>
                {title}
              </Text.List>
            )}
            <Text.Caption
              color={descriptionColor}
              testID={`${testID}-description`}>
              {description}
            </Text.Caption>
          </ColumnView>
        )}

        {(suffixTop || suffixBottom) &&
          renderSuffix({
            colors,
            suffixBottom,
            SuffixBottomTextComponent,
            suffixColor,
            suffixTop,
            SuffixTopTextComponent,
            testID
          })}

        {rightComponent}

        {(secondaryCustomRightIcon ||
          secondaryRightImage ||
          secondaryRightIcon) && (
          <RowView
            width={style.image.width}
            justifyContent={'flex-end'}
            marginRight={defaults.marginHorizontal / 4}
            testID={`${testID}-secondaryRight`}>
            {(secondaryCustomRightIcon ||
              secondaryRightImage ||
              secondaryRightIcon) &&
              renderMedia({
                customIcon: secondaryCustomRightIcon,
                customIconProps: secondaryCustomRightIconProps,
                testID
              })}
          </RowView>
        )}
        {(customRightIcon || rightImage || rightIcon || enforceLayout) && (
          <RowView
            width={style.image.width}
            justifyContent={'flex-end'}
            testID={`${testID}-right`}>
            {(customRightIcon || rightImage || rightIcon) &&
              renderMedia({
                customIcon: customRightIcon,
                customIconProps: customRightIconProps,
                icon: rightIcon,
                iconColor: rightIconColor,
                image: rightImage,
                testID
              })}
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
            <Text.List align={'left'} color={colors.inputSecondary}>
              {moreInfo}
            </Text.List>
          </ColumnView>
        </RowView>
      )}
    </TouchableOpacity>
  );
};

const List = props => {
  const { colors } = useTheme();
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
    style: styleProps,
    testID
  } = props;
  const RenderComponent = hasSections ? SectionList : FlatList;

  return (
    <RenderComponent
      {...(!hasSections && { data })}
      {...(hasSections && { sections: data })}
      extraData={extraData}
      keyExtractor={(item, index) => index}
      renderItem={renderItem.bind(null, {
        colors,
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
      testID={testID}
    />
  );
};

const ListItem = item => {
  const { colors } = useTheme();
  return renderItemInterface({ colors }, { item });
};

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
  style: PropTypes.any,
  testID: PropTypes.string
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
  prefix: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  suffixBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  suffixTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  moreInfo: PropTypes.any,
  onLongPress: PropTypes.func,
  onPress: PropTypes.func,
  rightComponent: PropTypes.any,
  rightIcon: PropTypes.string,
  rightIconColor: PropTypes.string,
  rightImage: PropTypes.string,
  secondaryCustomRightIcon: PropTypes.any,
  secondaryCustomRightIconProps: PropTypes.object,
  secondaryRightImage: PropTypes.any,
  secondaryRightIcon: PropTypes.any,
  testID: PropTypes.string,
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
  image: null,
  listItemStyle: {},
  moreInfo: null,
  onLongPress: mock,
  onPress: mock,
  prefix: null,
  PrefixTextComponent: Text.Input,
  rightComponent: null,
  rightIcon: null,
  rightImage: null,
  secondaryCustomRightIcon: null,
  secondaryCustomRightIconProps: {},
  secondaryRightImage: null,
  secondaryRightIcon: null,
  suffixBottom: null,
  SuffixBottomTextComponent: Text.Caption,
  suffixTop: null,
  SuffixTopTextComponent: Text.Button,
  title: null,
  titleExpands: false
};

SectionHeader.propTypes = {
  section: PropTypes.object
};

export default List;
export { ListItem, ListHeader, SectionHeader };
