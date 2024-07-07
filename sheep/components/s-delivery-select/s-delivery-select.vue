<script setup>
  import { computed, reactive, watch } from 'vue';
  import { fen2yuan } from '@/sheep/hooks/useGoods';

  const props = defineProps({
    modelValue: { // 配送方式列表
      type: Object,
      default() {
      },
    },
    show: {
      type: Boolean,
      default: false,
    },
  });

  const emits = defineEmits(['confirm', 'close']);

  const state = reactive({
    deliveryTemplateInfo: computed(() => props.modelValue), // 配送方式列表
    deliveryTemplateId: null, // 选中的配送方式编号
  });

  // 选中配送方式
  function radioChange(deliveryTemplateId) {
    if (state.deliveryTemplateId === deliveryTemplateId) {
      state.deliveryTemplateId = 0;
    } else {
      state.deliveryTemplateId = deliveryTemplateId;
    }
  }

  // 确认配送方式
  const onConfirm = () => {
    emits('confirm', state.deliveryTemplateId);
  };

</script>

<template>
  <su-popup
    :show="show"
    type="bottom"
    round="20"
    @close="emits('close')"
    showClose
    backgroundColor="#f2f2f2"
  >
    <view class="model-box">
      <view class="title ss-m-t-16 ss-m-l-20 ss-flex">配送方式</view>
      <scroll-view
        class="model-content"
        scroll-y
        :scroll-with-animation="false"
        :enable-back-to-top="true"
      >
        <view class="total-card-box ss-p-20 ss-m-b-14 ss-r-10">
          <view class="total-box-content delivery-item">
            <view v-for="(item, index) in state.deliveryTemplateInfo" :key="index"
                  class="order-item ss-flex ss-col-center ss-row-between">
              <view class="item-title">{{ item.name }}</view>
              <view class="ss-flex ss-col-center">
                <text class="item-value ss-m-r-24">
                  ￥{{ fen2yuan(item.price) }}
                </text>
              </view>
              <label class="ss-flex ss-col-center" @tap="radioChange(item.id)">
                <radio
                  color="var(--ui-BG-Main)"
                  style="transform: scale(0.8)"
                  :checked="state.deliveryTemplateId === item.id || item.selected"
                  @tap.stop="radioChange(item.id)"
                />
              </label>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <view class="modal-footer ss-flex">
      <button class="confirm-btn ss-reset-button" @tap="onConfirm">确认</button>
    </view>
  </su-popup>
</template>

<style scoped lang="scss">
  :deep() {
    .uni-checkbox-input {
      background-color: var(--ui-BG-Main);
    }
  }

  .delivery-item {
    border-radius: 20rpx;
  }

  .title {
    font-size: 36rpx;
    height: 80rpx;
    font-weight: bold;
    color: #333333;
  }

  .modal-footer {
    width: 100%;
    height: 120rpx;
    background: #fff;
  }

  .confirm-btn {
    width: 710rpx;
    margin-left: 20rpx;
    height: 80rpx;
    background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
    border-radius: 40rpx;
    color: #fff;
  }
</style>