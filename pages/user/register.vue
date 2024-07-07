<script setup>
  import sheep from '@/sheep';
  import { ref, reactive, unref, computed } from 'vue';
  import SUploader from '@/sheep/components/s-uploader/s-uploader.vue';
  import _ from 'lodash';
  import AreaApi from '@/sheep/api/system/area';
  import {
    onLoad,
  } from '@dcloudio/uni-app';
  import UniFormsItem from '@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue';
  import UniDataPicker from '@/uni_modules/uni-data-picker/components/uni-data-picker/uni-data-picker.vue';
  import UserApi from '@/sheep/api/member/user';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';
  import UniForms from '@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue';

  const registerRef = ref(null);
  // 数据
  const state = reactive({
    model: {
      companyName: '', // 公司名（店名）
      areaId: '', // 区
      address: '', // 地址
      legalPerson: '', // 法人
      mobile: '', // 手机号码
      contactPerson: '', // 联系人姓名
      recommender: '', // 推荐人
      businessLicense: '', // 营业执照
      shopFront: '', // 门头照片
    },
    rules: {
      companyName: {
        required: true,
      }, // 公司名（店名）
      provinceId: {
        required: true,
      }, // 省
      cityId: {
        required: true,
      }, // 市
      areaId: {
        required: true,
      }, // 区
      address: {
        required: true,
      }, // 地址
      legalPerson: {
        required: true,
      }, // 法人
      phoneNumber: {
        required: true,
      }, // 手机号码
      contactName: {
        required: true,
      }, // 联系人姓名
      businessLicense: {
        required: true,
      }, // 营业执照
      shopfront: {
        required: true,
      }, // 门头照片
    },
    areaData: [],
  });

  const { safeArea } = sheep.$platform.device;
  const pageHeight = computed(() => safeArea.height);

  // 短信登录
  async function registerSubmit() {
    // 参数校验
    const validate = await unref(registerRef)
      .validate()
      .catch((error) => {
        console.log('error: ', error);
      });
    if (!validate) {
      return;
    }
    await UserApi.register(state.model);
    sheep.$router.go('pages/user/login');
  }

  // 获得地区数据
  const getAreaData = () => {
    if (_.isEmpty(uni.getStorageSync('areaData'))) {
      AreaApi.getAreaTree().then((res) => {
        if (res.code === 0) {
          uni.setStorageSync('areaData', res.data);
        }
      });
    }
  };

  onLoad((options) => {
    getAreaData();
    console.log(uni.getStorageSync('areaData'));
    state.areaData = uni.getStorageSync('areaData');
  });
</script>

<template>
  <s-layout title="注册">
    <view class="register-wrap ss-flex-col ss-col-center" :style="[{ height: pageHeight + 'px' }]">
      <uni-forms
        ref="registerRef"
        v-model="state.model"
        labelPosition="left"
        border
        validateTrigger="bind"
        labelWidth="200"
        labelAlign="center"
      >

        <uni-forms-item name="companyName" label="公司（店名）*">
          <uni-easyinput
            placeholder="请输入公司名"
            v-model="state.model.companyName"
            :input-border="false"
            :clearable="false"
          >
          </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item name="areaId" label="地址">
          <uni-data-picker
            :localdata="state.areaData"
            placeholder="请选择地址"
            v-model="state.model.areaId"
            field="id as value, name as text"
            :map="{text: 'name', value: 'id'}"
          >
          </uni-data-picker>
        </uni-forms-item>

        <uni-forms-item name="address" label="详细地址*">
          <uni-easyinput
            placeholder="请输入详细地址"
            v-model="state.model.address"
            :input-border="false"
            :clearable="false"
          >
          </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item name="mobile" label="手机号码*">
          <uni-easyinput
            placeholder="请输入手机号码"
            v-model="state.model.mobile"
            :type="number"
            :input-border="false"
            :clearable="false"
          >
          </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item name="contactPerson" label="联系人姓名*">
          <uni-easyinput
            placeholder="请输入联系人姓名"
            v-model="state.model.contactPerson"
            :input-border="false"
            :clearable="false"
          >
          </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item name="legalPerson" label="法人*">
          <uni-easyinput
            placeholder="请输入法人"
            v-model="state.model.legalPerson"
            :input-border="false"
            :clearable="false"
          >
          </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item name="recommender" label="推荐人">
          <uni-easyinput
            placeholder="请输入推荐人"
            v-model="state.model.recommender"
            :input-border="false"
            :clearable="false"
          >
          </uni-easyinput>
        </uni-forms-item>

        <uni-forms-item name="businessLicense" label="上传营业执照*">
          <s-uploader
            @update:model-value="args => state.model.businessLicense = args.url"
            fileMediatype="all"
            mode="grid"
            limit="1"
          >
            <button class="upload-btn ss-row-center ss-reset-button" size="mini">选择文件</button>
          </s-uploader>
        </uni-forms-item>

        <uni-forms-item name="shopfront" label="上传门头照片*">
          <s-uploader
            @update:model-value="args => state.model.shopFront = args.url"
            fileMediatype="all"
            mode="grid"
            limit="1"
          >
            <button class="upload-btn ss-row-center ss-reset-button" size="mini">选择文件</button>
          </s-uploader>
        </uni-forms-item>

        <view class="ss-flex-col ss-col-center ss-row-center">
          <button class="ss-reset-button login-btn-start ui-Shadow-Main" @tap="registerSubmit">
            注册
          </button>
        </view>
      </uni-forms>
    </view>
  </s-layout>
</template>

<style scoped lang="scss">
  .register-wrap {
    padding-top: 40px;
    height: 100%;
    width: 100%;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;

    uni-forms {
      width: 90%;
    }

    .login-btn-start {
      border-radius: 40rpx;
      width: 100px;
      color: white;
      background: var(--ui-BG-Main);
    }
  }

  .upload-btn {
    border-radius: 40rpx;
    background: var(--ui-BG-4);
    color: white;
  }
</style>