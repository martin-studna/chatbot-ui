<template>
  <div :class="{'chatbot__tooltip': true, hidden: isHidden || hideByToggle}">
    <div
      id="tooltip__wrapper"
      class="tooltip__wrapper hvr-fade">
      <div class="tooltip__arrow" />
      <div class="tooltip__inner">
        <button
          class="tooltip__close-button"
          @click="hideDialog()">
          <img
            alt="minimize_button"
            src="../../../assets/close-button.svg">
        </button>
        <div class="tooltip__greeting">
          <ChatbotAvatar style="margin-left: 0" />
          <span>Hello, my name is Alfred.</span>
        </div>
        <div style="margin-bottom: 15px; max-width: 90%">
          I was created as custom chatbot UI by IBM, AI CoE Prague team.
        </div>
        <div>
          How can I help you, sir?
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatbotAvatar from '../ChatbotAvatar/ChatbotAvatar.vue'

export default {
    components: {
        ChatbotAvatar,
    },
    props: ['hideByToggle'],
    data() {
        return {
            isHidden: false
        }
    },
    methods: {
        hideDialog() {
            this.isHidden = true
            this.$emit('hide')
        }
    }
}
</script>

<style scoped src="./Tooltip.css">
</style>
