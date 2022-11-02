<template>
  <div class="dropdown-wrapper">
    <v-select
      ref="dropdown"
      v-model="selected"
      :class="{disabled: disabled}"
      :options="items"
      :clearable="false"
      :searchable="false"
      placeholder="Select an option"
      @input="send"
      @search:focus="scrollToBottom(50)" />
  </div>
</template>

<script>
import 'vue-select/dist/vue-select.css';
import VueScrollTo from 'vue-scrollto'
import GlobalFunctionsMixin from "../../mixins/GlobalFunctionsMixin";
import { mapState } from "vuex";
  
export default {
    name: "Dropdown",
    mixins: [ GlobalFunctionsMixin ],
    props: {
        items: {
            type: Array,
            default: null
        },
        disabled: { type: Boolean, default: null}
    },
    data() {
        return {
            selected: '',
            isSelected: false,
        }
    },
    computed: {
        ...mapState(['scrollOptions'])
    },
    methods: {
        send( value ) {
            this.isSelected = true
            this.selected = value
            document.getElementById('textarea-bot').focus()
            this.say(value)
        },
        scrollToBottom(ms) {
            this.$nextTick(() => {
                const bottom = document.getElementById('bottom')
                VueScrollTo.scrollTo(bottom, ms, this.scrollOptions)
            })
        }
    }
}
</script>

<style scoped>
  .dropdown-wrapper:focus {
     outline: var(--main-color) solid 2px;
  }
</style>

<style>

  .v-select,
  .v-select *,
  .v-select *::before,
  .v-select *::after {
    box-sizing: border-box !important;
  }

  .v-select ul {
    padding: 0 !important;
  }

  .vs__dropdown-toggle {
    background: rgb(235, 235, 235);
    border: none;
    border-radius: 8px;
    padding: 10px;
    text-align: left;
    padding-left: 5px;
  }

  .vs--open .vs__dropdown-toggle {
    border: 2px var(--main-color) solid;
  }

  .vs__selected-options {
    padding: 0px;
  }

  .vs__dropdown-toggle:focus {
    outline: var(--main-color) solid 2px;
  }

  .vs__dropdown-menu {
    position: relative;
    padding: 0;
    border-width: 2px;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  .vs__dropdown-option--highlight {
    background: var(--main-color);
    color: white !important;
  }

  .vs__dropdown-option {
    padding: 6px;
    padding-left: 12px;
    border-bottom: 1px #f4f4f4 solid;
  }

  .vs__dropdown-option:last-child {
    border-bottom: none;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  .disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.65;
  }

</style>