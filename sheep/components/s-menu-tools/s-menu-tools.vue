<!-- 全局 - 快捷入口 -->
<template>
  <su-popup :show="show" type="top" round="20" backgroundColor="#F0F0F0" @close="closeMenuTools">
    <su-status-bar />
    <view class="tools-wrap ss-m-x-30 ss-m-b-16">
      <view class="title ss-m-b-34 ss-p-t-20">快捷菜单</view>
      <view class="container-list ss-flex ss-flex-wrap">
        <view class="list-item ss-m-b-24" v-for="item in list" :key="item.title">
          <view class="ss-flex-col ss-col-center">
            <button
              class="ss-reset-button list-image ss-flex ss-row-center ss-col-center"
              @tap="onClick(item)"
            >
              <image v-if="show" :src="sheep.$url.static(item.icon)" class="list-icon" />
            </button>
            <view class="list-title ss-m-t-20">{{ item.title }}</view>
          </view>
        </view>
      </view>
    </view>
  </su-popup>
</template>

<script setup>
  import { reactive, computed } from 'vue';
  import sheep from '@/sheep';
  import { showMenuTools, closeMenuTools } from '@/sheep/hooks/useModal';

  const show = computed(() => sheep.$store('modal').menu);

  function onClick(item) {
    closeMenuTools();
    if (item.url) sheep.$router.go(item.url);
  }

  const list = [
    {
      url: '/pages/index/index',
      icon: 'https://zhaomingyanjing.store/glass-manage/f4e03230b5cb9b2bf789b67df43125af1b3cef9c2abf4d8bca8f6fa5ded16a20.png',
      title: '首页',
    },
    {
      url: '/pages/index/search',
      icon: 'https://zhaomingyanjing.store/glass-manage/96a288f2a0043c8defaa37e922828b3092ba785e1c191bf18f20dbd462261f7a.png',
      title: '搜索',
    },
    {
      url: '/pages/index/user',
      icon: 'https://zhaomingyanjing.store/glass-manage/227699332b8ae736e220852e60215072eb2805478dab4909e085f89aeb3604cf.png',
      title: '个人中心',
    },
    {
      url: '/pages/index/cart',
      icon: 'https://zhaomingyanjing.store/glass-manage/a45981116198a65db5f28ffd070f0078cfa66ac932a0136bf45ba7e8f401a1d0.png',
      title: '购物车',
    },
    {
      url: '/pages/user/goods-log',
      icon: 'https://zhaomingyanjing.store/glass-manage/7e5ecfb841f2d89b778e1070ef867c17ccda48a5fea14a149f8eb1ce6aa26a87.png',
      title: '浏览记录',
    },
    {
      url: '/pages/user/goods-collect',
      icon: 'https://zhaomingyanjing.store/glass-manage/9f83f4dc3cbf8b1e8e747f8dd79a260feaf65fa9ef3f2e2224015779f85119a1.png',
      title: '我的收藏',
    },
    {
      url: '/pages/chat/index',
      icon: 'https://zhaomingyanjing.store/glass-manage/739f3165045b1552b71176297dab45eda2e192b976e25b1a458a8781a61b7557.png',
      title: '客服',
    },
  ];
</script>

<style lang="scss" scoped>
  .tools-wrap {
    // background: #F0F0F0;
    // box-shadow: 0px 0px 28rpx 7rpx rgba(0, 0, 0, 0.13);
    // opacity: 0.98;
    // border-radius: 0 0 20rpx 20rpx;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
    }

    .list-item {
      width: calc(25vw - 20rpx);

      .list-image {
        width: 104rpx;
        height: 104rpx;
        border-radius: 52rpx;
        background: var(--ui-BG);

        .list-icon {
          width: 54rpx;
          height: 54rpx;
        }
      }

      .list-title {
        font-size: 26rpx;
        font-weight: 500;
        color: #333333;
      }
    }
  }

  .uni-popup {
    top: 0 !important;
  }

  :deep(.button-hover) {
    background: #fafafa !important;
  }
</style>
