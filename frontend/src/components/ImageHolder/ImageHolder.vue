<template>
  <div
    v-if="message.response_type ==='image'"
    class="image-holder">
    <div v-html="message.title" />
    <img
      v-if="message.source"
      :src="message.source"
      class="image-output">
    <div
      class="image-description"
      v-html="message.description" />
  </div>
</template>

<script>
export default {
    props: {
        message: { type: Object, default: null}
    }
}
</script>

<style scoped>

</style>