<script setup>
  import sheep from '@/sheep';
  import { ref, reactive, unref } from 'vue';
  import SUploader from '@/sheep/components/s-uploader/s-uploader.vue';

  const registerRef = ref(null);
  // 数据
  const state = reactive({
    model: {
      companyName: '', // 公司名（店名）
      provinceId: '', // 省
      cityId: '', // 市
      areaId: '', // 区
      address: '', // 地址
      legalPerson: '', // 法人
      phoneNumber: '', // 手机号码
      contactName: '', // 联系人姓名
      recommender: '', // 推荐人
      businessLicense: '', // 营业执照
      shopfront: '', // 门头照片
    }, range: [
      { value: 0, text: '篮球' },
      { value: 1, text: '足球' },
      { value: 2, text: '游泳' },
    ],
  });

  function change(e) {
    console.log('e:', e);
  }

  function onChoose() {

  }

</script>

<template>
  <view class="register-wrap ss-flex-col ss-col-center ss-row-center">
    <uni-forms
      ref="registerRef"
      v-model="state.model"
      labelPosition="left"
      border
      validateTrigger="bind"
      labelWidth="200"
      labelAlign="center">

      <uni-forms-item name="companyName" label="公司（店名）">
        <uni-easyinput
          placeholder="请输入公司名"
          v-model="state.model.companyName"
          :input-border="false"
          :clearable="false"
        >
        </uni-easyinput>
      </uni-forms-item>

      <uni-forms-item name="provinceId" label="省/直辖市">
        <uni-data-select
          v-model="state.model.provinceId"
          :localdata="state.range"
          @change="change"
          :input-border="false"
        >
        </uni-data-select>
      </uni-forms-item>

      <uni-forms-item name="cityId" label="市">
        <uni-data-select
          v-model="state.model.cityId"
          :localdata="state.range"
          @change="change"
          :input-border="false"
        >
        </uni-data-select>
      </uni-forms-item>

      <uni-forms-item name="areaId" label="区/县">
        <uni-data-select
          v-model="state.model.areaId"
          :localdata="state.range"
          @change="change"
          :input-border="false"
        >
        </uni-data-select>
      </uni-forms-item>

      <uni-forms-item name="address" label="地址">
        <uni-easyinput
          placeholder="请输入详细地址"
          v-model="state.model.address"
          :input-border="false"
          :clearable="false"
        >
        </uni-easyinput>
      </uni-forms-item>

      <uni-forms-item name="phoneNumber" label="手机号码">
        <uni-easyinput
          placeholder="请输入手机号码"
          v-model="state.model.phoneNumber"
          :type="number"
          :input-border="false"
          :clearable="false"
        >
        </uni-easyinput>
      </uni-forms-item>

      <uni-forms-item name="contactName" label="联系人姓名">
        <uni-easyinput
          placeholder="请输入联系人姓名"
          v-model="state.model.contactName"
          :input-border="false"
          :clearable="false"
        >
        </uni-easyinput>
      </uni-forms-item>

      <uni-forms-item name="businessLicense" label="上传营业执照">
        <s-uploader
          v-model="state.model.businessLicense"
          fileMediatype="image"
          mode="grid"
          limit="1"
          file-mediatype="all"
        >
        </s-uploader>
      </uni-forms-item>

      <uni-forms-item name="shopfront" label="上传门头照片">
        <s-uploader
          v-model="state.model.shopfront"
          fileMediatype="image"
          mode="grid"
          limit="1"
          file-mediatype="all"
        >
        </s-uploader>
      </uni-forms-item>

    </uni-forms>
  </view>
</template>

<style scoped lang="scss">
  .register-wrap {
    height: 100%;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;
  }
</style>