<template>
    <div>
        <b-list-group>
            <nuxt-link v-for="room in this.$store.state.roomList" :key="room.id" :to="`/board/?roomId=${room.roomId}`">
                <div class="listBtn">
                    <b-list-group-item :active="room.roomId==$store.state.lastRoom.roomId" class="listItem" :style="changeW(room.roomId)" variant="secondary">{{room.roomName}}</b-list-group-item>
                    <div class="btns" v-show="room.roomId==$store.state.lastRoom.roomId">
                        <b-button class="cnBtn" variant='success' @click="changeName(room.roomId, room.roomName)">CN</b-button>
                        <b-button class="rmBtn" variant='danger' @click="removeRoom(room.roomId)">RM</b-button>
                    </div>
                </div>
            </nuxt-link>
        </b-list-group>
    </div>

</template>

<script>
import bListGroup from 'bootstrap-vue/es/components/list-group/list-group'
import bListGroupItem from 'bootstrap-vue/es/components/list-group/list-group-item'
import bButton from 'bootstrap-vue/es/components/button/button';
import { mapActions } from 'vuex';

export default {
    components: {
        bListGroup,
        bListGroupItem,
        bButton
    },

    data() {
        return {
            //リアクティブにならないため、dataでは使えない。computedかtemplateに直書きする
            // rooms: this.$store.state.roomList,
        }
    },
    created() {
        
    },

    methods: {
        ...mapActions({
            dispRemoveRoom: 'removeRoom'
        }),

        changeW(roomId) {
            if(roomId!=this.$store.state.lastRoom.roomId) {
                return {width: '300px'}
            }
        },

        changeName(roomId, roomName) {
            this.$emit('changeName', {roomId: roomId, roomName: roomName, modal: true})
        },

        removeRoom(roomId) {
            if(window.confirm('Are you sure you want to permanently delete this room?')){
                const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
                Promise.resolve()
                .then( () => this.dispRemoveRoom(roomId))
                .then( () => wait(600))
                .then( () => alert('Done.'))
            } else {
                alert('Cancelled.')
            }
        }
    },

    computed: {

    }

}
</script>

<style scoped>
    div {
       overflow: auto;
       height: 93%;
    }

    .listBtn {
        display: flex;
        align-items: center;
        width: 100%;
        
    }
    .listItem {
        width: 200px;
        font-size: 1.15rem;
        
    }

    .btns {
        display: flex;
        align-items: center;
        font-size: 1rem;
        margin-left: 4px;
    }

    .cnBtn {
        width: 44px;
        padding: 2px 4px;
    }

    .rmBtn {
        width: 44px;
        padding: 2px 4px;
        margin-left: 4px;
    }

</style>
