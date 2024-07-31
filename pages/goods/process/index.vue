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
  import { getTimeStatusEnum } from '@/sheep/util/const';

  const state = reactive({
    skeletonLoading: true, // 加载中
    craftList: [],
    selectedCraftIdList: [],
    leftLens: undefined,
    showLeft: false,
    showLeftParam: false,
    rightLens: undefined,
    showRight: false,
    showRightParam: false,
  });

  const confirm = () => {
    if (!state.leftLens) {
      sheep.$helper.toast('请选择左眼镜片');
    }
    if (!state.leftLens.isSelf) {
      // 校验瞳高
      if (!state.leftLens.pd) {
        sheep.$helper.toast('请完善左眼镜片参数');
        state.showLeftParam = true;
        return;
      }
      // 带柱镜需填写轴位
      if (state.leftLens.cyl !== 0 && !state.leftLens.axis) {
        sheep.$helper.toast('请完善左眼镜片参数');
        state.showLeftParam = true;
        return;
      }
    }
    if (!state.rightLens) {
      sheep.$helper.toast('请选择右眼镜片');
    }
    if (!state.rightLens.isSelf) {
      // 校验瞳高
      if (!state.rightLens.pd) {
        sheep.$helper.toast('请完善右眼镜片参数');
        state.showRightParam = true;
        return;
      }
      // 带柱镜需填写轴位
      if (state.rightLens.cyl !== 0 && !state.rightLens.axis) {
        sheep.$helper.toast('请完善右眼镜片参数');
        state.showRightParam = true;
        return;
      }
    }
    let items = [];
    if (!state.rightLens.isSelf) {
      items.push({
        skuId: state.rightLens.skuId,
        count: 1,
        categoryId: state.rightLens.categoryId,
        orderLensList: [JSON.parse(JSON.stringify(state.rightLens))],
      });
    }
    if (!state.leftLens.isSelf) {
      items.push({
        skuId: state.leftLens.skuId,
        count: 1,
        categoryId: state.leftLens.categoryId,
        orderLensList: [JSON.parse(JSON.stringify(state.leftLens))],
      });
    }

    let craftList = state.craftList.filter(item => state.selectedCraftIdList.includes(item.value)).map(item => ({
      craftId: item.value,
      craftName: item.origin.craftName,
      price: item.origin.price,
    }));
    sheep.$router.go('/pages/order/confirm', {
      data: JSON.stringify({
        items,
        deliveryType: 1,
        pointStatus: false,
        craftList: craftList,
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
    state.showLeft = false;
    state.showRight = false;

    if (isLeft) {
      state.leftLens = lensSku;
      if (!lensSku.isSelf) {
        state.leftLens.count = 1;
        state.showLeftParam = true;
      }
    } else {
      state.rightLens = lensSku;
      if (!lensSku.isSelf) {
        state.rightLens.count = 1;
        state.showRightParam = true;
      }
    }
  }

  function itemContent(item) {
    let content = '球镜:' + item.sph.toFixed(2) + ' 柱镜:' + item.cyl.toFixed(2) + ' 加光:' + item.add.toFixed(2);
    if (item.leftOrRight) {
      content += ` ${item.leftOrRight === 1 ? '左眼' : '右眼'}`;
    }
    if (item.hasOwnProperty('axis') && Number.isFinite(item.axis)) {
      content += ` 轴位: ${item.axis}`;
    }
    return content;
  }

  function showLensParam(isLeft) {
    if (isLeft) {
      if (!state.leftLens.isSelf) {
        state.showLeftParam = true;
      }
    } else {
      if (!state.rightLens.isSelf) {
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
          <view class="section-label">工艺信息</view>
          <uni-data-check-box mode="tag"
                              multiple
                              selected-text-color="#ff3000"
                              selected-color="rgba(255, 48, 0, 0.2)"
                              v-model="state.selectedCraftIdList"
                              :localdata="state.craftList">
          </uni-data-check-box>
        </view>
        <!-- 左眼镜片 -->
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view class="section-label">左眼镜片</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" style="color: #777777"
                      @tap="state.showRight = true">
                选择&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-cart-list :show="state.showRight" @close="state.showRight = false"
                                 @confirm="(lens) => onSelectLens(true, lens)" :left-or-right="1" />
            </view>
          </view>
        </view>
        <!-- 左眼镜片信息 -->
        <view v-if="state.leftLens && (state.leftLens.isSelf || state.leftLens.hasOwnProperty('sph'))"
              class="lens-info bg-white">
          <view class="ss-flex ss-row-between" v-if="state.leftLens.isSelf">
            <uni-tag text="自备镜片"
                     custom-style="box-shadow: var(--ui-Main-box-shadow) !important; background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient)); color: #fff; border: none !important;">
            </uni-tag>
          </view>
          <view v-else>
            <s-goods-item :title="state.leftLens.spuName" :img="state.leftLens.picUrl"
                          :price="state.leftLens.price"
                          :skuText="itemContent(state.leftLens)"
                          priceColor="#FF3000" :titleWidth="400">
            </s-goods-item>
          </view>
        </view>
        <!-- 左眼参数 -->
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view class="section-label">左眼参数</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" style="color: #777777"
                      @tap="showLensParam(true)">
                编辑&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-lens-param :show="state.showLeftParam" @close="state.showLeftParam = false"
                                  v-model="state.leftLens" />
            </view>
          </view>
        </view>
        <!-- 右眼镜片 -->
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view class="section-label">右眼镜片</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" style="color: #777777"
                      @tap="state.showLeft = true">
                选择&nbsp;<text class="_icon-forward" style="color: #bbbbbb; font-size: 26rpx"></text>
              </button>
              <process-cart-list :show="state.showLeft" @close="state.showLeft = false"
                                 @confirm="(lens) => onSelectLens(false, lens)" left-or-right="2" />
            </view>
          </view>
        </view>
        <!-- 右眼镜片信息 -->
        <view v-if="state.rightLens && (state.rightLens.isSelf || state.rightLens.hasOwnProperty('sph'))"
              class="lens-info bg-white">
          <view class="ss-flex ss-row-between" v-if="state.rightLens.isSelf">
            <uni-tag text="自备镜片"
                     custom-style="box-shadow: var(--ui-Main-box-shadow) !important; background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient)); color: #fff; border: none !important;">
            </uni-tag>
          </view>
          <view v-else>
            <s-goods-item :title="state.rightLens.spuName" :img="state.rightLens.picUrl"
                          :price="state.rightLens.price"
                          :skuText="itemContent(state.rightLens)"
                          priceColor="#FF3000" :titleWidth="400">
            </s-goods-item>
          </view>
        </view>
        <!-- 右眼参数 -->
        <view class="product-section bg-white">
          <view class="ss-flex ss-row-between">
            <view class="section-label">右眼参数</view>
            <view>
              <button class="ss-reset-button ss-flex ss-col-center ss-row-center" style="color: #777777"
                      @tap="showLensParam(false)">
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
  .section-label {
    font-weight: bold;
  }

  .content {
    margin-top: 1px;

    .craft-section {
      padding: 20rpx;
    }

    .product-section {
      margin-top: 10px;
      padding: 10rpx 20rpx;
    }

    .lens-info {
      padding: 20rpx;
      border-top: 1px solid #f5f5f5;
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