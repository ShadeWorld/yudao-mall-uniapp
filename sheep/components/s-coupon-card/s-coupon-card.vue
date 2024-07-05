<!-- 装修用户组件：用户卡券 -->
<template>
	<view class="ss-coupon-menu-wrap ss-flex ss-col-center">
		<view class="menu-item ss-flex-col ss-row-center ss-col-center" v-for="item in props.list" :key="item.title"
			@tap="sheep.$router.go(item.path, { type: item.type })"
			:class="item.type === 'all' ? 'menu-wallet' : 'ss-flex-1'">
			<image class="item-icon" :src="sheep.$url.static(item.icon)" mode="aspectFit"></image>
			<view class="menu-title ss-m-t-28">{{ item.title }}</view>
		</view>
	</view>
</template>

<script setup>
	/**
	 * 装修组件 - 优惠券菜单
	 */
	import sheep from '@/sheep';

	// 接收参数
	const props = defineProps({
		list: {
			type: Array,
			default () {
				return [{
						title: '已领取',
						value: '0',
						icon: 'https://www.zhaomingyanjing.store/glass-manage/6759bf3c9cdc66f9359870848c47f4368b61eafbcc8d984b19a715016cf9051e.png',
						path: '/pages/coupon/list',
						type: 'geted',
					},
					{
						title: '已使用',
						value: '0',
						icon: 'https://www.zhaomingyanjing.store/glass-manage/a4519004ddb1326596e65d0f80d88a483b7cb808aa95c1229eca4f3606b041b7.png',
						path: '/pages/coupon/list',
						type: 'used',
					},
					{
						title: '已失效',
						value: '0',
						icon: 'https://www.zhaomingyanjing.store/glass-manage/879a241ff16f56d9f5e9c2d34e6769c56aeef52b2412cd427a69dc9d1d6b719c.png',
						path: '/pages/coupon/list',
						type: 'expired',
					},
					{
					  title: '领券中心',
					  value: '0',
					  icon: 'https://www.zhaomingyanjing.store/glass-manage/6dfe342c3456fb5aa37be21846137da7d189c3d505ca1dca26f09ac5173fb627.png',
					  path: '/pages/coupon/list',
					  type: 'all',
					},
				];
			},
		},
	});
</script>

<style lang="scss" scoped>
	.ss-coupon-menu-wrap {
		.menu-item {
			height: 160rpx;

			.menu-title {
				font-size: 24rpx;
				line-height: 24rpx;
				color: #333333;
			}

			.item-icon {
				width: 44rpx;
				height: 44rpx;
			}
		}

		.menu-wallet {
			width: 144rpx;
		}
	}
</style>