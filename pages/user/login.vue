<script setup>
  import sheep from '@/sheep';

  // 微信小程序的“手机号快速验证”：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/getPhoneNumber.html
  const getPhoneNumber = async (e) => {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      sheep.$helper.toast('快捷登录失败');
      return;
    }
    console.log(e.detail)
    let result = await sheep.$platform.useProvider().mobileLogin(e.detail);
    if (result) {
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  };
</script>

<template>
  <view class="login-wrap ss-flex-col ss-col-center ss-row-center">
    <view class="header">
      <button class="ss-reset-button login-btn ui-Shadow-Main"  open-type="getPhoneNumber"  @getphonenumber="getPhoneNumber">
        一键登录
      </button>
      <button class="ss-reset-button login-btn ui-Shadow-Main" @tap="sheep.$router.go('/pages/user/register')">
        注册
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .login-wrap {
    height: 100%;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;

    .header {
      .login-btn {
        width: 214rpx;
        height: 72rpx;
        font-weight: 500;
        font-size: 28rpx;
        border-radius: 40rpx 0 0 40rpx;
        background-color: var(--ui-BG-Main-light);
        color: var(--ui-BG-Main);
      }
    }
  }
</style>