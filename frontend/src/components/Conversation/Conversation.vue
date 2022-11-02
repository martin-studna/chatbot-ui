<template>
  <div
    id="conversation-scroller"
    class="chatbot__conversation"
    data-cy="chatbot__conversation">
    <template v-for="(payload, mi) in messages">
      <UserMessage
        v-if="payload.input.text.trim().length && payload.input.text.trim() !== 'reset'"
        :key="mi + 'u'"
        class="user-message"
        :payload="payload"
        :class="{ 'last-message': isLatest }" />
      <BotMessage
        v-if="payload.output"
        :key="mi + 'b'"
        class="bot-message"
        :payload="payload.output.generic"
        :loading="loading"
        :disabled="messages.length - 1 !== mi"
        :count="messages.length"
        :mi="mi"
        :class="{ 'last-message': isLatest(mi) }" />
    </template>
    <LoadingBubble v-if="loading" />
    <div id="bottom" />
  </div>
</template>

<script>
import Vue from 'vue'
import BotMessage from '../BotMessage/BotMessage'
import UserMessage from '../UserMessage/UserMessage'
import GlobalFunctionsMixin from "../../mixins/GlobalFunctionsMixin";
import LoadingBubble from "../LoadingBubble/LoadingBubble";
import { mapState } from "vuex";

export default {
    components: {
        LoadingBubble,
        UserMessage,
        BotMessage,
    },
    mixins: [ GlobalFunctionsMixin ],
    data() {
        return {
            sendStyle: 'send',
            input: '',
            isOpen: false,
            isChatbotActive: false,
            theme: {
                user: ['white', '#393939', '#8be'],
                bot: ['black', 'inherit'],
                ...['white', '#393939', '#8be'].slice(0),
            },
        }
    },
    computed: {
        ...mapState([ 'loading' ]),
    },
    methods: {
        isLatest(index) {
            return index ===  this.messages.length - 1
        },
    }
}
</script>

<style scoped src='./Conversation.css'/>
