<template>
  <!-- handlerから外れてもドラッグを止められるように
    mouseupもcontainerに当てることにした -->
  <div>
  <b-jumbotron :fluid="true" bg-variant="transparent">
  <div
    class="background"
    @mousemove="onMove"
    @mouseup="dragEnd"
  >
    <!-- 属性名dataで連想配列ごと渡すことにした -->
    <!-- @start="dragStart($event, data)"のように連想配列ごと渡す方式では移動できないので注意 -->
    <!-- $eventは子コンポーネントがemitした値 -->
    <!-- <div v-show="!modalShow"> -->
    <Memo
      v-for="data in dispMemo"
      :key="data.id"
      :data="data"
      @start="dragStart($event, data.memoId)"
    />
    <!-- </div> -->
  </div>
    </b-jumbotron>
      <div class="roomContainer">
        <div class="homeBtn">
          <homeBtn/>
        </div>
        <div class="makeRoom">
        <b-btn @click="modalShow=!modalShow" class="modalBtn">Make New Room</b-btn>
        <b-modal v-model="modalShow" title="Make New Room" hide-footer>
          <newRoom @makePushed="modalShow=$event"></newRoom>
        </b-modal>
      </div>
      <roomList @changeName="changeNameModal=$event.modal, changeId=$event.roomId, changeName=$event.roomName"/>
      <b-modal v-model="changeNameModal" title="Change Room Name" hide-footer>
          <div class="cnBtIn">
            <input type="text" v-model="changeName" class="cnNameInput">
            <b-button variant='warning' class="cnNameBtn" @click="cnNameCm()">Commit</b-button>
          </div>
      </b-modal>
    </div>
  <!-- <div v-show="!modalShow"> -->
  <AddBtn @add="addMemo()" class="addBtn"/>
  <!-- </div> -->
  </div>
</template>

<script>
import Memo from '~/components/Memo'
import AddBtn from '~/components/AddBtn'
import homeBtn from '~/components/HomeBtn'
import newRoom from '~/components/newRoom'
import roomList from '~/components/roomList'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import bModal from 'bootstrap-vue/es/components/modal/modal'
import bJumbotron from 'bootstrap-vue/es/components/jumbotron/jumbotron'

