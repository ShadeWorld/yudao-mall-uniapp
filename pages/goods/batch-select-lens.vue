<script setup>
  import { computed, nextTick, reactive, ref } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';
  import Base64 from 'base-64';
  import SuTabbar from '@/sheep/ui/su-tabbar/su-tabbar.vue';
  import sheep from '@/sheep';

  const state = reactive({
    goodsInfo: undefined,
    minSph: undefined,
    maxSph: undefined,
    minCyl: undefined,
    maxCyl: undefined,
    minAdd: undefined,
    maxAdd: undefined,
    loading: true,
    scrollX: true,
    scrollY: true,
    selectedCols: [],
    inputCount: 0,
  });
  const selectedEdge = reactive({
    leftOpacity: undefined,
    topOpacity: undefined,
  });
  const mousePosition = reactive({
    startX: 0,
    startY: 0,
  });
  const screenWidth = sheep.$platform.device.screenWidth;
  const cellWidth = screenWidth / 8;
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

  const rightSelectStyle = computed(() => {
    return { 'left': cellWidth - 4 + 'px', top: 19 + 'px' };
  });

  const selectedColStyle = computed(() => {
    return { 'opacity': Math.min(selectedEdge.leftOpacity, selectedEdge.topOpacity) };
  });

  const rows = ref([]);
  const colList = ref([]);

  const tableWidth = ref('100%');
  const bodyWidth = ref('100%');
  // 普通镜片，只有球柱镜
  const isNormal = computed(() => state.minAdd === 0 && state.maxAdd === 0);

  function countChange(e) {
    console.log(e);
    state.selectedCols.forEach(i => i.count = e);
  }

  function calcSelectedEdge() {
    const query = wx.createSelectorQuery();
    query.select('.lens-item.selected-item').boundingClientRect();
    query.exec(function(res) {
      const left = res[0].left;
      const top = res[0].top;

      if (left < cellWidth + 10 || top < sheep.$platform.navbar + 33) {
        selectedEdge.leftOpacity = (left - cellWidth) / 10;
        selectedEdge.topOpacity = (top - sheep.$platform.navbar - 23) / 10;
      } else {
        selectedEdge.leftOpacity = 1;
        selectedEdge.topOpacity = 1;
      }
    });
  }

  function selectRangeStart(e) {
    console.log(e);
    state.scrollX = false;
    state.scrollY = false;
    const touches = e.changedTouches[0];
    mousePosition.startX = touches.clientX;
    mousePosition.startY = touches.clientY;
  }

  function selectRangeMove(e) {
    const touches = e.changedTouches[0];
    const mouseX = touches.clientX;
    const mouseY = touches.clientY;
    const xCount = (mouseX - 10) / (cellWidth + 1);
    const yCount = (mouseY - sheep.$platform.navbar) / (23 + 1);
    console.log('xCount, yCount', xCount, yCount);
    rows.value?.forEach((row) => {
      row.cols.forEach((col) => {
        col.light = false;
        col.selected = false;
      });
    });
    // 遍历所有列，将选中的col.selected设为true
    rows.value?.forEach((row) => {
      if (row.index < yCount) {
        row.cols.forEach((i) => {
          if (i.index < xCount) {
            i.selected = true;
          }
        });
      }
    });
  }

  function selectRangeEnd(e) {
    state.scrollX = true;
    state.scrollY = true;
    console.log(e);
  }

  function onscroll(e) {
    calcSelectedEdge();
  }

  function onAddCart() {

  }

  function onBuy() {
    let data = { items: [] };
    rows.value.forEach((row) => {
      row.cols.forEach((col) => {
        // 找出每一行有数量的col，转换格式
        if (col.count) {
          let value = data.items.find((exists) => exists.skuId === col.skuId);
          if (!value) {
            value = {
              skuId: col.skuId,
              count: Number.parseInt(col.count),
              categoryId: col.categoryId,
              orderLensList: [],
            };
            data.items.push(value);
          } else {
            value.count += Number.parseInt(col.count);
          }
          value.orderLensList.push({
            sph: row.sph,
            cyl: col.cyl,
            add: col.add,
            count: col.count,
          });
        }
      });
    });
    data.deliveryType = 1;
    data.pointStatus = false;
    sheep.$router.go('/pages/order/confirm', {
      data: JSON.stringify(data),
    });
  }

  const selectLens = (row, col) => {
    // 清空之前的高亮单元格
    rows.value.forEach((item) => {
      item.cols.forEach((col) => {
        col.light = false;
        col.selected = false;
      });
    });
    state.selectedCols.splice(0, state.selectedCols.length);
    // 清除输入框数据
    state.inputCount = 0;

    // 如果是被禁用的单元格，则不执行后面的逻辑
    if (!col.skuId) return;

    // 设置当前单元格选中状态
    col.selected = true;
    state.selectedCols.push(col);
    // 设置高亮单元格
    row.cols.forEach((item, index) => {
      if (index < col.index) {
        item.light = true;
      }
    });
    rows.value.forEach((item, index) => {
      if (index < row.index) {
        item.cols[col.index].light = true;
      }
    });

    // 如果只选中了一个单元格，则回显数量
    if (state.selectedCols.length === 1) {
      state.inputCount = state.selectedCols[0].count;
    }
    nextTick(() => calcSelectedEdge());
  };

  const between = (target, interval) => {
    interval.sort((a, b) => a - b);
    return target >= interval[0] && target <=
      interval[1];
  };

  /**
   * 获取光度价格信息
   * @param sph 球镜
   * @param cyl 柱镜
   * @param add 加光
   */
  const getLensInfo = (sph, cyl = 0, add = 0) => {
    let lensInfo = {};
    state.goodsInfo.skus.forEach((sku) => {
      if (
        between(sph, [sku.skuLens?.minSph, sku.skuLens?.maxSph]) &&
        between(cyl, [sku.skuLens?.minCyl, sku.skuLens?.maxCyl]) &&
        between(add, [sku.skuLens?.minAdd, sku.skuLens?.maxAdd])
      ) {
        // 柱镜、球镜、加光分别都符合
        if (sku.skuLens?.minUnion !== 0 || sku.skuLens?.maxUnion !== 0) {
          // 设置了联合光度
          if (between(sph + cyl + add, [sku.skuLens?.minUnion, sku.skuLens?.maxUnion])) {
            // 联合光度也符合
            lensInfo = {
              categoryId: state.goodsInfo.categoryId,
              skuId: sku.id,
              price: sku.price,
            };
          }
        } else {
          // 未设置联合光度
          lensInfo = {
            categoryId: state.goodsInfo.categoryId,
            skuId: sku.id,
            price: sku.price,
          };
        }
      }
    });
    return lensInfo;
  };

  const renderGrid = () => {
    // 清空横轴度数
    colList.value.splice(0, colList.value.length);
    for (let sph = state.maxSph, rowIndex = 0; sph >= state.minSph; sph -= 0.25, rowIndex++) {
      // 先找rows里面有没有这一行
      let row = rows.value?.find((i) => i.sph === sph);
      if (!row) {
        // 没有就new一个，然后push到rows里面
        row = row ? row : { sph: sph, index: rowIndex, cols: [] };
        rows.value?.push(row);
      }
      if (isNormal.value) {
        // 球镜和柱镜的情况
        for (let cyl = state.maxCyl, colIndex = 0; cyl >= state.minCyl; cyl -= 0.25, colIndex++) {
          if (sph === state.maxSph) {
            // 保存所有柱镜（只用保存一次，用于展示横向表头）
            colList.value.push(cyl);
          }
          // 如果该行已经有这一列，就不用重新生成了
          if (row.cols.findIndex((i) => i.cyl === cyl) > -1) continue;
          let col = { index: colIndex, row: row, cyl: cyl, add: 0, count: 0, ...getLensInfo(sph, cyl) };
          row.cols.push(col);
        }
        row.cols.sort((a, b) => b.cyl - a.cyl);
      } else {
        // 球镜和ADD的情况
        for (let add = state.maxAdd, colIndex = 0; add >= state.minAdd; add -= 0.25, colIndex++) {
          if (sph === state.maxSph) {
            // 保存所有柱镜（只用保存一次，用于展示横向表头）
            colList.value.push(add);
          }
          // 如果该行已经有这一列，就不用重新生成了
          if (row.cols.findIndex((i) => i.add === add) > -1) continue;
          let col = { index: colIndex, row: row, cyl: 0, add: add, count: 0, ...getLensInfo(sph, 0, add) };
          row.cols.push(col);
        }
        row.cols.sort((a, b) => b.add - a.add);
      }
    }
    // 把行按度数从低到高排序
    rows.value?.sort((a, b) => b.sph - a.sph);
    tableWidth.value = `width: calc((${colList.value.length + 1} * (100vw / 8 + 1px)) + 1px)`;
    bodyWidth.value = `width: calc(${colList.value.length} * (100vw / 8 + 1px))`;
  };

  function init(goodsInfo) {
    // 生成光度范围
    const sphRangeList = [];
    const cylRangeList = [];
    const addRangeList = [];
    goodsInfo?.skus?.map((sku) => {
      sphRangeList.push(sku.skuLens?.minSph, sku.skuLens?.maxSph);
      cylRangeList.push(sku.skuLens?.minCyl, sku.skuLens?.maxCyl);
      addRangeList.push(sku.skuLens?.minAdd, sku.skuLens?.maxAdd);
    });
    sphRangeList.sort((a, b) => a - b);
    cylRangeList.sort((a, b) => a - b);
    addRangeList.sort((a, b) => a - b);
    state.minSph = sphRangeList[0];
    state.maxSph = sphRangeList[sphRangeList.length - 1];
    state.minCyl = cylRangeList[0];
    state.maxCyl = cylRangeList[cylRangeList.length - 1];
    state.minAdd = addRangeList[0];
    state.maxAdd = addRangeList[addRangeList.length - 1];
    // 生成度数集合
    renderGrid();
  }

  onLoad(async (options) => {
    state.goodsInfo = JSON.parse(decodeURIComponent(Base64.decode(options.data)));
    init(state.goodsInfo);
    state.loading = false;
  });
