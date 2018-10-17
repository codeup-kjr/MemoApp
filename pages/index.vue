<template>
    <!-- <div class="container"> -->
    <b-jumbotron 
            :fluid="true"
            text-variant="white"
            bg-variant="transparent"
            >
        <div class="background">
            <div class="title">
                <i class="fas fa-quote-right logo"/><span class="title-text">Memo App</span>
            </div>
        <newRoom class="input"/>
        </div>
    </b-jumbotron>
    <!-- </div> -->

</template>

<script>
import bJumbotron from 'bootstrap-vue/es/components/jumbotron/jumbotron'
import newRoom from '~/components/newRoom'
import { mapGetters, mapActions } from 'vuex'

export default {
    components: {
        bJumbotron,
        newRoom
    },
    created() {
      //mounted()とのタイミングの違いを調べる
     // メモが1枚も無いなら＋ボタンを押すのと同じメソッドを呼んで生成
    Promise.resolve()
    .then( () => this.bindRoomList())

    Promise.resolve()
    .then( () => this.bindLastRoom())
    .then( () => { if(!this.$store.state.lastRoom.roomId) {
                      this.updateLastRoomId(1)
                    }
                })
    
    Promise.resolve()
    .then( () => this.bindMemoData())

    // this.bindColorList()
    
  },
    destroyed() {
    this.unBindMemoData()
    // this.unBindColorList()
    this.unBindRoomList()
    this.unBindLastRoom()
  },


  methods: {
    ...mapActions({
      bindMemoData: 'bindMemoData',
      bindColorList: 'bindColorList',
      bindRoomList: 'bindRoomList',
      bindLastRoom: 'bindLastRoom',

      unBindMemoData: 'unBindMemoData',
      unBindColorList: 'unBindColorList',
      unBindRoomList: 'unBindRoomList',
      unBindLastRoom: 'unBindLastRoom',
      addRoom: 'addRoom',
      updateLastRoomId: 'updateLastRoomId',

    })
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
    z-index: -1;
}

.title {
    position: fixed;
    left: 4%;
    top: 80%;
    color: whitesmoke;
}

.logo{
    margin-right: 24px;
    font-size: 4.6rem;
    color: rgba(245, 245, 245, 0.886);
}

.title-text {
    font-size: 5.5rem;
    letter-spacing: 0.2rem;
    font-weight: bold;
    font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.input{
    position: fixed;
    top: 45%;
    left: 35.3%;
}
</style>
