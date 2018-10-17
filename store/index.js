import firebase from 'firebase'
import 'firebase/firestore'
import { firebaseMutations, firebaseAction } from 'vuexfire'

if (!firebase.apps.length) {
  firebase.initializeApp(JSON.parse(process.env.FIREBASE_KEY))
}

const db = firebase.firestore()
const settings = {/* your settings... */ timestampsInSnapshots: true};
db.settings(settings);

// export default db

const memoDataRef = db.collection('memoData')
const colorListRef = db.collection('colorList').doc('colorList')
const roomListRef = db.collection('roomList')
const lastRoomRef = db.collection('lastRoom').doc('lastRoom')

export const state = () => {
    return {
      colorList: [
        '#d00',
        '#cc0',
        '#0cc',
        '#0c0',
        '#c0c',
        '#e0e',
      ],
      memoData: [],
      roomList: [],
      //仮の表示のためにセット。index.vueのtemplate内初期表示に利用しているため。
      lastRoom: {roomId: 1}
    // };
  }
};

// ページ初期化時に一回だけ呼ばれる
export const plugins = [
  (store) => {
    // $store.commit が呼ばれるのを監視してlocalStorageに保存する
    store.subscribe(() => {
      // localStorage.vuex = JSON.stringify(store.state);
    });
  },
];

// index.vue の methods.onMove 内で使用している。メソッドスタイルgetterの書き方より使い方を意識する
// https://vuex.vuejs.org/ja/guide/getters.html#%E3%83%A1%E3%82%BD%E3%83%83%E3%83%89%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9
export const getters = {
  getMemoById: (state) => (roomId, memoId) => {
    return state.memoData.find(memo => memo.roomId === roomId && memo.memoId === memoId);
  },

  getRoomByName: (state) => (name) => {
    return state.roomList.find(room => room.roomName === name);
  },

  getMemoByRoomId: (state) => (roomId) => {
    return state.memoData.filter(memo => memo.roomId === roomId)
  },

  getRoomById: (state) => (roomId) => {
    return state.roomList.find(room => room.roomId === roomId);
  }
};

// stateは「必ず」mutationsの関数を通して更新する
// 呼び出しは $store.commit('関数名', 必要なら引数);
// mutationsに非同期処理を書いてはならない
// 非同期処理はactionを経由してmutationを呼ぶ
export const mutations = {
  ...firebaseMutations,

  updateLastRoomId(state, roomId) {
    state.lastRoom.roomId = Number(roomId)
  }
};

// axiosなど非同期処理を挟んでstateを更新したい場合に使う
// 呼び出しは$store.dispatch('関数名', 必要なら引数)
// actionsの中で$store.commit を呼んでstateを更新する
export const actions = {
  bindMemoData: firebaseAction(async ({bindFirebaseRef}) => {
    await bindFirebaseRef('memoData', memoDataRef.orderBy('memoId'))
  }),

  bindColorList: firebaseAction(async ({bindFirebaseRef}) => {
    await bindFirebaseRef('colorList', colorListRef)
  }),

  bindRoomList: firebaseAction(async ({bindFirebaseRef}) => {
    await bindFirebaseRef('roomList', roomListRef.orderBy('roomId', 'desc'))
  }),

  bindLastRoom: firebaseAction(async ({bindFirebaseRef}) => {
    await bindFirebaseRef('lastRoom', lastRoomRef)
  }),


  unBindMemoData: firebaseAction(async ({unbindFirebaseRef}) => {
    await unbindFirebaseRef('memoData')
  }),

  unBindColorList: firebaseAction(async ({unbindFirebaseRef}) => {
    await unbindFirebaseRef('colorList')
  }),

  unBindRoomList: firebaseAction(async ({unbindFirebaseRef}) => {
    await unbindFirebaseRef('roomList')
  }),

  unBindLastRoom: firebaseAction(async ({unbindFirebaseRef}) => {
    await unbindFirebaseRef('lastRoom')
  }),


  addMemo: firebaseAction(({context, state}) => {
    const newMemoData = state.memoData.concat()
    const lastMemo = newMemoData[newMemoData.length - 1] || { memoId: 0 }
    const addMemoId = lastMemo.memoId + 1
    const lastRoomId = Number(state.lastRoom.roomId)

    memoDataRef.doc(String(addMemoId)).set({
      roomId: lastRoomId,
      memoId: addMemoId,
      left: 20, // 常に一番左に生成することにした
      top: 20,
      colorIndex: 0, // 課題
      text: '',
      zIndex: 0, // 新たに追加した
    })

  }),

  updateMemo: firebaseAction(({context, state}, memo) => {
    memoDataRef.doc(String(memo.memoId)).update(memo)
  }),

  removeMemo: firebaseAction(({context, state}, memoId) => {
    memoDataRef.doc(String(memoId)).delete()
  }),

  addRoom: firebaseAction(({dispatch,context, state}, {roomId, name}) => {
    Promise.resolve()
    .then( () => roomListRef.doc(String(roomId)).set({roomId: Number(roomId),  roomName: String(name)}))
    .then( () => lastRoomRef.set({roomId: Number(roomId)}))
    .then( () => dispatch('addMemo'))
  }),

  updateLastRoomId: firebaseAction(({context, state}, roomId) => {
    lastRoomRef.set({roomId: Number(roomId)})
  }),

  updateRoomName: firebaseAction(({context, state}, {roomId, roomName}) => {
    roomListRef.doc(String(roomId)).update({roomName: String(roomName)})
  }),

  removeRoom: firebaseAction(({commit, dispatch, getters}, roomId) => {
    const targetMemo = [...getters.getMemoByRoomId(roomId).map(m => m.memoId)]
    const batch = db.batch()
    Promise.resolve()
    .then( () => {for(let i=0; i<targetMemo.length; i++) {
                    batch.delete(memoDataRef.doc(String(targetMemo[i])))
    }})
    .then( () => batch.commit())
    .then( () => roomListRef.doc(String(roomId)).delete())
  }),
};
