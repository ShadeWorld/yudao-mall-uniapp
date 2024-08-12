<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';
  import Base64 from 'base-64'

  const state = reactive({
    goodsInfo: undefined,
    minSph:undefined,
    maxSph:undefined,
    minCyl:undefined,
    maxCyl:undefined,
    minAdd:undefined,
    maxAdd:undefined,
    loading: true
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
   * 获取光度价格信息
   * @param sph 球镜
   * @param cyl 柱镜
   * @param add 加光
   */
  const getLensInfo = (sph, cyl = 0, add = 0) => {
    let lensInfo = {}
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
              skuId: sku.id,
              price: sku.price
            }
          }
        } else {
          // 未设置联合光度
          lensInfo = {
            skuId: sku.id,
            price: sku.price
          }
        }
      }
    })
    return lensInfo
  };

  const renderGrid = () => {
    // 清空横轴度数
    colList.value.splice(0, colList.value.length)
    for (let sph = state.maxSph; sph >= state.minSph; sph -= 0.25) {
      // 先找rows里面有没有这一行
      let row = rows.value?.find((i) => i.sph === sph)
      if (!row) {
        // 没有就new一个，然后push到rows里面
        row = row ? row : { sph: sph, cols: [] }
        rows.value?.push(row)
      }
      if (isNormal.value) {
        // 球镜和柱镜的情况
        for (let cyl = state.maxCyl; cyl >= state.minCyl; cyl -= 0.25) {
          if (sph === state.maxSph) {
            // 保存所有柱镜（只用保存一次，用于展示横向表头）
            colList.value.push(cyl)
          }
          // 如果该行已经有这一列，就不用重新生成了
          if (row.cols.findIndex((i) => i.cyl === cyl) > -1) continue
          let col = { row: row, cyl: cyl, add: 0, ...getLensInfo(sph, cyl) }
          row.cols.push(col)
        }
        row.cols.sort((a, b) => b.cyl - a.cyl)
      } else {
        // 球镜和ADD的情况
        for (let add = state.maxAdd; add >= state.minAdd; add -= 0.25) {
          if (sph === state.maxSph) {
            // 保存所有柱镜（只用保存一次，用于展示横向表头）
            colList.value.push(add)
          }
          // 如果该行已经有这一列，就不用重新生成了
          if (row.cols.findIndex((i) => i.add === add) > -1) continue
          let col = { row: row, cyl: 0, add: add, ...getLensInfo(sph, 0, add) }
          row.cols.push(col)
        }
        row.cols.sort((a, b) => b.add - a.add)
      }
    }
    // 把行按度数从低到高排序
    rows.value?.sort((a, b) => b.sph - a.sph)
    tableWidth.value = `width: calc((${colList.value.length + 1} * ((100vw / 10) + 1px)) - 1px)`
    bodyWidth.value = `width: calc((${colList.value.length} * ((100vw / 10) + 1px)) - 1px)`
  };

  function init(goodsInfo) {
    // 生成光度范围
    const sphRangeList = []
    const cylRangeList = []
    const addRangeList = []
    goodsInfo?.skus?.map((sku) => {
      sphRangeList.push(sku.skuLens?.minSph, sku.skuLens?.maxSph)
      cylRangeList.push(sku.skuLens?.minCyl, sku.skuLens?.maxCyl)
      addRangeList.push(sku.skuLens?.minAdd, sku.skuLens?.maxAdd)
    })
    sphRangeList.sort((a, b) => a - b)
    cylRangeList.sort((a, b) => a - b)
    addRangeList.sort((a, b) => a - b)
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
        <view style="border: 1px solid #bbbbbb">
          <scroll-view scroll-y="true" scroll-x="true" class="lens-table">
            <view :style="tableWidth">
              <view class="left-top">
                <view class="lens-item">
                  <!--(1, 1) 用于展示纵横（交叉）表头-->
                  {{ isNormal ? 'SPH/CYL' : 'SPH/ADD' }}
                </view>
              </view>
              <view class="x-head">
                <view class="lens-item" v-for="col in colList" :key="col" >
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
                  <view class="td lens-item" v-for="col in row.cols" :key="col.cyl">

                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </s-layout>
  </view>
</template>

<style scoped lang="scss">
  .content {
    margin: 20rpx 20rpx;
  }
  .left-top {
    font-weight: bold;
    display: inline-block;
    background: #e9e9e9;
    z-index: 99 !important;
    position: sticky;
    left: 0;
    top: 0;
  }
  .x-head {
    font-weight: bold;
    background: #e9e9e9;
    display: inline-flex;
    flex-direction: row;
    position: sticky;
    top: 0;
  }
  .x-head .lens-item:last-child {
    border-right: none !important;
  }
  .y-head {
    font-weight: bold;
    background: #e9e9e9;
    width: fit-content;
    display: flex;
    flex-direction: column;
    position: sticky;
    left: 0;
    float: left;
  }
  .y-head .lens-item:last-child {
    border-bottom: none !important;
  }

  .lens-item {
    border-right: 1px solid #bbbbbb;
    border-bottom: 1px solid #bbbbbb;
    flex-shrink: 0;
    width: calc((100vw) / 10);
    text-align: center;
    height: 42rpx;
    vertical-align: middle;
  }
  .lens-table {
    font-size: 16rpx;
    max-height: 800rpx;
  }
  .table-body {
    display: inline-flex;
    flex-direction: column;
    .tr {
      display: flex;
      flex-direction: row;
    }
  }

  .table-body .tr:last-child .lens-item {
    border-bottom: none !important;
  }
  .table-body .tr .lens-item:last-child {
    border-right: none !important;
  }

  .td-item {
    background: #f6f6f6;
  }
</style>