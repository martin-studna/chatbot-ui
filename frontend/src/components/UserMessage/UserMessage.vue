<template>
  <div
    class="user-message__content"
    :class="{ 'last-user-message': isLatest }"
    @click="$emit('click', arguments[0])">
    {{ message }}
  </div>
</template>

<style src='./UserMessage.css' scoped></style>

<script>
import Vue from 'vue'
import { mapState } from "vuex";

export default Vue.extend({
    props: { payload: {type: Object, default: null} },
    data() {
        return {
            message: null
        }
    },
    computed: {
        ...mapState(['messages']),
        isLatest() {
            return this.payload === this.messages[ this.messages.length - 1 ]
        }
    },
    mounted() {
        this.message = this.payload.label ? this.payload.label : this.payload.input.text
    },
    methods: {},
});
</script>
