<template>
  <div class="chatbot__input-section">
    <textarea
      id="textarea-bot"
      ref="input"
      v-model="input"
      autocomplete="off"
      type="text"
      placeholder="Type something..."
      maxlength="500"
      class="chatbot__input hvr-fade"
      @keyup="textAreaAdjust()"
      @keyup.arrow-up="inputPrevious"
      @keydown.enter.prevent="input && !loading && send()" />
    <div
      :class="[!input ? 'send disabled' : 'send active']"
      :style="{cursor: (!input || loading ? 'not-allowed' : 'pointer')}"
      :disabled="!input || loading"
      @click="send()">
      <img
        src="../../../assets/send-button.svg"
        width="18px"
        :class="
          !input
            ? 'send-button-image'
            : 'send-button-image active'">
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import GlobalFunctionsMixin from "../../mixins/GlobalFunctionsMixin";

export default {
    mixins: [ GlobalFunctionsMixin ],
    data() {
        return {
            input: ''
        }
    },
    computed: {
        ...mapState([ 'loading' ]),
        ...mapGetters([ 'lastMessageInput' ])
    },
    methods: {
        send() {
            document.getElementById("textarea-bot").focus()
            if ( this.input.length > 0 ) {
                this.say(this.input)
                this.input = ''
            }
        },
        textAreaAdjust() {
            const textAreaBot = document.getElementById("textarea-bot");
            textAreaBot.style.height = "40px";
            if (textAreaBot.scrollHeight !== 42)
                textAreaBot.style.height = (textAreaBot.scrollHeight)+"px";
        },
        inputPrevious() {
            this.input = this.lastMessageInput || ""
        }
    },
}
</script>

<style src='./ChatInput.css' scoped>

</style>