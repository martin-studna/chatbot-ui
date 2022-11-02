<template>
  <div
    class="chatbot-container">
    <div
      v-if="chatbotOpened"
      class="overlay"
      @click="hideChatbot" />
    <ToggleButton
      v-if="showChatbotButton"
      :show-chatbot="showChatbot" />
    <div
      id="chatbot"
      :class="{chatbot: true, animated: true, 'fade-out-down': !chatbotOpened, 'fade-in-up': chatbotOpened, hidden: isHidden}">
      <ChatHeader
        :deploy-s-s-o="deploySSO"
        :azure-tenant-id="azureTenantId"
        :azure-client-id="azureClientId"
        :hide-chatbot="hideChatbot" />
      <Conversation
        :messages="messages" />
      <ChatInput />
    </div>
  </div>
</template>

<style src="./app.css"></style>
<script>
import Vue from 'vue'
import axios from 'axios'
import io from 'socket.io-client'
import msal from 'vue-msal'
import { log } from 'util'
import { loadavg } from 'os'
import Conversation from './components/Conversation/Conversation.vue'
import ToggleButton from './components/ToggleButton/ToggleButton.vue'
import ChatHeader from './components/ChatHeader/ChatHeader.vue'
import ChatInput from './components/ChatInput/ChatInput.vue'
import Feedback from './components/Feedback/Feedback.vue'
import GlobalFunctionsMixin from "./mixins/GlobalFunctionsMixin";
import VueScrollTo from "vue-scrollto";
import { mapGetters, mapMutations, mapState } from "vuex";
import ClickOutside from 'vue-click-outside'
import {addPopup, removePopup} from "./modules/misc";

axios.defaults.baseURL = process.env.VUE_APP_SERVER_URL;

if (
    process.env.VUE_APP_AZURE_CLIENT_ID &&
  process.env.VUE_APP_AZURE_TENANT_ID
) {
    Vue.use(msal, {
        auth: {
            clientId: process.env.VUE_APP_AZURE_CLIENT_ID,
            tenantId: process.env.VUE_APP_AZURE_TENANT_ID,
        },
    })
}

export default Vue.extend({
    components: {
        ToggleButton,
        ChatHeader,
        Conversation,
        ChatInput,
        Feedback
    },
    directives: {
        ClickOutside
    },
    mixins: [ GlobalFunctionsMixin ],
    data() {
        return {
            chatbotOpened: false,
            isHidden: true,
            showChatbotButton: true,
            sendStyle: 'send',
            input: '',
            deploySSO: process.env.VUE_APP_DEPLOY_SSO,
            azureClientId: process.env.VUE_APP_AZURE_CLIENT_ID,
            azureTenantId: process.env.VUE_APP_AZURE_TENANT_ID,
            isOpen: false,
            isChatbotActive: false,
            theme: {
                user: ['white', '#393939', '#8be'],
                bot: ['black', 'inherit'],
                ...['white', '#393939', '#8be'].slice(0),
            },
            scrollOptions: {
                container: '#conversation-scroller',
                easing: 'ease',
                cancelable: true,
                offset: 0,
                x: false,
                y: true,
            },
            feedback: null
        }
    },
    computed: {
        ...mapState([ 'loading', 'messages', 'azureAccessToken' ]),
    },
    watch: {
        chatbotOpened (value) {
            if (value && this.messages.length == 0) this.say('', {
                host: location.host,
                metadata: {
                    deployment: location.host
                }
            });
        }
    },
    created() {
        if (process.env.VUE_APP_DEPLOY_SSO === 'startup') this.authenticate();

        if (
            process.env.VUE_APP_DEPLOY_SSO &&
            this.$msal.isAuthenticated() &&
            this.azureAccessToken === ''
        ) {
            this.storeAzureToken().then(() => {
                axios
                    .post('/auth/userInfo', {
                        userToken: this.azureAccessToken,
                    })
                    .then(res => {
                        console.log('Server authentication response: ', res)
                        this.SET_JSON_WEB_TOKEN(res.data.token)
                    })
                    .catch(err => {
                        console.log(err)
                    })
            })
        }
    },
    mounted() {
        this.isHidden = !this.chatbotOpened;
        this.SET_LOADING( true );
    },
    updated() {},
    methods: {
        ...mapMutations([ 'SET_LOADING', 'PUSH_TO_MESSAGES', 'SET_POPUP_OPEN', 'SET_AZURE_TOKEN', 'SET_JSON_WEB_TOKEN' ]),
        showChatbot() {
            this.chatbotOpened = true;
            this.isHidden = false;
            this.$nextTick(function () { removePopup(); })
        },
        hideChatbot() {
            this.chatbotOpened = false;
            this.$nextTick(function () { addPopup(); });

            window.setTimeout(() => {
                this.isHidden = true
            }, 300)
        },
        showOpenChatButton() {
            this.showChatbotButton = true;
        },
        hideOpenChatButton() {
            this.showChatbotButton = false;
        },
        storeAzureToken() {
            return new Promise((resolve, reject) => {
                this.$msal
                    .acquireToken()
                    .then(response => {
                        this.SET_AZURE_TOKEN(response)
                        resolve(response)
                    })
                    .catch(err => {
                        reject(err)
                    })
            })
        }
    },
});
</script>
