<template>
  <div class="chatbot-feedback-circleBase">
    <div
      class="chatbot-feedback-circle-up"
      type="button"
      @click="emitFeedback(+1)">
      <div class="chatbot-feedback-thumb">
        <svg
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="40 0 100 100" 
          version="1.1"
          width="14px" 
          height="14px">


          <g transform="scale(0.3) translate(200 0)">
            <rect
              id="rect815"
              style="opacity:0.98999999;fill-opacity:1;stroke:none;stroke-width:4.55701113;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;"
              width="89.848984"
              height="147.38742"
              x="172.54018"
              y="148.13771"
              ry="13.065676"
              rx="0" />
            <path
              style="fill-opacity:1;stroke:none;stroke-width:0.86537904px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
              d="M 61.121747,24.107864 C 62.265568,-17.946653 26.276503,13.075901 23.10277,23.78913 9.532008,69.598487 59.81025,99.69075 48.265225,124.53511 c -4.142868,8.91527 -95.156639,-9.26762 -97.746423,3.70118 -14.567885,72.95115 27.099872,151.80059 38.361461,158.28075 11.38983681,6.55393 164.764137,11.13963 172.757317,0.57502 9.62719,-12.72425 2.65778,-133.79472 2.65778,-133.79472 0,0 -22.92276,-12.74322 -30.91698,-35.18636 C 121.93649,85.988799 60.150942,59.80121 61.121747,24.107864 Z" />
          </g>
        </svg>
      </div>
    </div>
    <div
      class="chatbot-feedback-circle-down"
      type="button"
      @click="emitFeedback(-1)">
      <div class="chatbot-feedback-thumb">
        <svg
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 100 100" 
          version="1.1"
          width="14px" 
          height="14px">


          <g transform="scale(-0.3) translate(-260 -330)">
            <rect
              id="rect815"
              style="opacity:0.98999999;fill-opacity:1;stroke:none;stroke-width:4.55701113;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;"
              width="89.848984"
              height="147.38742"
              x="172.54018"
              y="148.13771"
              ry="13.065676"
              rx="0" />
            <path
              style="fill-opacity:1;stroke:none;stroke-width:0.86537904px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
              d="M 61.121747,24.107864 C 62.265568,-17.946653 26.276503,13.075901 23.10277,23.78913 9.532008,69.598487 59.81025,99.69075 48.265225,124.53511 c -4.142868,8.91527 -95.156639,-9.26762 -97.746423,3.70118 -14.567885,72.95115 27.099872,151.80059 38.361461,158.28075 11.38983681,6.55393 164.764137,11.13963 172.757317,0.57502 9.62719,-12.72425 2.65778,-133.79472 2.65778,-133.79472 0,0 -22.92276,-12.74322 -30.91698,-35.18636 C 121.93649,85.988799 60.150942,59.80121 61.121747,24.107864 Z" />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>


<script>
export default {
    data() {
        return {
            feedback: null
        }
    },
    methods: {
        emitFeedback(k) {
            if (k === -1){
                this.feedback = -1;
                this.$emit('feedback', this.feedback);
                console.log('feedback = ', this.feedback);
            } else {
                this.feedback = 1;
                this.$emit('feedback', this.feedback);
                console.log('feedback = ', this.feedback);
            }
        }
    }
}
</script>


<style src='./Feedback.css' scoped>

</style>