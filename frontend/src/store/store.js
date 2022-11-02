import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        loading: false,
        messages: [],
        buttons: [],
        searchResults: [],
        isLatest: null,
        popupOpen: true,
        jsonWebToken: '',
        azureAccessToken: '',
        scrollOptions: {
            container: '#conversation-scroller',
            easing: 'ease',
            cancelable: false,
            offset: -15,
            x: false,
            y: true,
        }
    },
    mutations: {
        SET_LOADING(state, value) {
            state.loading = value
        },
        SET_SESSION_ID(state, sessionId) {
            state.sessionId = sessionId;
        },
        SET_BUTTONS( state, value ) {
            state.buttons = { ...value }
        },
        SET_SEARCH_RESULTS( state, value ) {
            state.searchResults = { ...value }
        },
        SET_MESSAGES( state, value ) {
            state.messages = [ ...value ]
        },
        SET_LAST_MESSAGE( state, value ) {
            state.messages[ state.messages.length - 1 ] = value
        },
        SET_POPUP_OPEN( state, value ) {
            state.popupOpen = value
        },
        PUSH_TO_MESSAGES( state, value ) {
            state.messages.push( value )
        },
        CLEAR_MESSAGES(state) {
            state.messages = []
        },
        IS_LATEST_MESSAGE(state, value) {
            state.isLatest = state.messages[ state.messages.length - 1 ] === value
        },
        SET_JSON_WEB_TOKEN(state, value) {
            state.jsonWebToken = value
        },
        SET_AZURE_TOKEN(state, value) {
            state.azureAccessToken = value
        }
    },
    getters: {
        lastMessageInput: state => {
            return state.messages[state.messages.length - 1].input.text
        },
        sessionId: state => state.sessionId
    }
});
