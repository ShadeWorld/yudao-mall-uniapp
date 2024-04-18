<template>
	<!-- 商品参数 -->
	<detail-cell label="商品参数" value="" />
</template>

<script setup>
  import { computed } from 'vue';
  import detailCell from './detail-cell.vue';

  const props = defineProps({
    modelValue: {
      type: Array,
      default() {
        return [];
      },
    },
    spu: {
      type: Object
    }
  });
</script>