<template>
  <div class="loading-bubble">
    <ChatbotAvatar />
    <div
      class="wave">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </div>
  </div>
</template>

<script>
import ChatbotAvatar from "../ChatbotAvatar/ChatbotAvatar";

export default {
    name: "LoadingBubble",
    components: { ChatbotAvatar }
}
</script>

<style scoped src="./LoadingBubble.css">

</style>