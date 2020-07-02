import React from 'react';
import { SharedElement } from 'react-navigation-shared-element';

import NavigationService from '/process/navigation/service';

import { ColumnView, FullView, RowView } from '/show/containers';
import { colors } from '/show/resources/theme';
import { Button, Text } from '/show/components';

class UpgradeApp extends React.Component {
  render = () => (
    <FullView bgColor={colors.primary}>
      <ColumnView
        width={'100%'}
        flex={1}
        justifyContent={'flex-start'}
        alignItems={'stretch'}>
        <RowView>
          <SharedElement id="awesome-transition-text">
            <Text.Title textAlign={'center'}>Larger text up</Text.Title>
          </SharedElement>
        </RowView>
      </ColumnView>

      <SharedElement id="awesome-transition">
        <Button.CallToAction
          title={'navigate'}
          onPress={NavigationService.goBack}
          icon
        />
      </SharedElement>
    </FullView>
  );
}

UpgradeApp.sharedElements = (route, otherRoute, showing) => [
  { id: 'awesome-transition-text', animation: 'fade' },
  { id: 'awesome-transition', animation: 'fade' }
];

export default UpgradeApp;
