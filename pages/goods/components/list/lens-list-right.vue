<!-- 分类展示：second-one 风格  -->
<template>
  <view>
    <!-- 一级分类的名字 -->
    <view class="title-box ss-flex ss-col-center ss-row-center ss-p-b-30">
      <view class="title-line-left" />
      <view class="title-text ss-p-x-20">{{ title }}</view>
      <view class="title-line-right" />
    </view>
    <!-- 二级分类的名字 -->
    <view class="goods-item-box ss-flex ss-flex-wrap ss-p-b-20">
      <view
        v-if="!showItem"
        class="goods-item"
        v-for="(item, index) in data"
        :key="item"
        @tap="onSelect(item, index)"
      >
        <view class="ss-p-10">
          <view class="goods-title ss-line-1 ss-flex ss-col-center"
                :class="{'disable-item':(selectedData && selectedData !== item) || (selected && !existData.includes(item))}">
            <view class="inner-goods-title"
                  :class="{'light-item':selectedData === item, 'confirm-item':!selectedData && existData.includes(item), 'small-item': item.length > 7}">
              {{ item }}
            </view>
          </view>
        </view>
      </view>
      <view class="goods-item" v-if="showItem">
        <view class="ss-p-10">
          <view class="goods-title ss-line-1 ss-flex ss-col-center disable-item">
            <view class="inner-goods-title light-item">
              {{ showItem }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>

  import { nextTick } from 'vue';

  const emit = defineEmits(['onSelect']);
  const props = defineProps({
    existData: {
      type: Array,
      default: () => ([]),
    },
    data: {
      type: Array,
      default: () => ([]),
    },
    selectedData: String,
    selected: {
      type: Boolean,
      default: () => false,
    },
    title: String,
    showItem: String,
  });

  function onSelect(item, index) {
    emit('onSelect', item, index);
  }
</script>

<style lang="scss" scoped>
  .title-box {
    font-weight: bold;

    .title-line-left,
    .title-line-right {
      width: 15px;
      height: 1px;
      background: #d2d2d2;
    }
  }

  .goods-item {
    width: calc((100% - 20px) / 2);
    margin-right: 10px;
    margin-bottom: 10px;

    &:nth-of-type(2n) {
      margin-right: 0;
    }

    .goods-title {
      font-size: 28rpx;
      color: #000000;
      height: 31px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e9e9e9;
      border-radius: 8rpx;

      .inner-goods-title {
        width: calc(100% - 3px);
        height: 29px;
        border-radius: 8rpx;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
      }

      .small-item {

      }

      .light-item {
        border: 1px solid var(--ui-BG-Main);
        color: var(--ui-BG-Main);
        background: var(--ui-BG-Main-light);
      }

      .confirm-item {
        border: 1px dashed var(--ui-BG-Main);
      }
    }

    .disable-item {
      color: #c6c6c6;
      background: #f8f8f8;
    }

    .goods-price {
      color: $red;
      line-height: 40rpx;
    }
  }
</style>