</script>

<template>
  <view>
    <s-layout navbar="normal" title="批量选择">
      <view class="content">
        <view style="box-shadow: 0 0.2em 0.5em #cccccc !important">
          <scroll-view :scroll-y="state.scrollY" :scroll-x="state.scrollX" class="lens-table" @scroll="onscroll">
            <view :style="tableWidth">
              <view class="left-top">
                <view class="lens-item" style="position: relative">
                  <!--(1, 1) 用于展示纵横（交叉）表头-->
                  <view style="display: inline; position:relative; top: 4px">SPH</view>
                  <view class="sloping-side" />
                  <view style="display: inline; position:relative; top: -4px">
                    {{ isNormal ? 'CYL' : 'ADD' }}
                  </view>
                </view>
              </view>
              <view class="x-head">
                <view class="lens-item" v-for="col in colList" :key="col">
                  {{ col.toFixed(2) }}
                </view>
              </view>
              <view class="y-head">
                <view class="lens-item" v-for="row in rows" :key="row.sph">
                  {{ row.sph.toFixed(2) }}
                </view>
              </view>
              <view class="table-body" :style="bodyWidth">
                <view class="tr" v-for="row in rows" :key="row.sph">
                  <view class="td lens-item"
                        :class="{
                          'light-item': col.light,
                          'disabled-item': !col.skuId,
                          'selected-item': col.selected,
                        }"
                        v-for="col in row.cols"
                        @tap="selectLens(row, col)"
                        :key="col.index">
                    {{ col.count ? col.count : '' }}
                    <view v-show="col.selected" class="left-select" @touchstart="selectRangeStart"
                          @touchmove="selectRangeMove" @touchend="selectRangeEnd"></view>
                    <view class="none" :class="{'selected-item-edge': col.selected}"
                          :style="selectedColStyle">
                      {{ col.count ? col.count : '' }}
                    </view>
                    <view v-show="col.selected" class="right-select" :style="rightSelectStyle"
                          @tap="selectRange"></view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <!-- 底部 -->
        <su-fixed bottom :val="48" placeholder :isInset="false">
          <view class="input-section ss-flex ss-col-center ss-row-between ss-p-x-30 border-bottom">
            <view class="label-wrap">
              输入数量：
            </view>
            <su-number-box :min="0" :step="1" @change="countChange" v-model="state.inputCount"
                           :disabled="state.selectedCols.length === 0" />
          </view>
        </su-fixed>
      </view>
      <su-tabbar
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
            <button class="ss-reset-button add-btn ui-Shadow-Main" @tap="onAddCart">加入购物车</button>
            <button class="ss-reset-button buy-btn ui-Shadow-Main" @tap="onBuy">立即购买</button>
          </view>
        </view>
      </su-tabbar>
    </s-layout>
  </view>
