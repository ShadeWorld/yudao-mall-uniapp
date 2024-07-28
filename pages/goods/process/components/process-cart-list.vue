<script setup>
  import sheep from '@/sheep';
  import { computed, reactive } from 'vue';
  import SuPopup from '@/sheep/ui/su-popup/su-popup.vue';

  const emits = defineEmits(['confirm', 'close']);
  const props = defineProps({
    show: {
      type: Boolean,
      default: false,
    },
  });

  const cart = sheep.$store('cart');

  const state = reactive({
    list: computed(() => cart.list),
    selectedList: [],
    selectedIds: [],
  });

  // 单选选中
  function onSelectSingle(item) {
    state.selectedList.push(item);
    state.selectedIds.push(item.id);
  }

  function cartItemContext(item) {
    if (item.cartLens) {
      let content = '球镜:' + item.cartLens.sph.toFixed(2) + ' 柱镜:' + item.cartLens.cyl.toFixed(2) + ' 加光:' + item.cartLens.add.toFixed(2);
      if (item.cartLens.leftOrRight) {
        content += ` ${item.cartLens.leftOrRight === 1 ? '左眼' : '右眼'}`
      }
      if (item.cartLens.hasOwnProperty('axis') && Number.isFinite(item.cartLens.axis)) {
        content += ` 轴位: ${item.cartLens.axis}`
      }
      return content;
    } else {
      return item.sku.properties.length > 1 ? item.sku.properties.reduce((items2, items) => items2.valueName + ' ' + items.valueName) : item.sku.properties[0].valueName;
    }
  }
</script>

<template>
  <!-- 镜片sku选择弹窗 -->
  <su-popup :show="show" round="10" @close="emits('close')">
    <!-- 头部 -->
    <view class="cart-box ss-flex ss-flex-col ss-row-between" v-if="state.list.length">
      <!-- 内容 -->
      <view class="cart-content ss-flex-1 ss-p-x-30 ss-m-b-40">
        <view class="goods-box ss-r-10 ss-m-b-14" v-for="item in state.list" :key="item.id">
          <view class="ss-flex ss-col-center">
            <label class="check-box ss-flex ss-col-center ss-p-l-10" @tap="onSelectSingle(item)">
              <radio :checked="state.selectedIds.includes(item.id)" color="var(--ui-BG-Main)"
                     style="transform: scale(0.8)" @tap.stop="onSelectSingle(item)" />
            </label>
            <s-goods-item :title="item.spu.name" :img="item.spu.picUrl || item.goods.image"
                          :price="item.sku.price"
                          :skuText="cartItemContext(item)"
                          priceColor="#FF3000" :titleWidth="400">
            </s-goods-item>
          </view>
        </view>
      </view>
    </view>
  </su-popup>
</template>

<style lang="scss" scoped>
  :deep(.ui-fixed) {
    height: 72rpx;
  }

  .cart-box {
    width: 100%;
    border-radius: 30rpx 30rpx 0 0;
    max-height: 1000rpx;
    min-height: 700rpx;

    .cart-content {
      margin-top: 70rpx;

      .goods-box {
        background-color: #fff;
      }
    }
  }
</style>