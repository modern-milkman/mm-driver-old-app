import Api from 'Api';
import I18n from 'Locales/I18n';
import Alert from 'Services/alert';
import Analytics, { EVENTS } from 'Services/analytics';

const rateMyRound = ({ updateChecklistProps, updateInAppBrowserProps }) => {
  updateChecklistProps({ rateMyRound: true });
  updateInAppBrowserProps({
    visible: true,
    url: Api.RATE_MY_ROUND()
  });
};

const rateMyRoundSecondAlert = ({
  updateChecklistProps,
  updateInAppBrowserProps,
  goodRate
}) => {
  Analytics.trackEvent(
    goodRate ? EVENTS.RATE_MY_ROUND_GOOD : EVENTS.RATE_MY_ROUND_BAD
  );

  Alert({
    message: I18n.t(
      `screens:checkIn.rateMyRound.alert.${goodRate ? 'happy' : 'sad'}`
    ),
    buttons: [
      {
        text: I18n.t('general:ok'),
        onPress: rateMyRound.bind(null, {
          updateChecklistProps,
          updateInAppBrowserProps
        })
      }
    ]
  });
};

export const openRateMyRound = ({
  updateChecklistProps,
  updateInAppBrowserProps
}) => {
  Alert({
    message: I18n.t('screens:checkIn.rateMyRound.alert.title'),
    buttons: [
      {
        text: I18n.t('general:no'),
        onPress: rateMyRoundSecondAlert.bind(null, {
          updateChecklistProps,
          updateInAppBrowserProps,
          goodRate: false
        })
      },
      {
        text: I18n.t('general:yes'),
        onPress: rateMyRoundSecondAlert.bind(null, {
          updateChecklistProps,
          updateInAppBrowserProps,
          goodRate: true
        })
      }
    ]
  });
};
