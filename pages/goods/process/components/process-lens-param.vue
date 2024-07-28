<script setup>
  import SuPopup from '@/sheep/ui/su-popup/su-popup.vue';
  import UniForms from '@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue';
  import UniFormsItem from '@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue';
  import UniEasyinput from '@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue';
  import { computed, ref } from 'vue';

  const emits = defineEmits(['close']);
  const model = defineModel();
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
  });

  const formRef = ref();

  const requireAxis = computed(() => {
    return model.value.cyl && model.value.cyl !== 0;
  });

  const rules = {
    // 对瞳距进行必填验证
    pd: {
      rules: [{
        required: true,
        errorMessage: '请输入瞳距',
      }],
    },
    // 对轴位进行必填验证
    axis: {
      rules: [{
        required: true,
        errorMessage: '请输入轴位',
      }],
    },
  };

  function confirm() {
    let validateFields = ['pd'];
    if (requireAxis.value) {
      validateFields.push('axis');
    }
    formRef.value.validateField(validateFields).then(() => {
      emits('close');
    }).catch(err => {
      console.log('表单错误信息：', err);
    });
  }
</script>

<template>
  <!-- 镜片sku选择弹窗 -->
  <su-popup :show="show" round="10" @close="emits('close')">
    <!-- SPU 信息 -->
    <view class="ss-modal-box bg-white ss-flex-col">
      <s-empty v-if="!model" padding-top="20" text="无需设置镜片参数~" icon="/static/goods-empty.png" />

      <!-- 度数选择 -->
      <view v-else class="modal-content ss-flex-1">
        <uni-forms ref="formRef" :model-value="model" :rules="rules">
          <uni-forms-item label="瞳距" name="pd" required>
            <uni-easyinput primaryColor="rgba(255, 48, 0, 0.3)" type="number" v-model="model.pd" placeholder="请输入瞳距" />
          </uni-forms-item>
          <uni-forms-item label="轴位" name="axis" :required="requireAxis">
            <uni-easyinput primaryColor="rgba(255, 48, 0, 0.3)" type="number" v-model="model.axis" placeholder="请输入轴位" />
          </uni-forms-item>
          <uni-forms-item label="瞳高" name="ph">
            <uni-easyinput primaryColor="rgba(255, 48, 0, 0.3)" type="number" v-model="model.ph" placeholder="请输入瞳高" />
          </uni-forms-item>
        </uni-forms>
      </view>
    </view>

    <!-- 操作区 -->
    <view class="modal-footer border-top">
      <view class="buy-box ss-flex ss-col-center ss-row-right">
        <button class="ss-reset-button option-btn ui-Shadow-Main" @tap="confirm">确认</button>
      </view>
    </view>
  </su-popup>
</template>

<style scoped lang="scss">
  // 购买
  .buy-box {
    padding: 10rpx 0;

    .option-btn {
      margin: 0 20rpx;
      width: 200rpx;
      height: 80rpx;
      border-radius: 40rpx;
      background-color: var(--ui-BG-Main-light);
      color: var(--ui-BG-Main);
    }
  }

  .ss-modal-box {
    padding: 80rpx 20rpx 40rpx;
    border-radius: 30rpx 30rpx 0 0;
    max-height: 1000rpx;

    .modal-content {
      padding: 0 20rpx;
    }
  }
</style>