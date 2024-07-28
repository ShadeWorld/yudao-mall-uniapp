<script setup>
  import { reactive } from 'vue';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';
  import SuFixed from '@/sheep/ui/su-fixed/su-fixed.vue';
  import { fen2yuan } from '@/sheep/hooks/useGoods';
  import { onLoad } from '@dcloudio/uni-app';
  import UniDataCheckBox from '@/sheep/ui/su-data-checkbox/su-data-checkbox.vue';
  import CraftApi from '@/sheep/api/product/craft';
  import ProcessCartList from '@/pages/goods/process/components/process-cart-list.vue';
  import ProcessLensParam from '@/pages/goods/process/components/process-lens-param.vue';
  import sheep from '@/sheep';

  const state = reactive({
    skeletonLoading: true, // 加载中
    craftList: [],
    selectedCraftList: [],
    leftLens: {
      isSelf: false,
    },
    showLeft: false,
    showLeftParam: false,
    rightLens: {
      isSelf: false,
    },
    showRight: false,
    showRightParam: false,
  });

  const confirm = () => {
    console.log(state.rightLens);

    let items = [];
    items.push({
      skuId: state.rightLens.skuId,
      count: 1,
      categoryId: state.rightLens.categoryId,
      orderLensList: [JSON.parse(JSON.stringify(state.rightLens))],
    });
    items.push({
      skuId: state.leftLens.skuId,
      count: 1,
      categoryId: state.leftLens.categoryId,
      orderLensList: [JSON.parse(JSON.stringify(state.leftLens))],
    });

    sheep.$router.go('/pages/order/confirm', {
      data: JSON.stringify({
        items,
        deliveryType: 1,
        pointStatus: false,
      }),
    });
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

  function onSelectLens(isLeft, lensSku) {
    debugger
    state.showLeft = false;
    state.showRight = false;

    if (isLeft) {
      state.leftLens = lensSku;
      if (lensSku) {
        state.showLeftParam = true;
      }
    } else {
      state.rightLens = lensSku;
      if (lensSku) {
        state.showRightParam = true;
      }
    }
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
            <view>左眼镜片</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" @tap="state.showRight = true">
                选择&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-cart-list :show="state.showRight" @close="state.showRight = false"
                                 @confirm="(lens) => onSelectLens(true, lens)" :left-or-right="1" />
            </view>
          </view>
        </view>
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view>左眼参数</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" @tap="state.showLeftParam = true">
                编辑&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-lens-param :show="state.showLeftParam" @close="state.showLeftParam = false"
                                  v-model="state.leftLens" />
            </view>
          </view>
        </view>
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view>右眼镜片</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" @tap="state.showLeft = true">
                选择&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-cart-list :show="state.showLeft" @close="state.showLeft = false"
                                 @confirm="(lens) => onSelectLens(false, lens)" left-or-right="2" />
            </view>
          </view>
        </view>
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view>右眼参数</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" @tap="state.showRightParam = true">
                编辑&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-lens-param :show="state.showRightParam" @close="state.showRightParam = false"
                                  v-model="state.rightLens" />
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
            @tap="confirm"
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