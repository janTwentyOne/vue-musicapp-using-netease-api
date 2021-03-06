<template>
  <scroll
    class="listview"
    :data="data"
    ref="listview"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="_scroll"
  >
    <ul>
      <li v-for="(group, index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{ group.title }}</h2>
        <ul>
          <li v-for="(singer, index) in group.items" :key="index" class="list-group-item" @click="_selectedItem(singer)">
            <img v-lazy="singer.picUrl" class="avatar">
            <span class="name">{{ singer.name }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="_onShortcutTouchStart"
      @touchmove.stop.prevent="_onShortcutTouchMove"
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :key="index"
          class="item"
          :data-index="index"
          :class="{'current': currentIndex === index}"
        >{{ item }}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{ fixedTitle }}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from '_c/scroll/scroll'
import Loading from '_c/loading/loading'
import { getData } from '@/lib/tools'
const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  components: {
    Scroll,
    Loading
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  computed: {
    shortcutList () {
      return this.data.map(group => group.title.substr(0, 1))
    },
    fixedTitle () {
      if (this.scrollY > 0) return ''
      const cur = this.data[this.currentIndex]
      return cur ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    _scrollTo (index) {
      if (!index && index !== 0) return
      if (index < 0) index = 0
      if (index > this.listHeight.length - 2) index = this.listHeight - 2
      this.$refs.listview._scrollToElement(this.$refs.listGroup[index], 0)
    },
    _onShortcutTouchStart (e) {
      let anchorIndex = getData(e.target, 'index')
      this._scrollTo(anchorIndex)
      this.touch.y1 = e.touches[0].pageY
      this.touch.anchorIndex = anchorIndex
    },
    _onShortcutTouchMove (e) {
      this.touch.y2 = e.touches[0].pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    _scroll (pos) {
      this.scrollY = pos.y
    },
    _calculateHeight () {
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      list.forEach(item => {
        height += item.clientHeight
        this.listHeight.push(height)
      })
    },
    _selectedItem (item) {
      this.$emit('selectedItem', item)
    },
    _refresh () {
      this.$refs.listview && this.$refs.listview._refresh()
    }
  },
  watch: {
    data () {
      this.$nextTick(() => {
        this._calculateHeight()
      })
    },
    scrollY (newY) {
      const listHeight = this.listHeight
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          return
        }
      }
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) return
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  created () {
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../assets/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
