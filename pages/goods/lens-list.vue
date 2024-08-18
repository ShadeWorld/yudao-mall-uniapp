<template>
  <s-layout :title="state.brandName" :bgStyle="{ color: '#fff' }">
    <view class="s-category">
      <view class="three-level-wrap ss-flex ss-col-top" :style="[{ height: pageHeight + 'px' }]">
        <!-- 商品分类（左） -->
        <scroll-view class="side-menu-wrap" scroll-y :style="[{ height: pageHeight + 'px' }]">
          <view class="logo-wrap w-100">
            <view class="logo ss-flex ss-row-center ss-col-center">
              <image
                class="logo-img"
                v-if="state.brandPicUrl"
                :src="sheep.$url.cdn(state.brandPicUrl)"
              />
            </view>
          </view>
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
          <lens-list-right
            v-if="state.style === 'second_one'"
            title="系列"
            :show-item="series"
          />
          <lens-list-right
            v-if="state.style === 'second_one'"
            :category="state.seriesList[state.activeMenu]"
            :data="state.kindList"
            :exist-data="state.existsKindList"
            :selected-data="state.kind"
            :selected="selected"
            @on-select="(data) => onItem('kind', data)"
            title="品种"
          />
          <lens-list-right
            v-if="state.style === 'second_one'"
            :category="state.seriesList[state.activeMenu]"
            :data="showRefractive"
            :exist-data="existsRefractive"
            :selected-data="showSelectedRefractive"
            :selected="selected"
            @on-select="(data, index) => onItem('refractive', data, index)"
            title="折射率"
          />
          <lens-list-right
            v-if="state.style === 'second_one'"
            :category="state.seriesList[state.activeMenu]"
            :data="state.filmLayerList"
            :exist-data="state.existsFilmLayerList"
            :selected-data="state.filmLayer"
            :selected="selected"
            @on-select="(data) => onItem('filmLayer', data)"
            title="膜层"
          />
        </scroll-view>
      </view>
    </view>
    <su-tabbar
      :value="path"
      :fixed="true"
      :placeholder="true"
      :safeAreaInsetBottom="true"
      :inactiveColor="tabbar.style.color"
      :activeColor="tabbar.style.activeColor"
      :midTabBar="tabbar.mode === 2"
      :customStyle="tabbarStyle">
        <view class="option-box ss-flex ss-col-center">
          <view class="option-left ss-flex ss-col-center ss-row-center">

          </view>
          <view class="option-right ss-flex ss-col-center ss-row-center">
            <button class="ss-reset-button buy-btn ui-Shadow-Main" :disabled="!complete" :class="{'disable-btn': !complete}" @tap="toDetail">
              {{ !complete ? '暂无匹配商品' : '查看详情' }}
            </button>
          </view>
        </view>
    </su-tabbar>
  </s-layout>
</template>

