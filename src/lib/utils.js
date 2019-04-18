import { getLyric } from '@/api/singerandsong'

export class Singer {
  constructor ({ id, name, picUrl }) {
    this.id = id
    this.name = name
    this.picUrl = picUrl
  }
}

export class Song {
  constructor ({ id, name, time, singer, picUrl }) {
    this.id = id
    this.name = name
    this.time = time
    this.singer = singer
    this.picUrl = picUrl
  }
  getLyric () {
    if (this.lyric) return Promise.resolve(this.lyric)
    return new Promise((resolve, reject) => {
      getLyric(this.id).then(res => {
        if (res.code === 200) {
          this.lyric = res.lrc.lyric
          resolve(this.lyric)
        } else {
          reject(new Error('No lyric'))
        }
      })
    })
  }
}

export const createSongArr = (hotSongs) => {
  let songArr = []
  let id
  let name
  let time
  let singer
  let picUrl
  hotSongs.forEach(item => {
    singer = ''
    item.ar.forEach(item => {
      singer += item.name + '/'
    })
    singer = singer.slice(0, -1)
    picUrl = item.al.picUrl
    time = item.dt
    name = item.name
    id = item.id
    const song = new Song({ id, name, time, singer, picUrl })
    songArr.push(song)
  })
  return songArr
}

export const createSearchSong = (searchList) => {
  let songArr = []
  let id
  let name
  let time
  let singer
  let picUrl
  searchList.forEach(item => {
    singer = ''
    item.artists.forEach(item => {
      singer += item.name + '/'
    })
    singer = singer.slice(0, -1)
    picUrl = item.artists[0].img1v1Url
    time = item.duration
    name = item.name
    id = item.id
    const song = new Song({ id, name, time, singer, picUrl })
    songArr.push(song)
  })
  return songArr
}

export const saveSearch = (query) => {
  const SEARCHHISTORY_MAX_LEN = 15
  const KEY = '__searchHistory__'
  function insertArray (arr, val, compare, maxLen) {
    const index = arr.findIndex(compare)
    if (index === 0) return
    if (index > 0) arr.splice(index, 1)
    arr.unshift(val)
    if (maxLen && maxLen > SEARCHHISTORY_MAX_LEN) arr.pop()
  }
  let searchHistoryArr = localStorage.getItem(KEY) === null ? [] : JSON.parse(localStorage.getItem(KEY))
  insertArray(searchHistoryArr, query, item => item === query, SEARCHHISTORY_MAX_LEN)
  localStorage.setItem(KEY, JSON.stringify(searchHistoryArr))
  return searchHistoryArr
}
