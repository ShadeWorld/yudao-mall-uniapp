<script setup>
  import { reactive } from 'vue';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';
  import SuFixed from '@/sheep/ui/su-fixed/su-fixed.vue';
  import { fen2yuan } from '@/sheep/hooks/useGoods';
  import { onLoad } from '@dcloudio/uni-app';
  import UniDataCheckBox from '@/sheep/ui/su-data-checkbox/su-data-checkbox.vue';
  import CraftApi from '@/sheep/api/product/craft';
  import ProcessCartList from '@/pages/goods/process/components/process-cart-list.vue';

  const state = reactive({
    skeletonLoading: true, // 加载中
    craftList: [],
    selectedCraftList: [],
    leftLens: {
      isSelf: false
    },
    showLeft: false,
    rightLens: {
      isSelf: false
    },
    showRight: false,
  });

  const onConfirm = () => {
    console.log(state.rightLens);
    console.log('确认订单');
  };

  async function getCraftList() {
    const { code, data } = await CraftApi.getCraftList();
    if (code !== 0) {
      return;
    }
    state.craftList = data.map(i => {
      return { text: `${i.craftName} ￥${fen2yuan(i.price)}`, value: i.id, origin: i };
    });
  }

  onLoad(async () => {
    await getCraftList();
  });

</script>

<template>
  <view>
    <s-layout navbar="normal" title="加工订单">
      <view class="content">
        <view class="craft-section bg-white">
          <view>工艺信息</view>
          <uni-data-check-box mode="tag"
                              multiple
                              selected-text-color="#ff3000"
                              selected-color="rgba(255, 48, 0, 0.2)"
                              v-model="state.selectedCraftList"
                              :localdata="state.craftList">
          </uni-data-check-box>
        </view>
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view>右眼镜片</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" @tap="state.showLeft = true">
                选择&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-cart-list :show="state.showLeft" @close="state.showLeft = false" />
            </view>
          </view>
        </view>
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view>左眼镜片</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" @tap="state.showRight = true">
                选择&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-cart-list :show="state.showRight" @close="state.showRight = false" />
            </view>
          </view>
        </view>
      </view>
      <su-fixed bottom :opacity="false" bg="bg-white" placeholder :noFixed="false" :index="200">
        <view class="footer-box border-top ss-flex ss-row-between ss-p-x-20 ss-col-center">
          <view class="total-box-footer ss-flex ss-col-center">
            <view class="total-num ss-font-30 text-red">
              ￥{{ fen2yuan(0) }}
            </view>
          </view>
          <button
            class="ss-reset-button ui-BG-Main-Gradient ss-r-40 submit-btn ui-Shadow-Main"
            @tap="onConfirm"
          >
            确认订单
          </button>
        </view>
      </su-fixed>
    </s-layout>
  </view>
</template>

<style scoped lang="scss">

  .content {
    margin-top: 1px;

    .craft-section {
      padding: 20rpx;
    }
    .product-section {
      margin-top: 5px;
      padding: 20rpx;
    }

  }


  .total-box-footer {
    height: 90rpx;

    .total-num {
      color: #333333;
      font-family: OPPOSANS;
    }
  }

  .footer-box {
    height: 100rpx;

    .submit-btn {
      width: 240rpx;
      height: 70rpx;
      font-size: 28rpx;
      font-weight: 500;

      .goto-pay-text {
        line-height: 28rpx;
      }
    }

    .cancel-btn {
      width: 240rpx;
      height: 80rpx;
      font-size: 26rpx;
      background-color: #e5e5e5;
      color: $dark-9;
    }
  }

</style>