<script setup>
  import lensListRight from './components/list/lens-list-right.vue';
  import sheep from '@/sheep';
  import SpuApi from '@/sheep/api/product/spu';
  import { onLoad } from '@dcloudio/uni-app';
  import { computed, reactive, ref } from 'vue';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';
  import { isNumeric, up } from '@/sheep/helper/digit';
  import SuTabbar from '@/sheep/ui/su-tabbar/su-tabbar.vue';

  const tabbar = computed(() => {
    return sheep.$store('app').template.basic?.tabbar;
  });

  const tabbarStyle = computed(() => {
    const backgroundStyle = tabbar.value.style;
    if (backgroundStyle.bgType === 'color') {
      return { background: backgroundStyle.bgColor };
    }
    if (backgroundStyle.bgType === 'img')
      return {
        background: `url(${sheep.$url.cdn(
          backgroundStyle.bgImg,
        )}) no-repeat top center / 100% auto`,
      };
  });

  const state = reactive({
    placeholderHeight: 0,
    style: 'second_one', // first_one（一级 - 样式一）, first_two（二级 - 样式二）, second_one（二级）
    seriesList: [], // 系列树
    activeMenu: undefined, // 选中的一级菜单，在 seriesList 的下标
    brandId: undefined,
    brandName: undefined,
    brandPicUrl: undefined,
    categoryId: 0,
    loadStatus: '',
    kindList: [],
    refractiveList: [],
    filmLayerList: [],
    existsKindList: [],
    existsRefractiveList: [],
    existsFilmLayerList: [],
    kind: undefined,
    refractive: undefined,
    filmLayer: undefined,
  });


  const formatRefractive = (value) => {
    if (!isNumeric(value)) return value;
    let number = parseFloat(value);
    let result = up(number, 2).toFixed(2);
    return result === '1.60' ? '1.61' : result;
  };
  const showRefractive = computed(() => Array.from(new Set(state.refractiveList.map(i => formatRefractive(i, 2)))));
  const existsRefractive = computed(() => state.existsRefractiveList.map(i => formatRefractive(i, 2)));
  const showSelectedRefractive = ref();

  const { safeArea } = sheep.$platform.device;
  const pageHeight = computed(() => safeArea.height - 44 - 50);
  const series = computed(() => state.seriesList[state.activeMenu]);
  const selected = ref(false);
  const dict = ['kind', 'refractive', 'filmLayer'];
  const complete = computed(() => state.kind && state.refractive && state.filmLayer);

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
    if (state.activeMenu === val) return;
    state.activeMenu = val;

    // 重置已选择的
    state.kind = undefined;
    state.refractive = undefined;
    state.filmLayer = undefined;
    showSelectedRefractive.value = undefined;
    state.existsRefractiveList = [];
    state.existsFilmLayerList = [];
    state.existsKindList = [];
    selected.value = false;

    SpuApi.getLensProp({
      id: state.brandId,
      series: series.value,
      kind: state.kind,
      refractive: state.refractive,
      filmLayer: state.filmLayer,
    }).then(({ code, data }) => {
      if (code !== 0) {
        return;
      }
      state.kindList = data.kindList;
      state.refractiveList = data.refractiveList;
      state.filmLayerList = data.filmLayerList;
    });
  };

  const onItem = (key, val, index) => {
    if (state[key] === val || (key === 'refractive' && showSelectedRefractive.value === val)) {
      // 反选
      state[key] = undefined;
      if (key === 'refractive') {
        showSelectedRefractive.value = undefined;
      }
      selected.value = state.kind || state.refractive || state.filmLayer;
      if (!selected.value) {
        state.existsRefractiveList = [];
        state.existsFilmLayerList = [];
        state.existsKindList = [];
        // 如果取消选中之后，没有一个被选中了，就不用展示虚线，否则就要调用接口重新获取虚线
        return;
      }
    } else {
      // 选中
      if (key === 'refractive') {
        state[key] = state.refractiveList.filter(i => formatRefractive(i) === val).join(',');
        showSelectedRefractive.value = val;
      } else {
        state[key] = val;
      }
    }
    SpuApi.getLensProp({
      categoryId: state.categoryId,
      id: state.brandId,
      series: series.value,
      kind: state.kind,
      refractive: state.refractive,
      filmLayer: state.filmLayer,
    }).then(({ code, data }) => {
      if (code !== 0) {
        return;
      }
      state.existsKindList = data.kindList;
      state.existsRefractiveList = data.refractiveList;
      state.existsFilmLayerList = data.filmLayerList;

      if (state[key] && !complete.value) {
        // 选中操作且没有全部选中，才自动获取唯一商品，反选操作不执行这段逻辑
        let only = dict.reduce((prev, item) => {
          if (state[item]) {
            return prev && true;
          }
          return prev && data[item + 'List'].length === 1;
        }, true);
        if (only) {
          dict.filter(i => i !== key && !state[i]).forEach(i => {
            state[i] = data[i + 'List'][0];
            if (i === 'refractive') {
              showSelectedRefractive.value = formatRefractive(data[i + 'List'][0]);
            }
          });
          sheep.$helper.toast('已自动选择唯一商品');
        }
      }
      selected.value = state.kind || state.refractive || state.filmLayer;
    });
  };

  const toDetail = () => {
    sheep.$router.go('/pages/goods/index', {
      categoryId: state.categoryId,
      brandId: state.brandId,
      series: series.value,
      kind: state.kind,
      refractive: state.refractive,
      filmLayer: state.filmLayer,
    });
  };

  onLoad(async (options) => {
    state.categoryId = options.categoryId;
    state.keyword = options.keyword;
    state.brandId = options.brandId;
    state.brandName = options.brandName;
    state.brandPicUrl = options.brandPicUrl;
    await getList();
    await onMenu(0);
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

        .logo-wrap {
          width: 100%;
          background-color: #f6f6f6;

          .logo {
            border-radius: 5px;
            margin: 22rpx 22rpx 22rpx 10rpx;
            aspect-ratio: 1 / 1;
            background: #ffffff;

            .logo-img {
              border-radius: 5px;
              width: calc(100% - 30rpx);
              height: calc(100% - 30rpx);
            }
          }
        }

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

  .option-box {
    .option-left {
      padding-left: 12rpx;
      width: 200rpx;
    }

    .option-right {
      width: calc(100vw - 100px);

      .buy-btn {
        width: calc(100vw - 140px);
        height: 80rpx;
        border-radius: 40rpx;
        background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
        color: #fff;
      }

      .disable-btn {
        color: #c6c6c6;
        background: #f3f3f3;
        box-shadow: none !important;
      }
    }
  }
</style>