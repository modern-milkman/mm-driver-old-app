import Api from 'Api';

export default {
  getForDriver() {
    return Api.get('/Delivery/GetForDriver');
  },
  getVehicleStockForDriver() {
    return Api.get('/Delivery/GetVehicleStockForDriver');
  }
};
