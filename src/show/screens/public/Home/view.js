import React from 'react';
import PropTypes from 'prop-types';
import { SharedElement } from 'react-navigation-shared-element';

import { colors } from '/show/resources/theme';
import { Button, Text } from '/show/components';
import { ColumnView, FullView, RowView } from '/show/containers';

class Home extends React.Component {
  render = () => {
    const { login, processing } = this.props;
    return (
      <FullView bgColor={colors.primary}>
        <ColumnView
          width={'100%'}
          flex={1}
          justifyContent={'flex-start'}
          alignItems={'stretch'}>
          <SharedElement id="awesome-transition">
            <Button.CallToAction
              title={'dummy login'}
              onPress={login}
              processing={processing}
              disabled={processing}
            />
          </SharedElement>
        </ColumnView>
        <RowView>
          <SharedElement id="awesome-transition-text">
            <Text.Title textAlign={'center'}>Home screen</Text.Title>
          </SharedElement>
        </RowView>
      </FullView>
    );
  };
}

Home.propTypes = {
  login: PropTypes.func,
  processing: PropTypes.bool
};

export default Home;
