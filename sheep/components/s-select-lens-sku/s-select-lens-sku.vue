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
            <uni-row class="tb-header">
              <uni-col :span="4">
                <view class="col-item">球镜</view>
              </uni-col>
              <uni-col :span="4">
                <view class="col-item">柱镜</view>
              </uni-col>
              <uni-col :span="4">
                <view class="col-item">加光</view>
              </uni-col>
              <uni-col :span="12">
              </uni-col>
            </uni-row>
            <uni-row class="ss-flex ss-row-between tb-row" v-for="(lens, index) in state.lensList">
              <uni-col :span="4" class="col-item">
                <view class="ss-flex ss-flex-wrap ss-row-center">
                  <button class="ss-reset-button spec-btn lens-btn" @tap="calcAvlDegrees('sph', index)">
                    {{ lens.sph.toFixed(2) }}
                  </button>
                </view>
              </uni-col>
              <uni-col :span="4" class="col-item">
                <view class="ss-flex ss-flex-wrap ss-row-center">
                  <button class="ss-reset-button spec-btn lens-btn" @tap="calcAvlDegrees('cyl', index)"
                          :disabled="!lens.sph" :class="{'disabled-btn': !lens.sph}">
                    {{ lens.cyl.toFixed(2) }}
                  </button>
                </view>
              </uni-col>
              <uni-col :span="4" class="col-item">
                <view class="ss-flex ss-flex-wrap ss-row-center">
                  <button class="ss-reset-button spec-btn lens-btn" @tap="calcAvlDegrees('add', index)"
                          :disabled="!lens.sph && !lens.cyl" :class="{'disabled-btn': !lens.sph && !lens.cyl}">
                    {{ lens.add.toFixed(2) }}
                  </button>
                </view>
              </uni-col>
              <uni-col :span="6" style="padding-left: 8rpx">
                <su-number-box :min="1" :step="1" v-model="lens.goods_num"
                               @change="lens.goods_num = $event === 0 ? 1 : $event" />
              </uni-col>
              <uni-col :span="6" class="col-item">
                <button class="ss-reset-button remove-btn mini-btn"
                        :class="{'disabled-btn': state.lensList.length <= 1}" :disabled="state.lensList.length <= 1"
                        size="mini" @tap="removeSku(index)">删除
                </button>
              </uni-col>
            </uni-row>
          </view>
        </scroll-view>

        <view class="option-box ss-flex ss-col-center ss-flex ss-col-center ss-row-center">
          <button class="ss-reset-button add-btn ui-Shadow-Main" @tap="addSku">+</button>
        </view>
        <!-- 选择度数的弹窗 -->
        <select-degree :show="state.showSelectDegree" :degrees="state.avlDegrees" :selected="state.selectedDegrees"
                       @close="state.showSelectDegree = false" @on-select="onSelectDegree" />
      </view>

      <!-- 操作区 -->
      <view class="modal-footer border-top">
        <view class="buy-box ss-flex ss-col-center ss-flex ss-col-center ss-row-center">
          <button class="ss-reset-button add-btn ui-Shadow-Main" @tap="onAddCart">加入购物车</button>
          <button class="ss-reset-button buy-btn ui-Shadow-Main" @tap="onBuy">立即购买</button>
        </view>
      </view>
    </view>
  </su-popup>
</template>

