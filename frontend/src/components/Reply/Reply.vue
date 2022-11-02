<template>
<div
  @mouseover="hover=true"
  @mouseleave="hover=false">
  <div class="bot-message__text_with_feedback">
    <div
      class="bot-message__text"
      v-html="
        message.title ||
          message.text" />
    <Feedback 
      v-if="hover == true && VUE_APP_FEEDBACK_ENABLED == 'true'"
      @feedback="((feedback) => submitFeedback(feedback, this.message))" /> 
  </div>
  <div 
    v-if="hover == true && VUE_APP_FEEDBACK_ENABLED == 'true'" 
    class="space_increasing"/>
  <div v-else class="space_decreasing"/>
</div>
</template>


<script>
import Vue from 'vue'
import Feedback from '../Feedback/Feedback.vue'
import GlobalFunctionsMixin from "../../mixins/GlobalFunctionsMixin";

export default Vue.extend({
    components: {
        Feedback
    },
    mixins: [ GlobalFunctionsMixin ],
    props: ['message'],
    data() {
        return {
            feedback: null,
            VUE_APP_FEEDBACK_ENABLED: process.env.VUE_APP_FEEDBACK_ENABLED,
            hover: false
        }
    }
});
</script>

<style src='./Reply.css' scoped></style>