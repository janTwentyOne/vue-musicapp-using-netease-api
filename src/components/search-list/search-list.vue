<template>
  <div class="search-list">
    <ul>
      <li class="search-item" v-for="(item, index) in searches" :key="index" @click="_selectItem(item)">
        <span class="text">{{item}}</span>
        <span class="icon" @click.stop="_deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    searches: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    _selectItem (item) {
      this.$emit('selected', item)
    },
    _deleteOne (item) {
      this.$emit('deleted', item)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../assets/stylus/variable';

.search-list {
  .search-item {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;

    &.list-enter-active, &.list-leave-active {
      transition: all 0.1s;
    }

    &.list-enter, &.list-leave-to {
      height: 0;
    }

    .text {
      flex: 1;
      color: $color-text-l;
    }

    .icon {
      extend-click();

      .icon-delete {
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
  }
}
</style>