<script setup>
  import {
    formatStock,
  } from '@/sheep/hooks/useGoods';
  import SelectDegree from '@/sheep/components/s-select-lens-sku/components/select-degree.vue';
  import {
    reactive, watch,
  } from 'vue';
  import UniRow from '@/uni_modules/uni-row/components/uni-row/uni-row.vue';
  import SuPopup from '@/sheep/ui/su-popup/su-popup.vue';
  import UniCol from '@/uni_modules/uni-row/components/uni-col/uni-col.vue';

  const emits = defineEmits(['addCart', 'buy', 'close']);
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
    lensList: [],
    selectedType: undefined,
    selectedRowIndex: undefined,
  });
  let defaultSkuLens;

  const calcAvlDegrees = (type, index) => {
    state.avlDegrees.splice(0);
    state.selectedType = type;
    state.selectedRowIndex = index;
    state.showSelectDegree = true;
    let degrees = [];
    let minDegree, maxDegree;
    switch (type) {
      case 'sph':
        props.goodsInfo.skus.map((sku) => degrees.push(sku.skuLens.minSph, sku.skuLens.maxSph));
        degrees.sort((a, b) => a - b);
        minDegree = degrees[0];
        maxDegree = degrees[degrees.length - 1];
        for (let i = minDegree; i <= maxDegree; i += 0.25) {
          let index = props.goodsInfo.skus.findIndex((sku) => {
            let lens = sku.skuLens;
            return between(i, [lens.minSph, lens.maxSph]) && lens.skipSph.indexOf(i) === -1;
          });
          if (index > -1) {
            state.avlDegrees.push(i);
          }
        }
        break;
      case 'cyl':
        props.goodsInfo.skus.map((sku) => degrees.push(sku.skuLens.minCyl, sku.skuLens.maxCyl));
        degrees.sort((a, b) => a - b);
        minDegree = degrees[0];
        maxDegree = degrees[degrees.length - 1];
        for (let i = minDegree; i <= maxDegree; i += 0.25) {
          let sph = state.lensList[state.selectedRowIndex].sph;
          let union = i + sph;
          let index = props.goodsInfo.skus.findIndex((sku) => {
            let lens = sku.skuLens;
            return between(i, [lens.minCyl, lens.maxCyl])
              && between(sph, [lens.minSph, lens.maxSph])
              && lens.skipCyl.indexOf(i) === -1 && lens.skipSph.indexOf(sph) === -1
              && (between(union, [lens.maxUnion, lens.minUnion]) || (lens.maxUnion === 0 && lens.minUnion === 0));
          });
          if (index > -1) {
            state.avlDegrees.push(i);
          }
        }
        break;
      case 'add':
        props.goodsInfo.skus.map((sku) => degrees.push(sku.skuLens.minAdd, sku.skuLens.maxAdd));
        degrees.sort((a, b) => a - b);
        minDegree = degrees[0];
        maxDegree = degrees[degrees.length - 1];
        for (let i = minDegree; i <= maxDegree; i += 0.25) {
          let sph = state.lensList[state.selectedRowIndex].sph;
          let index = props.goodsInfo.skus.findIndex((sku) => {
            let lens = sku.skuLens;
            return between(i, [lens.minAdd, lens.maxAdd])
              && between(sph, [lens.minSph, lens.maxSph])
              && lens.skipAdd.indexOf(i) === -1 && lens.skipSph.indexOf(sph) === -1;
          });
          if (index > -1) {
            state.avlDegrees.push(i);
          }
        }
        break;
      default:
        break;
    }
  };

  // 加入购物车
  const onAddCart = () => {
    emits('addCart', state.lensList);
  };

  // 立即购买
  const onBuy = () => {
    emits('buy', state.lensList);
  };

  const onSelectDegree = (degree) => {
    state.lensList[state.selectedRowIndex][state.selectedType] = degree;
  };

  const addSku = () => {
    state.lensList.push(JSON.parse(JSON.stringify(defaultSkuLens)));
  };

  const removeSku = (index) => {
    if (state.lensList.length > 1) {
      state.lensList.splice(index, 1);
    }
  };

  const between = (target, interval) => {
    interval.sort((a, b) => a - b);
    return target >= interval[0] && target <=
      interval[1];
  };

  const init = (goodsInfo) => {
    let defaultSku;
    let sphFilter = goodsInfo.skus.filter((sku) => between(0, [sku.skuLens.minSph, sku.skuLens.maxSph]));
    if (sphFilter.length > 0) {
      let cylFilter = sphFilter.filter((sku) =>
        between(0, [sku.skuLens.minCyl, sku.skuLens.maxCyl]),
      );
      if (cylFilter.length > 0) {
        defaultSku = cylFilter.find((sku) =>
          between(0, [sku.skuLens.minAdd, sku.skuLens.maxAdd]),
        );
        defaultSkuLens = {
          id: defaultSku.id,
          sph: 0,
          cyl: 0,
          add: 0,
          goods_num: 1,
          categoryId: goodsInfo.categoryId,
        };
      } else {
        defaultSku = sphFilter.skus[0];
      }
    } else {
      defaultSku = goodsInfo.skus[0];
    }
    if (!defaultSkuLens && defaultSku) {
      defaultSkuLens = {
        id: defaultSku.id,
        sph: defaultSku.minSph,
        cyl: defaultSku.minCyl,
        add: defaultSku.minAdd,
        goods_num: 1,
        categoryId: goodsInfo.categoryId,
      };
    }
    state.lensList.push(JSON.parse(JSON.stringify(defaultSkuLens)));
  };

  watch(
    () => props.goodsInfo,
    (value) => {
      init(value);
    }, {
      immediate: false, // 立即执行
      deep: true, // 深度监听
    },
  );
</script>

<style lang="scss" scoped>
  // 购买
  .buy-box {
    padding: 10rpx 0;

    .add-btn {
      width: 356rpx;
      height: 80rpx;
      border-radius: 40rpx 0 0 40rpx;
      background-color: var(--ui-BG-Main-light);
      color: var(--ui-BG-Main);
    }

    .buy-btn {
      width: 356rpx;
      height: 80rpx;
      border-radius: 0 40rpx 40rpx 0;
      background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
      color: #fff;
    }

    .score-btn {
      width: 100%;
      margin: 0 20rpx;
      height: 80rpx;
      border-radius: 40rpx;
      background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
      color: #fff;
    }
  }

  .option-box {
    padding: 10rpx 0;

    .add-btn {
      width: 60rpx;
      height: 60rpx;
      border-radius: 30rpx;
      background-color: var(--ui-BG-Main-light);
      color: var(--ui-BG-Main);
    }
  }

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
        max-height: 530rpx;

        .lens-btn {
          margin: auto;
        }

        .tb-header {
          margin-bottom: 8rpx;
        }

        .tb-row {
          margin-bottom: 8rpx;
        }

        .col-item {
          text-align: center;
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
        }

        .sku-item {

          .remove-btn {
            border-radius: 40rpx;
            background-color: var(--ui-BG-Main-light);
            color: var(--ui-BG-Main);
          }

          .disabled-btn {
            font-weight: 400;
            color: #c6c6c6;
            background: #f8f8f8;
          }
        }
      }
    }
  }
</style>