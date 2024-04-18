<template>
	<!-- 规格弹窗 -->
	<su-popup :show="show" round="10" @close="emits('close')">
		<view class="ss-modal-box bg-white ss-flex-col">

			<view class="modal-header ss-flex ss-col-center">
				商品参数
			</view>

			<view class="modal-content ss-flex-1">
				<table class="param-table">
					<tr v-for="property in goodsInfo.properties" :key="property.propertyId">
						<td>{{ property.propertyName }}</td>
						<td>{{ property.valueName }}</td>
					</tr>
				</table>
			</view>
			<!-- 操作区 -->
			<view class="modal-footer border-top">
				<view class="buy-box ss-flex ss-col-center ss-flex ss-col-center ss-row-center">
					<button class="ss-reset-button buy-btn ui-Shadow-Main" @tap="onBuy">完成</button>
				</view>
			</view>
		</view>
	</su-popup>
</template>

<script setup>
	import sheep from '@/sheep';


	const emits = defineEmits(['close']);
	const props = defineProps({
		goodsInfo: {
			type: Object,
			default () {},
		},
		show: {
			type: Boolean,
			default: false,
		}
	});
</script>

<style lang="scss" scoped>
	// 购买
	.buy-box {
		padding: 10rpx 0;

		.buy-btn {
			width: 356rpx;
			height: 80rpx;
			border-radius: 40rpx 40rpx;
			background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
			color: #fff;
		}
	}

	.ss-modal-box {
		font-size: 28rpx;
		border-radius: 30rpx 30rpx 0 0;
		max-height: 1000rpx;

		.modal-header {
			justify-content:center;
			position: relative;
			padding: 40rpx 20rpx 0rpx 20rpx;
		}

		.modal-content {
			padding: 0rpx 20rpx 20rpx 20rpx;

			.param-table {
				width: 100%;
				border-spacing: 0rpx;
				table-layout: aLuto;
				
				tr td{
					padding:20rpx 0rpx;
				}

				tr:not(:last-child) td {
					border-bottom: 1rpx solid #eee;
					margin: 0px;
				}

				tr td:first-child {
					width: 144rpx;
				}
			}

			.modal-content-scroll {
				max-height: 600rpx;

				.label-text {
					font-size: 26rpx;
					font-weight: 500;
				}

				.buy-num-box {
					height: 100rpx;
				}

				.spec-btn {
					height: 60rpx;
					min-width: 100rpx;
					padding: 0 30rpx;
					background: #f4f4f4;
					border-radius: 30rpx;
					color: #434343;
					font-size: 26rpx;
					margin-right: 10rpx;
					margin-bottom: 10rpx;
				}

				.disabled-btn {
					font-weight: 400;
					color: #c6c6c6;
					background: #f8f8f8;
				}
			}
		}
	}
</style>