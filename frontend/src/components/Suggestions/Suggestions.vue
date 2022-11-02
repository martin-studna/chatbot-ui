<template>
  <div
    v-if="message.response_type === 'suggestion'"
    class="suggestions"
    :style="{ display: buttons.length ? undefined : 'none'}">
    <template v-if="dropdown">
      <Dropdown
        :disabled="disabled"
        :items="buttons.map( button => button.label )" />
    </template>

    <template v-else>
      <Button
        v-for="(b, bk) in buttons"
        :key="bk"
        :disabled="disabled"
        :style="{cursor: disabled ? 'not-allowed' : 'pointer'}"
        @click="$emit('say', {label: b.label,...b.value})">
        {{ b.label }}
      </Button>
    </template>
  </div>
</template>

<script>
import Vue from 'vue';
import Button from '../Button/Button.vue';
import Dropdown from '../Dropdown/Dropdown.vue'
import GlobalFunctionsMixin from "../../mixins/GlobalFunctionsMixin";

export default Vue.extend({
    components: { Dropdown, Button },
    mixins: [ GlobalFunctionsMixin ],
    props: {
        message: {type: Object, default: null},
        disabled: {type: Boolean, default: null},
    },
    data() {
        return {
            theme: this.$parent.theme,
            isDisabled: false
        };
    },
    computed: {
        dropdown() {
            return this.buttons.length >= process.env.VUE_APP_DROPDOWN_THRESHOLD && process.env.VUE_APP_DROPDOWN
        },
        buttons() {
            let buttons = [];
            const { message } = this;
            buttons = message.suggestions
                .filter((x) => x.label.trim().length);
            return buttons;
        },
    },
});
</script>

<style scoped>
  .suggestions {
    margin-bottom: 1rem;
  }

  .suggestions button {
      margin-right: 5px;
  }

  .suggestions button:last-of-type {
      margin-right: 0;
  }
</style>
