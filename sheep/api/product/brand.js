import request from '@/sheep/request';

const BrandApi = {
	// 根据分类id查询品牌，不传id查询所有
	getBrandListByCategoryId: (id) => {
	  return request({
	    url: '/product/brand/list',
	    method: 'GET',
	    params: { id },
	  });
	},
}

export default BrandApi;