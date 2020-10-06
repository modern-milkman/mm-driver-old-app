import Api from 'Api';

export default {
  getCustomerAddressImage({ customerId, addressId }) {
    return Api.get(`/Customer/CustomerImage/${customerId}/${addressId}`);
  },

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
  updateDirectionsPolyline({
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude
  }) {
    return Api.get(
      `/Routing/GetDirections/${originLatitude}/${originLongitude}/${destinationLatitude}/${destinationLongitude}`
    );
  }
};
