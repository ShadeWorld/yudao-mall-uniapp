<script setup>
  import { computed, reactive, ref } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';

  const state = reactive({
    minSph:undefined,
    maxSph:undefined,
    minCyl:undefined,
    maxCyl:undefined,
    minAdd:undefined,
    maxAdd:undefined,
    loading: false
  });
  const rows = ref([]);
  const colList = ref([]);
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
    props.goodsInfo.skus.forEach((sku) => {
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
    init(JSON.parse(options.data));
    state.loading = true;
  });
</script>

<template>
  <view>
    <s-layout navbar="normal" title="批量选择">
      <uni-table ref="table" :loading="state.loading" border stripe type="selection" emptyText="暂无更多数据">
        <uni-tr>
          <uni-th width="150" align="center">
            <!--(1, 1) 用于展示纵横（交叉）表头-->
            {{ isNormal ? 'SPH/CYL' : 'SPH/ADD' }}
          </uni-th>
          <uni-th v-for="col in colList" :key="col" class="tab-head" align="center">
            {{ col.toFixed(2) }}
          </uni-th>
        </uni-tr>
        <uni-tr v-for="row in rows" :key="row.sph">
          <uni-td>{{ row.sph.toFixed(2) }}</uni-td>
          <uni-td
            v-for="col in row.cols"
            :key="isNormal ? `${row.sph}, ${col.cyl}` : `${row.sph}, ${col.add}`"
            :class="{ 'td-selected': col.selected && col.skuId, 'td-disabled': !col.skuId }"
          >
            <div>
              <input
                v-model="col.count"
                min="0"
                step="1"
                type="number"
                class="count-input w-45"
                :disabled="!col.skuId"
              />
            </div>
          </uni-td>
        </uni-tr>
      </uni-table>
    </s-layout>
  </view>
</template>

<style scoped lang="scss">
  table {
    user-select: none;
    font-size: 12px;
    line-height: 18px;
    table-layout: fixed;
    border-left: 1px #ebeef5 solid;
    border-top: 1px #ebeef5 solid;

    thead tr td {
      position: sticky;
      top: 0;
      background: #f4f4f5;
      height: 30px;
    }

    tr {
      td:first-child {
        height: 30px;
        position: sticky;
        left: 0;
        background: #f4f4f5;
        right: 0;
        text-align: center;
      }

      td {
        width: 60px;
        height: 25px;
        border-bottom: 1px #ebeef5 solid;
        border-right: 1px #ebeef5 solid;
      }
    }
  }

  .tab-head {
    text-align: center;
    cursor: pointer;
  }

  .w-45 {
    width: 45px;
  }

  .count-input {
    -webkit-appearance: none !important;
    line-height: 1;
    margin: 0;
    border: none;
    outline: none;
    background: none;
    box-sizing: border-box;
  }

  .td-selected {
    background: #29b6f6;
  }

  .td-disabled {
    background: #e6e8eb;
  }

  input {
    -webkit-appearance: none !important;
  }
</style>