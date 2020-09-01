import Api from 'Api';

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
    return Api.patch(`/api/Delivery/SetRejected/${orderId}`, {
      reasonType: 3, //Reason Types are: WrongAddress = 1, PinWrong = 2, Other = 3
      description
    });
  },
  updateDirectionsPolyline({ origin, destination }) {
    return Api.get(
      `https://mm-driver-directions-api.herokuapp.com?origin=${origin}&destination=${destination}`
    );
  }
};
