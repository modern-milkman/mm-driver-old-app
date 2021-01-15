import Text from 'Components/Text';
import { colors, defaults, shadows } from 'Theme';

export default {
  defaultContainer: {
    borderBottomLeftRadius: defaults.borderRadius,
    borderBottomRightRadius: defaults.borderRadius
  },
  contentContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: defaults.marginVertical,
    marginHorizontal: defaults.marginHorizontal
  },
  defaultTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  error: {
    color: colors.white
  },
  messageStyle: {
    ...Text.List.style,
    color: colors.white,
    paddingVertical: defaults.marginVertical / 4
  },
  titleStyle: {
    ...Text.Heading.style,
    color: colors.white
  },
  shadow: {
    ...shadows.button
  },
  logo: {
    width: defaults.topNavigation.iconSize,
    height: defaults.topNavigation.iconSize,
    borderRadius: defaults.borderRadius,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.white,
    marginRight: defaults.marginHorizontal
  }
};
