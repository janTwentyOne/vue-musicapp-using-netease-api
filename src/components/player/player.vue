<template>
  <div class="player" v-if="playList.length">
    <transition
      name="normal"
      @enter="_enter"
      @after-enter="_afterEnter"
      @leave="_leave"
      @after-leave="_afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.picUrl">
        </div>
        <div class="top">
          <div class="back" @click="_back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title">{{ currentSong.name }}</h1>
          <h2 class="subtitle">{{ currentSong.singer }}</h2>
        </div>
        <div class="middle">
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.picUrl">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="progress-wrapper">
            <span class="time time-l">{{formatTimeOne(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="_onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{formatTimeTwo(currentSong.time)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="_changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="_prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="_togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="_next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="_open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.picUrl">
        </div>
        <div class="text">
          <h2 class="name">{{ currentSong.name }}</h2>
          <p class="desc">{{ currentSong.singer }}</p>
        </div>
        <div class="control">
          <progress-circle :radius="32" :percent="percent">
            <div @click.stop="_togglePlaying" :class="miniIcon" class="icon-mini"></div>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio
      ref="audio"
      @canplay="_onReady"
      @error="_onError"
      @timeupdate="_onUpdateTime"
      @ended="_onEnd"
    ></audio>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import { prefixStyle, formatTimeOne, formatTimeTwo, shuffle } from '@/lib/tools'
import { getSongUrl } from '@/api/singer'
import ProgressCircle from '_c/progress-circle/progress-circle'
import ProgressBar from '_c/progress-bar/progress-bar'
import animations from 'create-keyframe-animation'

const TRANSFORM = prefixStyle('transform')
export default {
  components: {
    ProgressBar,
    ProgressCircle
  },
  data () {
    return {
      songIsReady: false,
      currentTime: 0
    }
  },
  computed: {
    ...mapState({
      fullScreen: state => state.fullScreen,
      playList: state => state.playList,
      currentSong: state => state.playList[state.currentIndex],
      playing: state => state.playing,
      currentIndex: state => state.currentIndex,
      mode: state => state.mode,
      sequenceList: state => state.sequenceList
    }),
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    disableCls () {
      return this.songIsReady ? '' : 'disable'
    },
    percent () {
      return this.currentTime / (this.currentSong.time / 1000)
    },
    iconMode () { // 0: sequence, 1: loop, 2: random
      return this.mode === 0 ? 'icon-sequence' : this.mode === 1 ? 'icon-loop' : 'icon-random'
    }
  },
  methods: {
    formatTimeOne,
    formatTimeTwo,
    ...mapMutations(['SET_FULL_SCREEN', 'SET_PLAYING_STATE', 'SET_CURRENT_INDEX', 'SET_PLAY_MODE', 'SET_PLAYLIST']),
    _back () {
      this.SET_FULL_SCREEN(false)
    },
    _open () {
      this.SET_FULL_SCREEN(true)
    },
    _enter (el, done) {
      const { x, y, scale } = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      animations.registerAnimation({ // 使用的CSS动画库太久了，需要更换
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    _afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    _leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[TRANSFORM] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    _afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[TRANSFORM] = ''
    },
    _getPosAndScale () {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return { x, y, scale }
    },
    _togglePlaying () {
      if (!this.songIsReady) return
      this.SET_PLAYING_STATE(!this.playing)
    },
    _prev () {
      if (!this.songIsReady) return
      let index = this.currentIndex - 1
      if (index === -1) index = this.playList.length - 1
      this.SET_CURRENT_INDEX(index)
      if (!this.playing) this._togglePlaying()
    },
    _next () {
      if (!this.songIsReady) return
      let index = this.currentIndex + 1
      if (index === this.playList.length) index = 0
      this.SET_CURRENT_INDEX(index)
      if (!this.playing) this._togglePlaying()
    },
    _onReady () {
      this.songIsReady = true
    },
    _onError () {
      this.songIsReady = true
    },
    _onUpdateTime (e) {
      this.currentTime = e.target.currentTime
    },
    _onEnd () {
      if (this.mode === 1) {
        this.$refs.currentTime = 0
        this.$refs.audio.play()
      } else {
        this._next()
      }
    },
    _onProgressBarChange (percent) {
      this.$refs.audio.currentTime = percent * (this.currentSong.time / 1000)
    },
    _changeMode () {
      const mode = (this.mode + 1) % 3
      this.SET_PLAY_MODE(mode)
      let list = []
      if (mode === 2) list = shuffle(this.sequenceList)
      else list = this.sequenceList
      let index = list.findIndex(item => item.id === this.currentSong.id)
      this.SET_PLAYLIST(list)
      this.SET_CURRENT_INDEX(index)
    }
  },
  watch: {
    currentSong (newSong, oldSong) {
      if (oldSong && newSong.id === oldSong.id) {
        return
      }
      this.songIsReady = false
      getSongUrl(this.currentSong.id).then(res => {
        this.$refs.audio.src = res.data[0].url
      })
    },
    playing (playing) {
      if (this.songIsReady) {
        playing ? this.$refs.audio.play() : this.$refs.audio.pause()
      }
    },
    songIsReady () {
      if (!this.songIsReady) return
      this.$refs.audio.play()
      console.log(233)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '../../assets/stylus/variable';
@import '../../assets/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 10px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;

            &.play {
              animation: rotate 20s linear infinite;
            }

            &.pause {
              animation-play-state: paused;
            }

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;

          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;

      img {
        border-radius: 50%;

        &.play {
          animation: rotate 10s linear infinite;
        }

        &.pause {
          animation-play-state: paused;
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>