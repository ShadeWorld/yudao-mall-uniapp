import request from '@/sheep/request';

const SpuApi = {
  // 获得商品 SPU 列表
  getSpuListByIds: (ids) => {
    return request({
      url: '/product/spu/list-by-ids',
      method: 'GET',
      params: { ids },
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 获得商品 SPU 分页
  getSpuPage: (params) => {
    return request({
      url: '/product/spu/page',
      method: 'GET',
      params,
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 查询商品
  getSpuDetail: (params) => {
    return request({
      url: '/product/spu/get-detail',
      method: 'GET',
      params,
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 查询商品系列
  getSeriesList: (id) => {
    return request({
      url: '/product/spu/get-series-list',
      method: 'GET',
      params: { id },
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 查询商品属性
  getLensProp: (params) => {
    return request({
      url: '/product/spu/get-lens-prop',
      method: 'GET',
      params,
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
};
export default SpuApi;
