import React from 'react';

import NavigationService from 'Navigation/service';

import { ColumnView, FullView, RowView } from 'Containers';
import { colors } from 'Theme';
import { Button, Text } from 'Components';

class UpgradeApp extends React.Component {
  render = () => (
    <FullView bgColor={colors.primary}>
      <ColumnView
        width={'100%'}
        flex={1}
        justifyContent={'flex-start'}
        alignItems={'stretch'}>
        <RowView>
          <Text.Title textAlign={'center'}>Larger text up</Text.Title>
        </RowView>
      </ColumnView>

      <Button.CallToAction
        title={'navigate'}
        onPress={NavigationService.goBack}
        icon
      />
    </FullView>
  );
}

export default UpgradeApp;
