import request from '@/sheep/request';

const CraftApi = {
	// 查询所有工艺
	getCraftList: () => {
	  return request({
	    url: '/product/craft/list',
	    method: 'GET'
	  });
	},
}

export default CraftApi;