<template>
  <!-- 镜片sku选择弹窗 -->
  <su-popup :show="show" round="10" @close="emits('close')">
    <!-- SPU 信息 -->
    <view class="ss-modal-box bg-white ss-flex-col">
      <view class="modal-header ss-flex ss-col-center">
        <view class="header-left ss-m-r-30">
          <image class="sku-image" :src="goodsInfo.picUrl" mode="aspectFill" />
        </view>
        <view class="header-right ss-flex-col ss-row-between ss-flex-1">
          <view class="goods-title ss-line-2">{{ goodsInfo.name }}</view>
          <view class="header-right-bottom ss-flex ss-col-center ss-row-between">
            <view class="ss-flex">
            </view>
            <view class="stock-text ss-m-l-20">
              {{ formatStock('exact', goodsInfo.stock) }}
            </view>
          </view>
        </view>
      </view>

      <!-- 度数选择 -->
      <view class="modal-content ss-flex-1">
        <scroll-view scroll-y="true" class="modal-content-scroll" @touchmove.stop>
          <view class="sku-item ss-m-b-20">
            <view class="label-text ss-m-b-20">规格</view>
            <view class="ss-flex ss-col-center ss-flex-wrap" v-for="(lens, index) in state.lensList">
              <button class="ss-reset-button spec-btn" @tap="calcAvlDegrees('sph', index)">
                {{ lens.sph === undefined ? '球镜' : lens.sph.toFixed(2) }}
              </button>
              <button class="ss-reset-button spec-btn" @tap="calcAvlDegrees('cyl', index)">
                {{ lens.cyl === undefined ? '柱镜' : lens.cyl.toFixed(2) }}
              </button>
              <button class="ss-reset-button spec-btn" @tap="calcAvlDegrees('add', index)">
                {{ lens.add === undefined ? '加光' : lens.add.toFixed(2) }}
              </button>
            </view>
          </view>
        </scroll-view>
        <!-- 选择度数的弹窗 -->
        <select-degree :show="state.showSelectDegree" :degrees="state.avlDegrees" :selected="state.selectedDegrees"
                       @close="state.showSelectDegree = false" @on-select="onSelectDegree" />
      </view>
    </view>
  </su-popup>
</template>

<script setup>
  import sheep from '@/sheep';
  import {
    formatStock,
    convertProductPropertyList,
    fen2yuan,
  } from '@/sheep/hooks/useGoods';
  import SelectDegree from '@/sheep/components/s-select-lens-sku/components/select-degree.vue';
  import {
    onMounted,
    reactive,
  } from 'vue';

  const emits = defineEmits(['change', 'addCart', 'buy', 'close']);
  const props = defineProps({
    goodsInfo: {
      type: Object,
      default() {
      },
    },
    show: {
      type: Boolean,
      default: false,
    },
  });

  const state = reactive({
    showSelectDegree: false,
    avlDegrees: [],
    selectedDegrees: undefined,
    lensList: [{
      sph: undefined,
      cyl: undefined,
      add: undefined,
    }],
    selectedType: undefined,
    selectedRowIndex: undefined
  });

  const calcAvlDegrees = (type, index) => {
    state.selectedType = type;
    state.selectedRowIndex = index;
    state.avlDegrees = [0, -1, -1.25];
    state.showSelectDegree = true;
  };

  const onSelectDegree = (degree) => {
    console.log(degree);
    state.lensList[state.selectedRowIndex][state.selectedType] = degree;
  };
</script>

<style lang="scss" scoped>
  .ss-modal-box {
    border-radius: 30rpx 30rpx 0 0;
    max-height: 1000rpx;

    .modal-header {
      position: relative;
      padding: 80rpx 20rpx 40rpx;

      .sku-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 10rpx;
      }

      .header-right {
        height: 160rpx;
      }

      .close-icon {
        position: absolute;
        top: 10rpx;
        right: 20rpx;
        font-size: 46rpx;
        opacity: 0.2;
      }

      .goods-title {
        font-size: 28rpx;
        font-weight: 500;
        line-height: 42rpx;
      }

      .score-img {
        width: 36rpx;
        height: 36rpx;
        margin: 0 4rpx;
      }

      .score-text {
        font-size: 30rpx;
        font-weight: 500;
        color: $red;
        font-family: OPPOSANS;
      }

      .price-text {
        font-size: 30rpx;
        font-weight: 500;
        color: $red;
        font-family: OPPOSANS;

        &::before {
          content: '￥';
          font-size: 30rpx;
          font-weight: 500;
          color: $red;
        }
      }

      .stock-text {
        font-size: 26rpx;
        color: #999999;
      }
    }

    .modal-content {
      padding: 0 20rpx;

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