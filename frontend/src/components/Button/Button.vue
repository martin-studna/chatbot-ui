<template>
  <button
    :class="{button: true, 'hvr-fade': true, 'color-clicked': clicked}"
    @click="$emit('click') && setClicked()">
    <slot />
  </button>
</template>

<script>
import Vue from 'vue';
import GlobalFunctionsMixin from "../../mixins/GlobalFunctionsMixin";

export default Vue.extend({
    mixins: [ GlobalFunctionsMixin ],
    data() {
        return {
            theme: this.$parent.theme,
            clicked: false
        };
    },

    methods: {
        setClicked() {
            document.getElementById('textarea-bot').focus()
            this.clicked = true
        }
    }
});
</script>

<style scoped lang="scss">
  .button {
    padding: 7px 10px;
    border-radius: 15px;
    border: none;
    outline: none;
    text-align: left;
    margin: 3px;
    margin-bottom: 5px;
    font-size: var(--button-font-size);
    background-color: var(--button-color);
    color: white;
  }

  .button:hover {
      background: var(--button-color-hover);
      color: var(--button-text-color);
    }

  .button:disabled {
    opacity: 0.65;
    background: var(--button-color);
  }

  .color-clicked {
    background-color: var(--button-color-hover) !important;
  }
</style>
