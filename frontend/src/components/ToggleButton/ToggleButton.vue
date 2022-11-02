<template>
  <div>
    <Tooltip
      class="bouncy"
      @hide="setBouncing" />
    <div
      v-if="openChatButtonVisible"
      ref="chatbot__open-button-container"
      :class="{'chatbot__open-button-container': true, 'hvr-fade': true, bouncy: bouncing}"
      data-cy="chatbot__toggle-button"
      @click="show()">
      <div class="chatbot__open-button-inner-container ">
        <div
          class="chatbot__open-button">
          <img
            class="toggle__button-avatar-image"
            src="../../../assets/bowler_hat2.png"
            alt="alfred">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import {addPopup, removePopup} from "../../modules/misc";
import Tooltip from '../Tooltip/Tooltip.vue'

export default {
    components: {
        Tooltip
    },
    props: {
        showChatbot: {type: Function, default: null}
    },
    data() {
        return {
            openChatButtonVisible: true,
            bouncing: true
        }
    },
    computed: {
        ...mapState([
            'popupOpen'
        ])
    },
    methods: {
        showOpenChatButton() {
            this.openChatButtonVisible = true
            removePopup()
        },
        hideOpenChatButton() {
            this.openChatButtonVisible = false
            addPopup()
        },
        setBouncing() {
            this.bouncing = !this.bouncing
        },
        show() {
            this.showChatbot()
            this.hideByToggle = true
            setTimeout(() => {
                document.getElementById('textarea-bot').focus()
            }, 1);
        }
    }
}
</script>

<style src="./ToggleButton.css" scoped></style>
