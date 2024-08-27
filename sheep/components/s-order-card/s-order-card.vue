<!-- 装修用户组件：用户订单 -->
<template>
  <view class="ss-order-menu-wrap ss-flex ss-col-center">
    <view
      class="menu-item ss-flex-1 ss-flex-col ss-row-center ss-col-center"
      v-for="item in orderMap"
      :key="item.title"
      @tap="sheep.$router.go(item.path, { type: item.value })"
    >
      <uni-badge
        class="uni-badge-left-margin"
        :text="numData.orderCount[item.count]"
        absolute="rightTop"
        size="small"
      >
        <image class="item-icon" :src="sheep.$url.static(item.icon)" mode="aspectFit" />
      </uni-badge>
      <view class="menu-title ss-m-t-28">{{ item.title }}</view>
    </view>
  </view>
</template>

<script setup>
  /**
   * 装修组件 - 订单菜单组
   */
  import sheep from '@/sheep';
  import { computed } from 'vue';

  const orderMap = [
    {
      title: '待付款',
      value: '1',
      icon: 'https://www.zhaomingyanjing.store/glass-manage/68624f18f42bcd90e1779b2bfd45e91d9149893f7b721230eadf12385e88a78f.png',
      path: '/pages/order/list',
      type: 'unpaid',
      count: 'unpaidCount',
    },
    {
      title: '待发货',
      value: '2',
      icon: 'https://www.zhaomingyanjing.store/glass-manage/cfe6f6b3dbf1b2f264c00ab993c0a310b4b973fcb77d521db2c149cc9d3d6f36.png',
      path: '/pages/order/list',
      type: 'undelivered',
      count: 'undeliveredCount',
    },
    // {
    //   title: '待收货',
    //   value: '3',
    //   icon: 'https://www.zhaomingyanjing.store/glass-manage/e33a87393690c7bf6b8a45a746361c22ccbb95d233b539d3f5d6f03a129bb959.png',
    //   path: '/pages/order/list',
    //   type: 'noget',
    //   count: 'deliveredCount',
    // },
    // {
    //   title: '待评价',
    //   value: '4',
    //   icon: 'https://www.zhaomingyanjing.store/glass-manage/273cfa7b594213f74cc080c270c9923b21af6a8d4db32d3e10e8b420d233a588.png',
    //   path: '/pages/order/list',
    //   type: 'nocomment',
    //   count: 'uncommentedCount',
    // },
    // {
    //   title: '售后单',
    //   value: '0',
    //   icon: 'https://www.zhaomingyanjing.store/glass-manage/096208fe06bc0a19b26fd7e78849f3af215531de58df4ed0d41e844e07f7df66.png',
    //   path: '/pages/order/aftersale/list',
    //   type: 'aftersale',
    //   count: 'afterSaleCount',
    // },
    {
      title: '全部订单',
      value: '0',
      icon: 'https://www.zhaomingyanjing.store/glass-manage/461556736eecce68954cb8ff09312bd1398f7d8ccb3b74b558bbb693c00595b5.png',
      path: '/pages/order/list',
    },
  ];

  const numData = computed(() => sheep.$store('user').numData);
</script>

<style lang="scss" scoped>
  .ss-order-menu-wrap {
    .menu-item {
      height: 160rpx;
      position: relative;
      z-index: 10;
      .menu-title {
        font-size: 24rpx;
        line-height: 24rpx;
        color: #333333;
      }
      .item-icon {
        width: 44rpx;
        height: 44rpx;
      }
      .num-icon {
        position: absolute;
        right: 18rpx;
        top: 18rpx;
        // width: 40rpx;
        padding: 0 8rpx;
        height: 26rpx;
        background: #ff4d4f;
        border-radius: 13rpx;
        color: #fefefe;
        display: flex;
        align-items: center;
        .num {
          font-size: 24rpx;
          transform: scale(0.8);
        }
      }
    }
  }
</style>
