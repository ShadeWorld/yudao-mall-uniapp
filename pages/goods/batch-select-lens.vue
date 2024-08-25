<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';
  import Base64 from 'base-64';
  import SuTabbar from '@/sheep/ui/su-tabbar/su-tabbar.vue';
  import sheep from '@/sheep';
  import SBatchRangeInput from '@/sheep/components/s-batch-range-input/s-batch-range-input.vue';
  import { formatLens } from '@/sheep/util';

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
    showRangeInput: false,
  });
  const shadowState = reactive({
    fixedX: 0,
    fixedY: 0,
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

  const slopingSideStyle = computed(() => {
    const rad = Math.atan((23 + 1) / (cellWidth + 1));
    const deg = Math.round(rad * (180 / Math.PI));
    const width = Math.round(24 / Math.sin(rad));
    const right = width - cellWidth + 1;
    return { 'width': `${width}px`, 'transform': `rotate(${deg}deg)`, 'left': `${-1 * right}px` };
  });

  /**
   * 计算选中的cell的上下左右index
   * @param cols
   */
  function calcSelectedShadowPosition(cols) {
    let position = {
      left: Number.MAX_VALUE,
      bottom: 0,
      right: 0,
      top: Number.MAX_VALUE,
    };
    cols.forEach((col) => {
      position.right = Math.max(position.right, col.index);
      position.left = Math.min(position.left, col.index);
      position.bottom = Math.max(position.bottom, col.row.index);
      position.top = Math.min(position.top, col.row.index);
    });
    return position;
  }

  /**
   * 选中的col的坐标
   */
  const selectedShadowPosition = computed(() => {
    return calcSelectedShadowPosition(state.selectedCols);
  });

  /**
   * 计算框选阴影的定位和大小
   * @param position
   */
  function calcShadowCoordinates(position) {
    let style = {};
    style.width = `${((position.right - position.left) + 1) * (cellWidth + 1)}px`;
    style.height = `${((position.bottom - position.top) + 1) * (23 + 1)}px`;
    style.left = `${position.left * (cellWidth + 1)}px`;
    style.top = `${position.top * 24}px`;
    return style;
  }

  /**
   * 框选阴影的定位和大小
   */
  const selectedShadowStyle = computed(() => {
    return calcShadowCoordinates(selectedShadowPosition.value);
  });

  const rows = ref([]);
  const colList = ref([]);

  const tableWidth = ref('100%');
  const bodyWidth = ref('100%');
  // 普通镜片，只有球柱镜
  const isNormal = computed(() => state.minAdd === 0 && state.maxAdd === 0);

  const between = (target, interval) => {
    interval.sort((a, b) => a - b);
    return target >= interval[0] && target <=
      interval[1];
  };

  /**
   * 修改数量
   * @param count 数量
   */
  function countChange(count) {
    state.selectedCols.forEach(i => i.count = count);
  }

  function selectRangeStart(position) {
    state.scrollX = false;
    state.scrollY = false;
    shadowState.fixedX = position.x;
    shadowState.fixedY = position.y;
  }

  function selectRangeMove(e) {
    const query = wx.createSelectorQuery();
    query.select('#scroll-table').scrollOffset();
    query.exec(function(res) {
      const touches = e.changedTouches[0];
      const mouseX = touches.clientX;
      const mouseY = touches.clientY;
      const xCount = Math.floor((mouseX + res[0].scrollLeft - 10) / (cellWidth + 1));
      const yCount = Math.floor((mouseY + res[0].scrollTop - sheep.$platform.navbar - 10) / (23 + 1));
      // 清空选中
      state.selectedCols.splice(0, state.selectedCols.length);

      // 设置选中col
      let yRange = [shadowState.fixedY, yCount - 1].sort((a, b) => a - b);
      let xRange = [shadowState.fixedX, xCount - 1].sort((a, b) => a - b);
      for (let i = yRange[0]; i <= yRange[1]; i++) {
        let row = rows.value[i];
        for (let j = xRange[0]; j <= xRange[1]; j++) {
          if (row.cols[j].skuId) {
            state.selectedCols.push(row.cols[j]);
          }
        }
      }

      // console.log('selectRangeMove', shadowState, xRange, yRange);
    });
  }

  function selectRangeEnd(e) {
    state.scrollX = true;
    state.scrollY = true;

    // 如果只选中了一个单元格，则回显数量
    if (state.selectedCols.length === 1) {
      state.inputCount = state.selectedCols[0].count;
    }
    // console.log('selectRangeEnd', state.selectedCols, selectedShadowPosition.value, selectedShadowStyle.value);
  }

  const selectLens = (col) => {
    state.selectedCols.splice(0, state.selectedCols.length);
    // 清除输入框数据
    state.inputCount = 0;

    // 如果是被禁用的单元格，则不执行后面的逻辑
    if (!col.skuId) return;

    // 添加到被选中的数组中
    state.selectedCols.push(col);

    // 如果只选中了一个单元格，则回显数量
    if (state.selectedCols.length === 1) {
      state.inputCount = state.selectedCols[0].count;
    }
    // console.log('selectLens', selectedShadowPosition.value, selectedShadowStyle.value);
  };

  function onAddCart() {
    let lensList = [];
    rows.value.forEach((row) => {
      row.cols.forEach((col) => {
        // 找出每一行有数量的col，转换格式
        if (col.count) {
          lensList.push({
            id: col.skuId,
            sph: col.row.sph,
            cyl: col.cyl,
            add: col.add,
            goods_num: col.count,
            categoryId: col.categoryId,
          });
        }
      });
    });
    if (lensList.length === 0) {
      sheep.$helper.toast('请选择光度并输入数量后再加入购物车');
    } else {
      sheep.$store('cart').add(...lensList);
    }
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
    if (data.items.length === 0) {
      sheep.$helper.toast('请选择光度并输入数量后再购买');
    } else {
      sheep.$router.go('/pages/order/confirm', {
        data: JSON.stringify(data),
      });
    }
  }

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
          <scroll-view id="scroll-table" :scroll-y="state.scrollY" :scroll-x="state.scrollX" class="lens-table">
            <view :style="tableWidth">
              <view class="left-top">
                <view class="lens-item" style="position: relative">
                  <!--(1, 1) 用于展示纵横（交叉）表头-->
                  <view style="display: inline; position:relative; top: 4px">SPH</view>
                  <view class="sloping-side" :style="slopingSideStyle" />
                  <view style="display: inline; position:relative; top: -4px">
                    {{ isNormal ? 'CYL' : 'ADD' }}
                  </view>
                </view>
              </view>
              <view class="x-head">
                <view class="lens-item" v-for="col in colList" :key="col">
                  {{ formatLens(col) }}
                </view>
              </view>
              <view class="y-head">
                <view class="lens-item" v-for="row in rows" :key="row.sph">
                  {{ formatLens(row.sph) }}
                </view>
              </view>
              <view class="table-body" :style="bodyWidth">
                <view class="tr" v-for="row in rows" :key="row.sph">
                  <view class="td lens-item"
                        :class="{
                          'disabled-item': !col.skuId
                        }"
                        v-for="col in row.cols"
                        @tap="selectLens(col)"
                        :key="col.index">
                    <!--                                        {{ col.index + ',' + row.index }}-->
                    {{ col.count ? col.count : '' }}
                  </view>
                </view>
                <view class="selected-shadow" :style="selectedShadowStyle" v-show="state.selectedCols.length > 0">
                  <view class="left-select"
                        @touchstart="selectRangeStart({x:selectedShadowPosition.right, y:selectedShadowPosition.bottom})"
                        @touchmove="selectRangeMove" @touchend="selectRangeEnd"></view>
                  <view class="center-border"></view>
                  <view class="right-select"
                        @touchstart="selectRangeStart({x:selectedShadowPosition.left, y:selectedShadowPosition.top})"
                        @touchmove="selectRangeMove" @touchend="selectRangeEnd"></view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
        <!-- 底部 -->
        <su-fixed bottom :val="48" placeholder :isInset="false">
          <view class="input-section ss-flex ss-col-center ss-row-between ss-p-x-30 border-bottom">
            <view>
              <button class="ss-reset-button range-btn ss-r-40 ui-BG-Main-Gradient" @tap="state.showRangeInput = true">区间选择</button>
            </view>
            <view class="ss-flex ss-col-center ss-row-between">
              <view class="label-wrap">
                输入数量：
              </view>
              <su-number-box :min="0" :step="1" @change="countChange" v-model="state.inputCount"
                             :disabled="state.selectedCols.length === 0" />
            </view>
          </view>
        </su-fixed>
        <s-batch-range-input v-model="rows" :show="state.showRangeInput" :batch-state="state" @close="state.showRangeInput = false" />
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

    .range-btn {
      width: 200rpx;
      height: 70rpx;
      font-size: 28rpx;
      font-weight: 500;
    }

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
    border-bottom: 1px solid #bbbbbb;
    position: absolute;
    transform-origin: bottom right;
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
  }

  .light-item {
    background: var(--ui-BG-Main-opacity-1);
  }

  .disabled-item {
    background: #d5d7da !important;
  }

  .lens-table {
    font-size: 18rpx;
    max-height: calc(60vh);
  }

  .table-body {
    position: relative;
    display: inline-flex;
    flex-direction: column;

    .tr {
      display: flex;
      flex-direction: row;
    }

    .selected-shadow {
      pointer-events: none;
      position: absolute;

      .center-border {
        pointer-events: none;
        z-index: 96;
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(5, 5, 5, 0.2) !important;
        width: 100%;
        height: 100%;
        border-radius: 1px;
        box-shadow: inset 0 0 1px 1px var(--ui-BG-Main),
        0 0 1px 1px var(--ui-BG-Main);
      }

      .right-select, .left-select {
        pointer-events: auto;
        z-index: 102;
        position: absolute;
        background: #eeeeee !important;
        width: 8px;
        height: 8px;
        box-shadow: inset 0 0 1px 1px var(--ui-BG-Main),
        0 0 1px 1px var(--ui-BG-Main);
      }

      .left-select::after, .right-select::before {
        content: '';
        position: absolute;
        top: -10px;
        right: -10px;
        bottom: -10px;
        left: -10px;
      }

      .left-select {
        left: -4px;
        top: -4px;
      }

      .right-select {
        left: calc(100% - 4px);
        top: calc(100% - 4px);
      }
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