<template>
  <div class="chatbot__header">
    <div class="chatbot__header-assistant">
      <div class="chatbot__header-title">
        Alfred
      </div>
      <a
        href="https://dwr.storaenso.com/chatbot-general-information/"
        class="chatbot__header-info-button"
        target="_blank">
        <span class="tooltip-text">Info</span>
        <img
          src="../../../assets/info.svg"
          style="width: 20px; height: 20px">
      </a>
    </div>
    <div class="chatbot__header-buttons">
      <button
        class="chatbot__header-reset-button"
        @click="resetChatbot()">
        <span class="tooltip__text">Reset</span>
        <img
          src="../../../assets/redo-alt.svg"
          style="width: 20px; height: 20px">
      </button>
      <button
        v-if="deploySSO === 'button'"
        class="login-button"
        @click="authenticate()">
        <span
          v-if="!this.$msal.isAuthenticated()"
          class="tooltip__text">Login</span>
        <span
          v-else
          class="tooltip__text">Logout</span>
        <img
          style="width: 20px; height: 20px"
          :src="!this.$msal.isAuthenticated() ? require('../../../assets/sign-in.svg') : require('../../../assets/sign-out.svg')"
          alt="azure_login">
      </button>
      <button
        class="chatbot__header-minim-button"
        @click="hideChatbot()">
        <span class="tooltip__text">Hide</span>
        <img
          alt="minimize_button"
          class="minimize-image"
          style="width: 20px; height: 20px;"
          src="../../../assets/minim-button.svg">
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import msal from 'vue-msal'
import ChatbotAvatar from "../ChatbotAvatar/ChatbotAvatar.vue";
import GlobalFunctionsMixin from "../../mixins/GlobalFunctionsMixin";
import { mapMutations, mapState } from "vuex";

if (
  this?.azureClientId &&
  this?.azureTenantId 
) {
    Vue.use(msal, {
        auth: {
            clientId: this.azureClientId,
            tenantId: this.azureTenantId,
        },
    })
}

export default {
    components: { ChatbotAvatar },
    mixins: [ GlobalFunctionsMixin ],
    props: {
        hideChatbot: {type: Function, default: null},
        deploySSO: {type: String, default: null},
        azureClientId: {type: String, default: null},
        azureTenantId: {type: String, default: null}
    },
    methods: {
        ...mapMutations([ 'CLEAR_MESSAGES' ]),
        resetChatbot() {
            this.CLEAR_MESSAGES()
            this.say("reset");
            document.getElementById('textarea-bot').focus()
        },
    }
}

</script>

<style src="./ChatHeader.css" scoped></style>
