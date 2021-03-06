<template>
  <div class="music-list">
    <div class="back" @click="_back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title">{{ title }}</h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" v-show="songArr.length > 0" ref="playBtn" @click="_random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll
      :data="songArr"
      :probe-type="probeType"
      :listen-scroll="listenScroll"
      @scroll="_scroll"
      class="list"
      ref="list"
    >
      <div class="song-list-wrapper">
        <song-list :songArr="songArr" @selectedSong="_selectedSong" :rank="rank"></song-list>
      </div>
      <div ref="div"></div>
      <div class="loading-container" v-show="!songArr.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
import Scroll from '_c/scroll/scroll'
import SongList from '_c/song-list/song-list'
import Loading from '_c/loading/loading'
import { prefixStyle } from '@/lib/tools'
import { mapActions } from 'vuex'
import { playListMixin } from '@/lib/mixin'

const TRANSFORM = prefixStyle('transform')
const BACKDROP = prefixStyle('backdrop-filter')
const RESERVED_HEIGHT = 40

export default {
  mixins: [playListMixin],
  components: {
    Scroll,
    SongList,
    Loading
  },
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songArr: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      ScrollY: 0
    }
  },
  computed: {
    bgStyle () {
      return `background-image: url(${this.bgImage})`
    }
  },
  methods: {
    handlePlayList (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list._refresh()
    },
    ...mapActions(['selectPlay', 'randomPlay']),
    _scroll (pos) {
      this.ScrollY = pos.y
    },
    _back () {
      this.$router.back()
    },
    _handleLayerUp (newY) {
      let translateY = Math.max(this.minTranslateY, newY)
      this.$refs.layer.style[TRANSFORM] = `translate3d(0, ${translateY}px, 0)`
    },
    _handleLayerCoverAndBtbShow (newY) {
      let zIndex = 0
      if (newY < this.minTranslateY) {
        zIndex = 10
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        this.$refs.playBtn.style.display = 'none'
      } else {
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
        this.$refs.playBtn.style.display = ''
      }
      this.$refs.bgImage.style.zIndex = zIndex
    },
    _handleScale (newY) {
      let scale = 1
      let zIndex = 0
      const percent = Math.abs(newY / this.imageHeight)
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
        this.$refs.bgImage.style.zIndex = zIndex
      }
      this.$refs.bgImage.style[TRANSFORM] = `scale(${scale})`
    },
    _handleBlur (newY) {
      let blur = 0
      const percent = Math.abs(newY / this.imageHeight)
      if (newY < 0) {
        blur = Math.min(20 * percent, 20)
      }
      this.$refs.filter.style[BACKDROP] = `blur(${blur}px)`
    },
    _selectedSong (song, index) {
      this.selectPlay({ list: this.songArr, index })
    },
    _random () {
      this.randomPlay({ list: this.songArr })
    }
  },
  watch: {
    ScrollY (newY) {
      this._handleLayerUp(newY)
      this._handleLayerCoverAndBtbShow(newY)
      this._handleScale(newY)
      this._handleBlur(newY)
    }
  },
  mounted () {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  created () {
    this.probeType = 3
    this.listenScroll = true
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../assets/stylus/variable';
@import '../../assets/stylus/mixin';

.music-list {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;

  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;

    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }

  .title {
    position: absolute;
    top: 0;
    left: 10%;
    z-index: 40;
    width: 80%;
    no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }

  .bg-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 70%;
    transform-origin: top;
    background-size: cover;

    .play-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 50;
      width: 100%;

      .play {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        margin: 0 auto;
        text-align: center;
        border: 1px solid $color-theme;
        color: $color-theme;
        border-radius: 100px;
        font-size: 0;

        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x;
        }

        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-small;
        }
      }
    }

    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(7, 17, 27, 0.4);
    }
  }

  .bg-layer {
    position: relative;
    height: 100%;
    background: $color-background;
  }

  .list {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;

    .song-list-wrapper {
      padding: 20px 30px;
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
