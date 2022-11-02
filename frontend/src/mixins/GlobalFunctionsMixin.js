import axios from "axios";
import VueScrollTo from "vue-scrollto";
import { mapGetters, mapMutations, mapState } from "vuex";
import { sleep } from "../modules/misc";

export default {
    computed: {
        ...mapState([ 'messages', 'jsonWebToken', 'sessionId' ]),
    },
    methods: {
        ...mapMutations([
            'SET_LOADING',
            'PUSH_TO_MESSAGES',
            'SET_LAST_MESSAGE',
            'SET_AZURE_TOKEN',
            'SET_JSON_WEB_TOKEN',
            'SET_SESSION_ID'
        ]),
        getSessionId() {
          return this.sessionId;
        },
        submitFeedback(feedbackValue, message) {
            axios
                .post('/feedback/googleSheets', {
                    sessionId: this.getSessionId(),
                    feedback: feedbackValue,
                    message: message.text || message.title || undefined
                })
                .catch(err => {
                    console.log(err);
                });

        },
        async say( message, event, label = '' ) {

            // message = message.replace(/(\r\n|\n|\r)/gm, '');

            this.SET_LOADING( true );
            this.scrollDown(50);

            if (typeof message === 'string') message = { input: { text: message } };

            if (label === '') label = message;
            else label = { input: { text: label } };

            let payload = {
                alternate_intents: true,
                sessionId: this.getSessionId(),
                context: {},
                ...message
            };
            payload.context.jsonWebToken = this.jsonWebToken;
            console.log('FIRST PAYLOAD:', payload);

            message = { ...message, date: new Date() };
            console.log("LABEL:", label);

            const labelMessage = { ...label, date: new Date() }

            this.PUSH_TO_MESSAGES( labelMessage );

            // Wait for a response

            const response = await axios.post(
                '/conversation/workspaces/default/message',
                payload
            );

            payload = response.data.result;
            this.SET_SESSION_ID(response.data.sessionId);

            if (payload.error) console.error(payload.error);

            let pauseResponse = payload?.output?.generic?.find( generic => generic.response_type === 'pause');

            payload?.output?.generic.forEach(m => {
                m.show = false
            });

            console.log('PAUSE', pauseResponse);

            if (pauseResponse) {
                sleep( pauseResponse.time )
            }


            console.log('PAYLOAD:', payload);
            console.log('MESSAGES:', this.messages);

            setTimeout(() => {
                this.SET_LAST_MESSAGE( { ...payload, date: message.date } );
                this.$nextTick(function () { this.scrollDown(800); });
                this.SET_LOADING( false )
                this.$root.$emit('receive', payload);
            }, 400);

            return payload
        },
        scrollDown(ms) {
            this.$nextTick(() => {
                VueScrollTo.scrollTo('.last-user-message', ms, this.$store.state.scrollOptions)
            })
        },
        checkScrollToBottom() {
            const scroller = document.getElementById('conversation-scroller')

            return scroller.clientHeight + scroller.scrollTop === Math.max(
                scroller.scrollHeight, scroller.scrollHeight,
                scroller.offsetHeight, scroller.offsetHeight,
                scroller.clientHeight, scroller.clientHeight
            );
        },
        scrollToBottom(ms) {
            if (!this.checkScrollToBottom()) {
                this.$nextTick(() => {
                    const bottom = document.getElementById('bottom')
                    VueScrollTo.scrollTo(bottom, ms, this.$store.state.scrollOptions)
                })
            }
        },
        authenticate() {
            if (process.env.VUE_APP_DEPLOY_SSO && !this.$msal.isAuthenticated()) {
                this.$msal.signIn()
            } else if (process.env.VUE_APP_DEPLOY_SSO) {
                this.$msal.signOut();
                this.SET_AZURE_TOKEN('')
            }
        },
    }
}
