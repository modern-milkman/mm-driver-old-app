import React from 'react';
import PropTypes from 'prop-types';
import { SharedElement } from 'react-navigation-shared-element';

import I18n from '/process/locales/I18n';

import { colors } from '/show/resources/theme';
import { Button, Text } from '/show/components';
import { ColumnView, FullView, RowView } from '/show/containers';

class Main extends React.Component {
  render = () => {
    const { logout, name } = this.props;
    return (
      <FullView bgColor={colors.standard}>
        <ColumnView
          width={'100%'}
          flex={1}
          justifyContent={'flex-start'}
          alignItems={'stretch'}>
          <RowView>
            <Text.Callout textAlign={'center'} color={colors.primary}>
              {`Hey, ${name}! "You're now logged in!"`}
            </Text.Callout>
          </RowView>
        </ColumnView>

        <SharedElement id="awesome-transition">
          <Button.Primary title={I18n.t('general:logout')} onPress={logout} />
        </SharedElement>
      </FullView>
    );
  };
}

Main.propTypes = {
  logout: PropTypes.func,
  name: PropTypes.string
};

Main.sharedElements = (route, otherRoute, showing) => [
  { id: 'awesome-transition', animation: 'fade' }
];

export default Main;
