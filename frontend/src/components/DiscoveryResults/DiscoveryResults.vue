<template>
  <div
    v-if="message.response_type === 'search'"
    class="discovery">
    <div
      v-if="message.header"
      class="discovery__header">
      {{ message.header }}
    </div>
    <div>
      <template
        v-for="(r, rk) in message.results">
        <CardContent
          v-if="(r.title || r.highlight.answer) && rk <= 2"
          :key="rk"
          :text-key="rk + 't'"
          :title="r.title"
          :url="r.url"
          :text="r.highlight.answer" />
      </template>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import GlobalFunctionsMixin from '../../mixins/GlobalFunctionsMixin'
import CardContent from '../CardContent/CardContent'

export default Vue.extend({
    components: { CardContent},
    mixins: [GlobalFunctionsMixin],
    props: {
        message: { type: Object, default: null },
    },
    data() {
        return {
            theme: this.$parent.theme,
        }
    },
    mounted() {
 
    },
});
</script>

<style scoped>

  .discovery__header {
    background: #ebebeb ;
    padding: 9px 12px;
    border-radius: 8px;
    margin-bottom: 0.7rem;
    white-space: pre-wrap;
  }
</style>
