<script setup>
  import sheep from '@/sheep';
  import { computed } from 'vue';

  // 微信小程序的“手机号快速验证”：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
  const getPhoneNumber = async (e) => {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      sheep.$helper.toast('快捷登录失败');
      return;
    }
    console.log(e.detail);
    let result = await sheep.$platform.useProvider().mobileLogin(e.detail);
    if (result) {
      uni.switchTab({
        url: '/pages/index/index',
      });
    }
  };

  const { safeArea } = sheep.$platform.device;
  const pageHeight = computed(() => safeArea.height);
</script>

<template>
  <s-layout title="登录">
    <view class="login-wrap ss-flex-col ss-col-center ss-row-center" :style="[{ height: pageHeight + 'px' }]">
      <view class="header">
        <button class="ss-reset-button login-btn ui-Shadow-Main" open-type="getPhoneNumber"
                @getphonenumber="getPhoneNumber">
          一键登录
        </button>
        <button class="ss-reset-button register-btn ui-Shadow-Main" @tap="sheep.$router.go('/pages/user/register')">
          注册
        </button>
      </view>
    </view>
  </s-layout>
</template>

<style scoped lang="scss">
  .login-wrap {
    height: 100%;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;

    .header {
      .login-btn {
        width: 412rpx;
        height: 72rpx;
        font-weight: 500;
        font-size: 28rpx;
        border-radius: 40rpx;
        background-color: var(--ui-BG-Main);
        color: white;
      }

      .register-btn{
        margin-top: 20px;
        width: 412rpx;
        height: 72rpx;
        font-weight: 500;
        font-size: 28rpx;
        border-radius: 40rpx;
        background-color: var(--ui-BG-Main);
        color: white;
      }

    }
  }
</style>