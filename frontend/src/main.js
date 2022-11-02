import Vue from 'vue';
import App from './App.vue';
import VueScrollTo from "vue-scrollto";
import { store } from './store/store';
import vSelect from "vue-select";
import VTooltip from 'v-tooltip'

Vue.use(VTooltip);

Vue.component("v-select", vSelect);

require('./_variables.css');
require('./normalize.css')


Vue.config.productionTip = false;

Vue.use(VueScrollTo);

/* new Vue({
    store,
    render: h => h(App)
}).$mount("#app"); */


let watsonChatWindowElement = document.createElement('div');
document.body.appendChild(watsonChatWindowElement);
setTimeout(function() {
    let watsonChatWindowComponent = new Vue({
        store,
        render: h => h(App),
    }).$mount(watsonChatWindowElement);

    window.watsonChatWindow = {
        watsonChatWindowElement,
        watsonChatWindowComponent,
        show () { watsonChatWindowComponent.$children[0].showChatbot() },
        hide () { watsonChatWindowComponent.$children[0].hideChatbot() },
        showButton () { watsonChatWindowComponent.$children[0].showOpenChatButton() },
        hideButton () { watsonChatWindowComponent.$children[0].hideOpenChatButton() }
    }

    watsonChatWindowComponent.$on('send', function ( payload ) {
        if (window.watsonChatWindowEvents && window.watsonChatWindowEvents.onSend) {
            window.watsonChatWindowEvents.onSend(payload)
        }
    })
    watsonChatWindowComponent.$on('receive', function ( payload ) {
        if (window.watsonChatWindowEvents && window.watsonChatWindowEvents.onReceive) {
            window.watsonChatWindowEvents.onReceive(payload)
        }
    })

    if (window.location.hash.indexOf('chat-open') != -1) {
        window.watsonChatWindow.show();
    }
}, 1)
