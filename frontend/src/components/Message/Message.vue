<template>
  <BubbleRight
    v-if="payload.author !== 'bot'"
    :bg-color="theme.user[1]"
    :style="{ 'max-width': '85%', margin: '8px 0', color: theme.user[0] }">
    {{ payload.input.text }}
  </BubbleRight>
  <BubbleLeft
    v-else
    :bg-color="theme.bot[1]"
    :style="{ flex: '1 1 auto', margin: '8px 0', color: theme.bot[0] }">
    <div
      v-html="
        payload.output && payload.output.text
          ? payload.output.text.filter(x => x.trim().length)
          : ''" />
  </BubbleLeft>
</template>

<style>
.message {
  max-width: 85%;
}
.message.bot {
  align-self: flex-start;
}
</style>

<script>
import Vue from 'vue';
import BubbleLeft from './BubbleLeft/BubbleLeft.vue';
import BubbleRight from './BubbleRight/BubbleRight.vue';

export default Vue.extend({
    components: { BubbleLeft, BubbleRight },
    data() {
        return {
            theme: this.$parent.theme,
        };
    },
    computed: {},
    mounted() {},
    methods: {},
});
</script>
