import Api from 'Api';
import Config from 'react-native-config';

export default {
  getForDriver() {
    return Api.get('/Delivery/GetForDriver');
  },

  getVehicleStockForDriver() {
    return Api.get('/Delivery/GetVehicleStockForDriver');
  },
  patchDelivered(orderId) {
    return Api.patch(`/Delivery/SetDelivered/${orderId}`);
  },
  patchItemOutOfStock(itemId) {
    return Api.patch(`/Delivery/SetOutfStock/${itemId}`);
  },
  patchRejected(orderId, description) {
    return Api.patch(`/Delivery/SetRejected/${orderId}`, {
      reasonType: 3, //Reason Types are: WrongAddress = 1, PinWrong = 2, Other = 3
      description
    });
  },
  updateDirectionsPolyline({ origin, destination }) {
    return Api.get(
      `${Config.DIRECTIONS_API_URL}?origin=${origin}&destination=${destination}`
    );
  }
};
