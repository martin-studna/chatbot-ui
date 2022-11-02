<template>
  <div class="bot-message">
    <ChatbotAvatar />
    <div class="bot-message__content">
      <div
        v-for="(message, i) in payload"
        :key="i">
        <Reply
          v-if="validateInput(message) && message.show"
          class="fade-message" 
          :message="message" />
        <ImageHolder
          v-if="message.show"
          class="fade-message"
          :message="message" />
        <DiscoveryResults
          v-if="message.show"
          class="fade-message"
          :message="message" />
        <Options
          v-if="message.show"
          class="fade-message"
          :message="message"
          :disabled="disabled"
          @say="say( arguments[0] )" />
        <Suggestions
          v-if="message.show"
          class="fade-message"
          :message="message"
          :disabled="disabled"
          @say="say(arguments[0])" />
        <Pause
          v-if="message.response_type === 'pause' && message.typing && message.show"
          style="margin-left: 10px; margin-top: 5px" />
      </div>
    </div>
  </div>
</template>

<style src='./BotMessage.css' scoped>
</style>

<script>
import Vue from 'vue'
import Suggestions from '../Suggestions/Suggestions.vue'
import Options from '../Options/Options.vue'
import ChatbotAvatar from "../ChatbotAvatar/ChatbotAvatar";
import GlobalFunctionsMixin from "../../mixins/GlobalFunctionsMixin";
import LoadingBubble from '../LoadingBubble/LoadingBubble'
import DiscoveryResults from '../DiscoveryResults/DiscoveryResults'
import ImageHolder from '../ImageHolder/ImageHolder'
import Pause from '../Pause/Pause'
import { mapState, mapMutations } from "vuex";
import Reply from '../Reply/Reply.vue'

export default Vue.extend({
    components: {
        ChatbotAvatar,
        Reply,
        Suggestions,
        Options,
        ImageHolder,
        DiscoveryResults,
        Pause
    },
    mixins: [ GlobalFunctionsMixin ],
    props: {
        payload: { type: Array, default: null },
        disabled: { type: Boolean, default: null}
    },
    computed: {
        ...mapState(['loading']),
    },
    mounted() {
        this.showMessages(0, false)
    },
    data() {
        return {
        //botMessages: []
        }
    },
    methods: {
        ...mapMutations([ 'SET_LOADING', 'PUSH_TO_MESSAGES', 'SET_POPUP_OPEN' ]),
        validateInput(message) {
            return message.response_type !== 'image'
            && message.response_type !== 'pause'
            && message.response_type !== 'search'
            && message.title !== ''
            && message.text !== ''
        },
        showAvatar(message) {
            return !(message.response_type === 'pause'
            || (message.response_type === 'option' && message.title.length === 0)
            || (message.response_type === 'suggestion' && message.title.length === 0))
        },
        showMessages(index, pause) {
            if (index >= this.payload.length)
                return

            if (this.payload[index].response_type === 'pause') {
                this.payload[index].show = true
                this.$forceUpdate()
                setTimeout(() => {
                    this.payload[index].show = false
                    index++;
                    this.showMessages(index, true);
                }, this.payload[index].time);
            }
            else {
                this.payload[index].show = true
                this.$forceUpdate()
                if (index !== 0 && pause)
                    this.$nextTick(function () { this.scrollToBottom(600); });
                index++;
                this.showMessages(index, false);
            }
        },
    }
});
</script>
