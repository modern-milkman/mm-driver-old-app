import React from 'react';
import { SharedElement } from 'react-navigation-shared-element';

import NavigationService from '/process/navigation/service';

import { colors } from '/show/resources/theme';
import { Button, Text } from '/show/components';
import { ColumnView, FullView, RowView } from '/show/containers';

class Home extends React.Component {
  render = () => {
    return (
      <FullView bgColor={colors.primary}>
        <ColumnView
          width={'100%'}
          flex={1}
          justifyContent={'flex-start'}
          alignItems={'stretch'}>
          <SharedElement id="awesome-transition">
            <Button.CallToAction
              title={'navigate'}
              onPress={NavigationService.navigate.bind(null, {
                routeName: 'UpgradeApp'
              })}
              icon
            />
          </SharedElement>
        </ColumnView>
        <RowView>
          <SharedElement id="awesome-transition-text">
            <Text.Title textAlign={'center'}>Larger text down</Text.Title>
          </SharedElement>
        </RowView>
      </FullView>
    );
  };
}

Home.propTypes = {};

export default Home;
