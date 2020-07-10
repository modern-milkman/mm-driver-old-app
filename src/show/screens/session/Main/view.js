import React from 'react';
import PropTypes from 'prop-types';
import { SharedElement } from 'react-navigation-shared-element';

import I18n from 'Locales/I18n';

import { alphaColor, colors } from 'Resources/theme';
import { CarLogo } from 'Resources/images';
import { ColumnView } from 'Containers';
import { Button, BottomNavigation } from 'Components';

class Main extends React.Component {
  render = () => {
    const { logout } = this.props;
    return (
      <ColumnView
        width={'100%'}
        flex={1}
        justifyContent={'flex-end'}
        alignItems={'stretch'}
        backgroundColor={colors.standard}>
        <ColumnView flex={1}>
          <SharedElement id="car-transition">
            <CarLogo
              disabled
              width={200}
              fill={alphaColor('secondary', 0.05)}
            />
          </SharedElement>
        </ColumnView>
        <SharedElement id="loginout-btn-transition">
          <Button.Primary title={I18n.t('general:logout')} onPress={logout} />
        </SharedElement>

        <BottomNavigation />
      </ColumnView>
    );
  };
}

Main.propTypes = {
  logout: PropTypes.func,
  name: PropTypes.string
};

Main.sharedElements = (route, otherRoute, showing) => [
  { id: 'loginout-btn-transition', animation: 'fade' },
  { id: 'car-transition', animation: 'fade' }
];

export default Main;
