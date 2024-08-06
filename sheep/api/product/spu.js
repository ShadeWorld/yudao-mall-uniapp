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
  getSpuDetail: (id) => {
    return request({
      url: '/product/spu/get-detail',
      method: 'GET',
      params: { id },
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
  // 查询商品品种
  getKindList: (params) => {
    return request({
      url: '/product/spu/get-kind-list',
      method: 'GET',
      params,
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 查询商品折射率
  getRefractiveList: (params) => {
    return request({
      url: '/product/spu/get-refractive-list',
      method: 'GET',
      params,
      custom: {
        showLoading: false,
        showError: false,
      },
    });
  },
  // 查询商品膜层
  getFilmLayerList: (params) => {
    return request({
      url: '/product/spu/get-film-layer-list',
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
