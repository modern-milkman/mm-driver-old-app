import React from 'react';
import PropTypes from 'prop-types';
import { SharedElement } from 'react-navigation-shared-element';

import { colors } from '/show/resources/theme';
import { Button, Text } from '/show/components';
import { ColumnView, FullView, RowView } from '/show/containers';

class Main extends React.Component {
  render = () => {
    const { logout } = this.props;
    return (
      <FullView bgColor={colors.primary}>
        <ColumnView
          width={'100%'}
          flex={1}
          justifyContent={'flex-start'}
          alignItems={'stretch'}>
          <RowView>
            <SharedElement id="awesome-transition-text">
              <Text.Title textAlign={'center'}>
                {"You're now logged in"}
              </Text.Title>
            </SharedElement>
          </RowView>
        </ColumnView>

        <SharedElement id="awesome-transition">
          <Button.CallToAction title={'log out'} onPress={logout} />
        </SharedElement>
      </FullView>
    );
  };
}

Main.propTypes = {
  logout: PropTypes.func
};

Main.sharedElements = (route, otherRoute, showing) => [
  { id: 'awesome-transition-text', animation: 'fade' },
  { id: 'awesome-transition', animation: 'fade' }
];

export default Main;
