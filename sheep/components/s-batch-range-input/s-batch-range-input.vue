<template>
  <!-- 镜片sku选择弹窗 -->
  <su-popup :show="show" round="10" @close="emits('close')">
    <!-- SPU 信息 -->
    <view class="ss-modal-box bg-white ss-flex-col">
      <!-- 度数选择 -->
      <view class="modal-content ss-flex-1">
        <view class="label-wrap" v-if="isNormal">
          <view>柱镜度数（CYL）</view>
          <view>{{ formatLensDegree(state.selectedCyl) }}</view>
        </view>
        <view class="form-item" v-if="isNormal">
          <slider value="0" @changing="(e) => state.selectedCyl = e.detail.value" :max="state.maxCyl"
                  :min="state.minCyl"
                  activeColor="var(--ui-BG-Main-gradient)"
                  step="0.25" block-size="20" />
        </view>
        <view class="label-wrap" v-if="!isNormal">
          <view>下加光度数（ADD）</view>
          <view>{{ formatLensDegree(state.selectedAdd) }}</view>
        </view>
        <view class="form-item" v-if="!isNormal">
          <slider value="0" @changing="(e) => state.selectedAdd = e.detail.value" :max="state.maxAdd"
                  :min="state.minAdd"
                  activeColor="var(--ui-BG-Main-gradient)"
                  step="0.25" block-size="20" />
        </view>
        <view class="dividing-line"></view>
        <view class="label-wrap">
          <view>球镜区间（SPH）起始光度</view>
          <view>{{ formatLensDegree(state.selectedSphRange[0]) }}</view>
        </view>
        <view class="form-item">
          <slider value="0" @changing="(e) => state.selectedSphRange[0] = e.detail.value" step="0.25"
                  :max="state.maxSph"
                  activeColor="var(--ui-BG-Main-gradient)"
                  :min="state.minSph" block-size="20" />
        </view>
        <view class="label-wrap">
          <view>球镜区间（SPH）结束光度</view>
          <view style="text-align: left">{{ formatLensDegree(state.selectedSphRange[1]) }}</view>
        </view>
        <view class="form-item">
          <slider value="0" @changing="(e) => state.selectedSphRange[1] = e.detail.value" step="0.25"
                  :max="state.maxSph"
                  activeColor="var(--ui-BG-Main-gradient)"
                  :min="state.minSph" block-size="20" />
        </view>
        <view class="ss-flex ss-row-right">
          <view class="label-wrap">输入数量：</view>
          <su-number-box :min="0" :step="1" v-model="state.count" />
        </view>
      </view>

      <!-- 操作区 -->
      <view class="modal-footer border-top">
        <view class="option-box ss-flex ss-col-center ss-row-right">
          <button class="ss-reset-button confirm-btn ss-r-40 ui-BG-Main-Gradient" @tap="confirm">确认</button>
        </view>
      </view>
    </view>
  </su-popup>
</template>

<script setup>
  import {
    computed,
    reactive, watch,
  } from 'vue';
  import SuPopup from '@/sheep/ui/su-popup/su-popup.vue';
  import sheep from '@/sheep';
  const emits = defineEmits(['close']);
  const rows = defineModel();
  const props = defineProps({
    batchState: {
      type: Object,
      default() {
      },
    },
    show: {
      type: Boolean,
      default: false,
    },
  });

  const confirm = () => {
    rows.value.filter(row => between(row.sph, state.selectedSphRange)).forEach((row) => {
      if (isNormal.value) {
        row.cols.forEach((col) => {
          if (col.cyl === state.selectedCyl && col.skuId) {
            col.count = state.count;
          }
        });
      } else {
        row.cols.forEach((col) => {
          if (col.add === state.selectedAdd && col.skuId) {
            col.count = state.count;
          }
        });
      }
    });
    emits('close')
  };
  // 普通镜片，只有球柱镜
  const isNormal = computed(() => state.minAdd === 0 && state.maxAdd === 0);

  const between = (target, interval) => {
    interval.sort((a, b) => a - b);
    return target >= interval[0] && target <=
      interval[1];
  };
  /**
   * 格式化度数
   */
  const formatLensDegree = (degree, defaultValue = '-') => {
    if (degree !== undefined) {
      return degree.toFixed(2);
    } else {
      return defaultValue;
    }
  };

  const state = reactive({
    selectedCyl: 0,
    selectedAdd: 0,
    selectedSphRange: [0, 0],
    count: 0,
    minSph: undefined,
    maxSph: undefined,
    minCyl: undefined,
    maxCyl: undefined,
    minAdd: undefined,
    maxAdd: undefined,
  });

  const init = (batchState) => {
    console.log(batchState);
    state.minSph = batchState.minSph;
    state.maxSph = batchState.maxSph;
    state.minCyl = batchState.minCyl;
    state.maxCyl = batchState.maxCyl;
    state.minAdd = batchState.minAdd;
    state.maxAdd = batchState.maxAdd;
  };

  watch(
    () => props.batchState,
    (value) => {
      init(value);
    }, {
      immediate: false, // 立即执行
      deep: true, // 深度监听
    },
  );
</script>

<style lang="scss" scoped>
  slider {
    width: 80%;
  }

  // 购买
  .option-box {
    padding: 10rpx 30rpx;

    .confirm-btn {
      width: 240rpx;
      height: 70rpx;
    }
  }

  .ss-modal-box {
    border-radius: 30rpx 30rpx 0 0;
    max-height: 1000rpx;
    min-height: 500rpx;

    .modal-content {
      position: relative;
      padding: 40rpx 20rpx 20rpx;

      .form-item {
        position: relative;
      }

      .label-wrap {
        margin-right: 10px;
        display: flex;
        justify-content: space-between;
      }

      .dividing-line {
        width: 80%;
        border-bottom: 1px solid var($gray-d);
      }
    }
  }
</style>