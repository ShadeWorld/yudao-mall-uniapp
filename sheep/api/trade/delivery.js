import request from '@/sheep/request';

const DeliveryApi = {
  // 获得快递公司列表
  getDeliveryExpressList: () => {
    return request({
      url: `/trade/delivery/express/list`,
      method: 'get',
    });
  },
  // 获得快递公司列表
  getDeliveryExpressTemplateList: (areaId) => {
    return request({
      url: `/trade/delivery/express-template/list-all-simple?areaId=${areaId}`,
      method: 'get',
    });
  },
};

export default DeliveryApi;
