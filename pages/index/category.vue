<!-- 商品分类列表 -->
<template>
  <s-layout title="分类" tabbar="/pages/index/category" :bgStyle="{ color: '#fff' }">
    <view class="s-category">
      <view class="three-level-wrap ss-flex ss-col-top" :style="[{ height: pageHeight + 'px' }]">
        <!-- 商品分类（左） -->
        <scroll-view class="side-menu-wrap" scroll-y :style="[{ height: pageHeight + 'px' }]">
          <view
            class="menu-item ss-flex"
            v-for="(item, index) in state.categoryList"
            :key="item.id"
            :class="[{ 'menu-item-active': index === state.activeMenu }]"
            @tap="onMenu(index)"
          >
            <view class="menu-title ss-line-1">
              {{ item.name }}
            </view>
          </view>
        </scroll-view>
        <!-- 商品分类（右） -->
        <scroll-view
          class="goods-list-box"
          scroll-y
          :style="[{ height: pageHeight + 'px' }]"
          v-if="state.categoryList?.length"
        >
          <image
            v-if="state.categoryList[state.activeMenu].picUrl"
            class="banner-img"
            :src="sheep.$url.cdn(state.categoryList[state.activeMenu].picUrl)"
            mode="widthFix"
          />
          <first-one v-if="state.style === 'first_one'" :pagination="state.pagination" />
          <first-two v-if="state.style === 'first_two'" :pagination="state.pagination" />
          <second-one
            v-if="state.style === 'second_one'"
            :category="state.categoryList[state.activeMenu]"
            :data="state.brandList"
          />
          <uni-load-more
            v-if="
              (state.style === 'first_one' || state.style === 'first_two') &&
              state.pagination.total > 0
            "
            :status="state.loadStatus"
            :content-text="{
              contentdown: '点击查看更多',
            }"
            @tap="loadMore"
          />
        </scroll-view>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import secondOne from './components/second-one.vue';
  import firstOne from './components/first-one.vue';
  import firstTwo from './components/first-two.vue';
  import sheep from '@/sheep';
  import CategoryApi from '@/sheep/api/product/category';
  import SpuApi from '@/sheep/api/product/spu';
  import { onLoad, onReachBottom } from '@dcloudio/uni-app';
  import { computed, reactive } from 'vue';
  import _ from 'lodash';
  import BrandApi from '@/sheep/api/product/brand';

  const state = reactive({
    style: 'second_one', // first_one（一级 - 样式一）, first_two（二级 - 样式二）, second_one（二级）
    categoryList: [], // 商品分类树
    activeMenu: 0, // 选中的一级菜单，在 categoryList 的下标

    pagination: {
      // 商品分页
      list: [], // 商品列表
      total: [], // 商品总数
      pageNo: 1,
      pageSize: 6,
    },
    loadStatus: '',
    brandList: [],
  });

  const { safeArea } = sheep.$platform.device;
  const pageHeight = computed(() => safeArea.height - 44 - 50);

  // 加载商品分类
  async function getList() {
    const { code, data } = await CategoryApi.getCategoryList();
    if (code !== 0) {
      return;
    }
    state.categoryList = data;
  }

  // 选中菜单
  const onMenu = async (val) => {
    state.activeMenu = val;
    const { code, data } = await BrandApi.getBrandListByCategoryId(
      state.categoryList[state.activeMenu].id,
    );
    if (code !== 0) {
      return;
    }
    state.brandList = data;
    if (state.style === 'first_one' || state.style === 'first_two') {
      state.pagination.pageNo = 1;
      state.pagination.list = [];
      state.pagination.total = 0;
      getGoodsList();
    }
  };

  // 加载商品列表
  async function getGoodsList() {
    // 加载列表
    state.loadStatus = 'loading';
    const res = await SpuApi.getSpuPage({
      categoryId: state.categoryList[state.activeMenu].id,
      pageNo: state.pagination.pageNo,
      pageSize: state.pagination.pageSize,
    });
    if (res.code !== 0) {
      return;
    }
    // 合并列表
    state.pagination.list = _.concat(state.pagination.list, res.data.list);
    state.pagination.total = res.data.total;
    state.loadStatus = state.pagination.list.length < state.pagination.total ? 'more' : 'noMore';
  }

  // 加载更多商品
  function loadMore() {
    if (state.loadStatus === 'noMore') {
      return;
    }
    state.pagination.pageNo++;
    getGoodsList();
  }

  onLoad(async () => {
    await getList();
    // 如果是 first 风格，需要加载商品分页
    // if (state.style === 'first_one' || state.style === 'first_two') {
    await onMenu(0);
    // }
  });

  onReachBottom(() => {
    loadMore();
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
</style>
