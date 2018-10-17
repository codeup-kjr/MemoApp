<template>
  <!-- z-indexとbackground-colorを追加した -->
  <div
    class="memo"
    :style="`
      top: ${data.top}px;
      left: ${data.left}px;
      z-index: ${data.zIndex};
      background-color: ${$store.state.colorList[data.colorIndex]};
    `"
    @mousedown="putForward(data.roomId, data.memoId)"
  >
    <div class="handle" @mousedown="$emit('start', $event)"/>

    <!-- 閉じるボタンを追加した -->
    <!-- <span class="close" @click="$store.commit('removeMemo', data.id)">X</span> -->
    <span class="close" @click="removeMemo(data.memoId)">X</span>

    
    <Editor :roomId="data.roomId" :id="data.memoId" :text="data.text" @input="onInput"/>
    <ColorList :data="data" @color="colorChange"/>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Editor from './Editor';
import ColorList from './colorList'

export default {
  data() {
    return {
      roomId: this.$store.state.lastRoomId
      }
  },
  components: {
    Editor,
    ColorList
  },
  props: ['data'], // dataにまとめたので注意
  methods: {
    ...mapActions({
      removeMemo: 'removeMemo', 
      updateMemo: 'updateMemo'
    }),

    onInput(roomId, memoId, text) {
      // 課題：現状だと文字は入力できるが、値が保存されないのでリロードすると消える
    const targetMemo = {
        ...this.getMemoById(roomId, memoId)
      }
      targetMemo.text = text
      // this.$store.commit('updateMemo', targetMemo)
      this.updateMemo(targetMemo)
    },
    putForward(roomId, memoId) {
      // 課題：該当のメモのzIndexをmemoData配列の中の最大+1にして前面に出したい
      // pages/index.vue > methods.onMoveを参考に、getMemoByIdを使うこと
      const targetMemo = {
        ...this.getMemoById(roomId, memoId)
      }
      targetMemo.zIndex = this.maxZ + 1
      this.updateMemo(targetMemo)
    },
    
    colorChange(roomId, memoId, colorIndex) {
      const targetMemo = {
        ...this.getMemoById(roomId, memoId)
      }
      targetMemo.colorIndex = colorIndex

      this.updateMemo(targetMemo)
    }
  },
  computed: {
    ...mapGetters({
      // `this.doneCount` を `store.getters.doneTodosCount` にマッピングさせる
      getMemoById: 'getMemoById',
      getMemoByRoomId: 'getMemoByRoomId'
    }),

    maxZ() {
      return Math.max(...this.getMemoByRoomId(this.$store.state.lastRoom.roomId).map(m => m.zIndex)) //math.maxは引数に空の配列を指定すると、結果がマイナス無限大になってしまうので、
    }
  }
};
</script>

<style scoped>
.memo {
  position: absolute;
  top: 20px;
  width: 200px;
  height: 300px;
}

.handle {
  width: 100%;
  height: 50px;
  background: rgba(0, 0, 0, 0.2);
  cursor: move;
}

.close {
  color: #fff;
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 20px;
  cursor: pointer;
}
</style>
