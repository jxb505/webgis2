<template>
  <div class="leafletDemo">
    <LeafletMap />
  </div>
</template>
<script>
import BasePage from '@/utils/mixins/BasePage';
export default {
    mixins: [BasePage],
    data() {
        return {
        };
    }
}
</script>
<style lang="scss" scoped>
.leafletDemo {
  height: calc(100vh - 50px);
  position: absolute;
  left: 0;
  right: 0;
}
</style>
