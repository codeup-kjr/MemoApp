<template>
    <div class="newRoom">
        <input type="text" placeholder="input new room name" v-model="roomName">
        <button @click="makeRoom()">Make</button>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    data() {
        return {
            roomName: ''
        }
    },

    methods: {
        ...mapActions({
            updateLastRoomId: 'updateLastRoomId', 
            addRoom: 'addRoom',

            
        }),
        makeRoom() {
            if(!this.roomName) {
                alert('Please edit the Room Name.')
                return
            }
            const sameName = 
                this.getRoomByName(this.roomName)
            if(sameName) {
                const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
                Promise.resolve()
                .then( () => alert("You've already made a room with the same name."))
                .then( () => this.updateLastRoomId(sameName.roomId))
                .then( () => this.$router.push(`/board/?roomId=${sameName.roomId}`))
                //トップ画面の挙動を見せないため
                .then( () => wait(150))
                .then( () => this.$emit('makePushed', false))
                .then( () => this.roomName = '')
                return
            }
            const newRoomId = this.maxRoomId + 1
            Promise.resolve()
                .then( () => this.addRoom({roomId: newRoomId, name: this.roomName}))
                .then( () => this.updateLastRoomId(newRoomId))
                .then( () => this.$router.push(`/board/?roomId=${newRoomId}`))
                .then( () => this.roomName = '')
                .then( () => this.$emit('makePushed', false))
        }
    },

    computed: {
        ...mapGetters({
            getRoomByName: 'getRoomByName'
        }),

        maxRoomId() {
            const max = Math.max(...this.$store.state.roomList.map(r => r.roomId))
            if(isFinite(max)){
                return max
            } else {
                return 0
            }
        }
    }

}
</script>

<style scoped>
    .newRoom {
        display: flex;
    }

    input {
        box-sizing: border-box;
        width: 340px;
        height: 40px;
        padding: 4px 8px;
        font-size: 1.3rem;
        margin-right: 8px;
    }

    button {
        width: 100px;
        height: 40px;
        font-size: 1.1rem;
    }

</style>