export default {
  components: {
    Memo,
    AddBtn,
    homeBtn,
    newRoom,
    roomList,
    bModal,
    bJumbotron
  },


  async fetch({store, redirect, route}) {
    const dispRoomId = route.query.roomId
    if(dispRoomId) {
      store.dispatch('updateLastRoomId', dispRoomId)
      store.commit('updateLastRoomId', dispRoomId)
    }
  },

  //route.queryに指定したroomIdの変更をwatchする。
  watchQuery: ['roomId'],

  data() {
    // このコンポーネントでしか使わない値や、storeに保存するほどでもない値はdataを使う
    return {
      draggingId: null, // targetId から名称変更、永続化する意味がないのでstoreに保存しないことにした
      prevX: null,
      prevY: null,
      roomId: this.$store.state.lastRoom.roomId,
      modalShow: false,
      changeNameModal: false,
      changeId: '',
      changeName: ''
      
    };
  },
  created() {
   
    
  },

  mounted() {
     //mounted()とのタイミングの違いを調べる
     // メモが1枚も無いなら＋ボタンを押すのと同じメソッドを呼んで生成
    Promise.resolve()
    .then( () => this.bindRoomList())
    .then( () => { if(this.$store.state.roomList.length == 0) {
                      this.addRoom({roomId: 1, name: 'No-Name'})
                    }
                })
    // Promise.resolve()
    .then( () => this.bindLastRoom())
    .then( () => { if(!this.getRoomById(this.$store.state.lastRoom.roomId)) {
                      this.comUpdateLastRoomId(Math.max(...this.$store.state.roomList.map(r => r.roomId)))
                    }
                })
    .then( () => this.$router.push(`/board/?roomId=${this.$store.state.lastRoom.roomId}`))
    .then( () => this.unBindLastRoom())
    
    // Promise.resolve()
    .then( () => this.bindMemoData())

    // this.bindColorList()
  },

  destroyed() {
    this.unBindMemoData()
    // this.unBindColorList()
    this.unBindRoomList()
    // this.unBindLastRoom()
  },

  methods: {
    ...mapMutations({
      comUpdateLastRoomId: 'updateLastRoomId'
    }),

    ...mapActions({
      bindMemoData: 'bindMemoData',
      bindColorList: 'bindColorList',
      bindRoomList: 'bindRoomList',
      bindLastRoom: 'bindLastRoom',

      unBindMemoData: 'unBindMemoData',
      unBindColorList: 'unBindColorList',
      unBindRoomList: 'unBindRoomList',
      unBindLastRoom: 'unBindLastRoom',

      addMemo: 'addMemo',
      addRoom: 'addRoom',
      updateLastRoomId: 'updateLastRoomId',
      updateMemo: 'updateMemo',
      updateRoomName: 'updateRoomName'

    }),

    handleToggleDrawer() {
        this.$refs.drawerLayout.toggle();
      },

    cnNameCm() {
      const sameName = this.getRoomByName(this.changeName)
      if(sameName) {
          alert("You've already made a room with the same name.")
          return
      }
      Promise.resolve()
        .then( () => this.updateRoomName({roomId: Number(this.changeId), roomName: String(this.changeName)}))
        .then( () => this.changeId = '')
        .then( () => this.changeName = '')
        .then( () => this.changeNameModal = false)
    },

    dragStart(e, memoId) {
      this.draggingId = memoId;

      // startの度にマウス位置を初期化するとonMoveの処理がすっきり書けることに気付いた
      this.prevX = e.pageX;
      this.prevY = e.pageY;
    },
    dragEnd() {
      this.draggingId = null;
    },
    onMove(e) {
      const { draggingId } = this; // const draggingId = this.draggingId; と同じ
      if (draggingId === null) return;

      const x = e.pageX;
      const y = e.pageY;
      const targetMemo = {
        // store/index.jsのgetters.getMemoByIdを参照
        // 重要なのはここの使い方、computedに似ているかも
        // storeにdraggingIdを渡す⇒該当するメモを計算して返してもらう
        // ...スプレッド演算子で連想配列のコピーを作る
        ...this.getMemoById(this.$store.state.lastRoom.roomId, draggingId),
      };

      // 現在のマウス位置から直前(prev)のマウス位置を引いた差分
      targetMemo.left += x - this.prevX;
      targetMemo.top += y - this.prevY;
      this.prevX = x;
      this.prevY = y;
      
      this.updateMemo(targetMemo);
    },
  },
  computed: {
    ...mapGetters({
        getMemoById: 'getMemoById',
        getMemoByRoomId: 'getMemoByRoomId',
        getRoomById: 'getRoomById',
        getRoomByName: 'getRoomByName'
     }),

    dispMemo() {
      return this.getMemoByRoomId(this.$store.state.lastRoom.roomId)
    }
  }
}
</script>

<style scoped>
.background {
    background: center/cover url('~/assets/bg.png');
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* z-index: -1; */
}

.roomContainer{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgb(196, 197, 199);
    width: 300px;
}

.homeBtn{
  background-color: rgb(52, 54, 57);
}

.modalBtn {
  width: 260px;
  margin-left: 20px;
  letter-spacing: 0.01rem
}

.newRoom{
  margin-left: 10px;
}

.makeRoom {
    background-color: rgb(202,	211, 134);	
    height: 60px;
    right: 0;
    width: 100%;
    display: flex;
    align-items: center;
}

.addBtn {
  position: fixed;
  top: 50%;
  left: 40%;
}

.cnBtIn {
  display: flex;
  align-items: center;
}

.cnNameInput {
    box-sizing: border-box;
    width: 340px;
    height: 40px;
    padding: 4px 8px;
    font-size: 1.3rem;
    margin-right: 8px;
}
</style>
