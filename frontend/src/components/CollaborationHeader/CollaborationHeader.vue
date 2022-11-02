<template>
  <div class="collaboration-header">
    <h3>In collaboration with</h3>
    <img
      alt="collaborator-logo"
      class="collaborator-logo"
      src="../../../assets/collaborator_logo_big.svg"
      width="150px">
    <span class="separator"> | </span>
    <img
      alt="ibm-logo"
      class="ibm-logo"
      src="../../../assets/ibm-logo.svg"
      width="40px">
    <span class="separator"> | </span>
    <img
      alt="ibm-logo"
      class="ibm-logo"
      src="../../../assets/ibm_logo.png"
      width="40px">
  </div>
</template>

<script>
export default {
    name: "CollaborationHeader"
}
</script>

<style scoped lang="scss">
	.collaboration-header {
		align-items: center;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        margin-left: 15px;
        margin-right: 20px;
        -webkit-box-align: center;
        -ms-flex-align: center;
        place-content: space-between;
        align-items: center;

        .separator {
          color: #cecece;
        }

		h3 {
			font-weight: bold;
			font-size: 15px;
		}
	}
</style>