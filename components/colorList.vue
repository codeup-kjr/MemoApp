<template>
    <div class="palet">
    <div v-for="(color, index) in colors" :key="color.id" :style="{backgroundColor: color, padding:colorWidth, marginTop:'-3px'}" @click="sendColor(index)"></div>
    </div>
</template>

<script>
export default {
    //なぜかmemoIdがundefinedになるため、dataで受領
    props: ['data'],
    data() {
        return {
            colors: this.$store.state.colorList,
        }
        // 
    },
    methods: {
        sendColor(index) {
            this.$emit('color', this.data.roomId, this.data.memoId, index)
        }
    },
    computed: {
        colorWidth: function() {
            return (200 / this.colors.length / 2) + 'px'
        }
    }
}
</script>

<style scoped>
.palet {
    display: flex;
    width: 100%;
    margin-top: -3px;
}
</style>