</template>

<style scoped lang="scss">

  .input-section {
    height: 100rpx;
    background-color: #fff;

    .label-wrap {
    }
  }

  .content {
    margin: 10px 10px;
  }

  .left-top {
    border-top: 1px solid #bbbbbb;
    border-left: 1px solid #bbbbbb;
    display: inline-block;
    background: #e9e9e9;
    z-index: 104 !important;
    position: sticky;
    left: 0;
    top: 0;
  }

  .sloping-side {
    height: 0;
    border-bottom: 1px solid #bbbbbb;
    width: calc(100vw / 8 + 6px);
    position: absolute;
    top: 12px;
    left: -3px;
    transform: rotate(-148deg);
  }

  .x-head {
    z-index: 103 !important;
    border-top: 1px solid #bbbbbb;
    font-weight: bold;
    background: #e9e9e9;
    display: inline-flex;
    flex-direction: row;
    position: sticky;
    top: 0;
  }

  .y-head {
    z-index: 103 !important;
    border-left: 1px solid #bbbbbb;
    font-weight: bold;
    background: #e9e9e9;
    width: fit-content;
    display: flex;
    flex-direction: column;
    position: sticky;
    left: 0;
    float: left;
  }

  .lens-item {
    border-right: 1px solid #bbbbbb;
    border-bottom: 1px solid #bbbbbb;
    flex-shrink: 0;
    width: calc(100vw / 8);
    text-align: center;
    height: 23px;
    line-height: 23px;
    white-space: nowrap;
    position: relative;

    .right-select, .left-select {
      z-index: 102;
      position: absolute;
      background: #eeeeee !important;
      width: 8px;
      height: 8px;
      box-shadow: inset 0 0 1px 1px var(--ui-BG-Main),
      0 0 1px 1px var(--ui-BG-Main);
    }

    .left-select {
      left: -4px;
      top: -4px;
    }
  }

  .light-item {
    background: var(--ui-BG-Main-opacity-1);
  }

  .disabled-item {
    background: #d5d7da !important;
  }

  .selected-item-edge {
    display: block !important;
    z-index: 101 !important;
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    background: #eeeeee !important;
    width: calc(100vw / 8);
    height: 23px;
    border-radius: 1px;
    box-shadow: inset 0 0 1px 1px var(--ui-BG-Main),
    0 0 1px 1px var(--ui-BG-Main);
  }

  .selected-item::after {
    z-index: 96;
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    background: #eeeeee !important;
    width: calc(100vw / 8);
    height: 23px;
    border-radius: 1px;
    box-shadow: inset 0 0 1px 1px var(--ui-BG-Main),
    0 0 1px 1px var(--ui-BG-Main);
  }

  .lens-table {
    font-size: 18rpx;
    max-height: calc(60vh);
  }

  .table-body {
    display: inline-flex;
    flex-direction: column;

    .tr {
      display: flex;
      flex-direction: row;
    }
  }

  .td-item {
    background: #f6f6f6;
  }

  // 购买
  .option-right {
    padding: 10rpx 0;

    .add-btn {
      width: 356rpx;
      height: 80rpx;
      border-radius: 40rpx 0 0 40rpx;
      background-color: var(--ui-BG-Main-light);
      color: var(--ui-BG-Main);
    }

    .buy-btn {
      width: 356rpx;
      height: 80rpx;
      border-radius: 0 40rpx 40rpx 0;
      background: linear-gradient(90deg, var(--ui-BG-Main), var(--ui-BG-Main-gradient));
      color: #fff;
    }
  }
</style>