<script setup>
  import sheep from '@/sheep';

  const emits = defineEmits(['close', 'onSelect']);
  const props = defineProps({
    degrees: {
      type: Array,
      default: [],
    },
    selected: {
      type: Number,
      default: undefined,
    },
    show: {
      type: Boolean,
      default: false,
    },
  });

  const selectDegree = (degree) => {
    emits('onSelect', degree);
    emits('close');
  };

  const formatDegree = (degree) => {
    return degree.toFixed(2);
  };
</script>

<template>
  <!-- 规格弹窗 -->
  <su-popup :show="show" round="10" @close="emits('close')">
    <!-- 度数列表 -->
    <view class="ss-modal-box bg-white ss-flex-col">
      <!-- 属性选择 -->
      <view class="modal-content ss-flex-1">
        <scroll-view scroll-y="true" class="modal-content-scroll" @touchmove.stop>
          <view class="ss-flex ss-col-center ss-flex-wrap">
            <button class="ss-reset-button spec-btn" @tap="selectDegree(degree)" v-for="degree in degrees"
                    :key="degree">
              {{ formatDegree(degree) }}
            </button>
            <view class="default-text" v-if="degrees.length === 0">暂无可选度数</view>
          </view>
        </scroll-view>
      </view>
    </view>
  </su-popup>
</template>

<style scoped lang="scss">
  .ss-modal-box {
    border-radius: 30rpx 30rpx 0 0;
    max-height: 1000rpx;

    .modal-content {
      padding: 20rpx 20rpx;

      .modal-content-scroll {
        max-height: 600rpx;

        .default-text {
          width: 100%;
          text-align: center;
          font-size: 24rpx;
          color: #c6c6c6;
        }

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