<template>
  <s-layout :title="state.brandName" :bgStyle="{ color: '#fff' }">
    <view class="s-category">
      <view class="three-level-wrap ss-flex ss-col-top" :style="[{ height: pageHeight + 'px' }]">
        <!-- 商品分类（左） -->
        <scroll-view class="side-menu-wrap" scroll-y :style="[{ height: pageHeight + 'px' }]">
          <image
            v-if="state.brandPicUrl"
            class="banner-img"
            :src="sheep.$url.cdn(state.brandPicUrl)"
            mode="widthFix"
          />
          <view
            class="menu-item ss-flex"
            v-for="(item, index) in state.seriesList"
            :key="item"
            :class="[{ 'menu-item-active': index === state.activeMenu }]"
            @tap="onMenu(index)"
          >
            <view class="menu-title ss-line-1">
              {{ item }}
            </view>
          </view>
        </scroll-view>
        <!-- 商品分类（右） -->
        <scroll-view
          class="goods-list-box"
          scroll-y
          :style="[{ height: pageHeight + 'px' }]"
          v-if="state.seriesList?.length"
        >
          <first-one v-if="state.style === 'first_one'" :pagination="state.pagination" />
          <first-two v-if="state.style === 'first_two'" :pagination="state.pagination" />
          <second-one
            v-if="state.style === 'second_one'"
            :category="state.seriesList[state.activeMenu]"
            :data="state.brandList"
          />
        </scroll-view>
      </view>
    </view>
    <view class="s-option">
      <view class="buy-box ss-flex ss-col-center ss-row-right">
        <button class="ss-reset-button buy-btn ui-Shadow-Main" @tap="onBuy">立即购买</button>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import secondOne from '../index/components/second-one.vue';
  import firstOne from '../index/components/first-one.vue';
  import firstTwo from '../index/components/first-two.vue';
  import sheep from '@/sheep';
  import SpuApi from '@/sheep/api/product/spu';
  import { onLoad } from '@dcloudio/uni-app';
  import { computed, reactive } from 'vue';

  const state = reactive({
    placeholderHeight: 0,
    style: 'second_one', // first_one（一级 - 样式一）, first_two（二级 - 样式二）, second_one（二级）
    seriesList: [], // 系列树
    activeMenu: 0, // 选中的一级菜单，在 seriesList 的下标
    brandId: undefined,
    brandName: undefined,
    brandPicUrl: undefined,
    categoryId: 0,
    loadStatus: '',
    kindList: [],
    refractiveList: [],
    filmLayerList: [],
    existsKindList: [],
    existRefractive: [],
    existsFilmLayerList: [],
  });

  const { safeArea } = sheep.$platform.device;
  const pageHeight = computed(() => safeArea.height - 44 - 50);

  // 加载镜片系列
  async function getList() {
    const { code, data } = await SpuApi.getSeriesList(state.brandId);
    if (code !== 0) {
      return;
    }
    state.seriesList = data;
  }

  // 选中菜单
  const onMenu = async (val) => {
    state.activeMenu = val;
  };

  onLoad((options) => {
    state.categoryId = options.categoryId;
    state.keyword = options.keyword;
    state.brandId = options.brandId;
    state.brandName = options.brandName;
    getList();
    onMenu(0);
  });
</script>

<style lang="scss" scoped>
  .s-category {
    :deep() {
      .side-menu-wrap {
        width: 200rpx;
        height: 100%;
        padding-left: 12rpx;
        background-color: #f6f6f6;

        .menu-item {
          width: 100%;
          height: 88rpx;
          position: relative;
          transition: all linear 0.2s;

          .menu-title {
            line-height: 32rpx;
            font-size: 30rpx;
            font-weight: 400;
            color: #333;
            margin-left: 28rpx;
            position: relative;
            z-index: 0;

            &::before {
              content: '';
              width: 64rpx;
              height: 12rpx;
              background: linear-gradient(
                  90deg,
                  var(--ui-BG-Main-gradient),
                  var(--ui-BG-Main-light)
              ) !important;
              position: absolute;
              left: -64rpx;
              bottom: 0;
              z-index: -1;
              transition: all linear 0.2s;
            }
          }

          &.menu-item-active {
            background-color: #fff;
            border-radius: 20rpx 0 0 20rpx;

            &::before {
              content: '';
              position: absolute;
              right: 0;
              bottom: -20rpx;
              width: 20rpx;
              height: 20rpx;
              background: radial-gradient(circle at 0 100%, transparent 20rpx, #fff 0);
            }

            &::after {
              content: '';
              position: absolute;
              top: -20rpx;
              right: 0;
              width: 20rpx;
              height: 20rpx;
              background: radial-gradient(circle at 0% 0%, transparent 20rpx, #fff 0);
            }

            .menu-title {
              font-weight: 600;

              &::before {
                left: 0;
              }
            }
          }
        }
      }

      .goods-list-box {
        background-color: #fff;
        width: calc(100vw - 100px);
        padding: 10px;
      }

      .banner-img {
        width: calc(100vw - 130px);
        border-radius: 5px;
        margin-bottom: 20rpx;
      }
    }
  }

  .s-option {
    box-shadow: 0px -2px 4px 0px rgba(51, 51, 51, 0.06);
    background: #ffffff;
    height: 84px;
    .buy-box {
      padding-top: 10px;;
      padding-bottom: 34px;
      padding-right: 20px;
      .buy-btn {
        width: 356rpx;
        height: 80rpx;
        border-radius: 40rpx;
        background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
        color: #fff;
      }
    }
  }
</style>