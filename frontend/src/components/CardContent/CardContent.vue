<template>
  <div
    :class="{'card': true, 'card__link': url }"
    @click="link">
    <div class="card__header-section">
      <div
        v-if="header"
        :style="{'margin-bottom': text ? '10px': '0', 'font-weight': 600, 'white-space': 'normal'}">
        {{ header }}
      </div>
      <img
        v-if="url"
        src="../../../assets/export.svg"
        alt="export">
    </div>
    <div
      v-if="text && text.length"
      :id="textKey"
      class="card__text"
      v-html="text[0]" />
    <button
      v-if="!url && text && text.length && text[0] !== null && text[0].length > 180"
      class="card__toggle-button"
      type="button"
      @click="toggle()">
      <span class="card__toggle-text">{{ toggleText }}</span>
      <img
        :src="toggleImage"
        alt="toggle-image">
    </button>
  </div>
</template>

<script>
export default {
    props: {
        text: { type: Array, default: null },
        title: { type: String, default: null },
        url: { type: String, default: null },
        textKey: { type: String, default: null },
    },

    data() {
        return {
            toggleText: 'Show More',
            toggleImage: require("../../../assets/show_more_arrow.svg"),
            more: false
        }
    },

    computed: {
        header() {
            return this.title?.replace(/[[\]'"]+/g,'')
        }
    },

    methods: {
        toggle() {
            if (!this.more) {
                this.more = true
                this.toggleText = 'Show less'
                this.toggleImage = require("../../../assets/show_less_arrow.svg")
                document.getElementById(this.textKey).classList.add('no-limit')
            }
            else {
                this.more = false
                this.toggleText = 'Show more'
                this.toggleImage = require("../../../assets/show_more_arrow.svg")
                document.getElementById(this.textKey).classList.remove('no-limit')
            }
        },
        link() {
            if (this.url) window.open(this.url, '_blank')
        }
    }
}
</script>

<style scoped>

  .card {
    box-shadow: var(--WatsonAssistantChat-CARD-box-shadow);
    border-radius: 5px;
    margin-bottom: 8px;
    width: 100%;
    height: 100%;

    padding: 16px;
    border: var(--WatsonAssistantChat-BASE-med-border-width) solid transparent;
  }

  .card__link {
    cursor: pointer;
  }

  

  .card__header-section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
  }


  .card__ticket-text {
    max-width: 370px;
    overflow: hidden;
    white-space: normal;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -moz-box-orient: vertical;
    -webkit-box-orient: vertical;
  }

  .card__url {
    max-width: 370px;
    margin-top: 10px; 
    font-size: 14px; 
    font-style: italic; 
    font-weight: 500;
    word-break: break-word;
  }

  .card__toggle-button {
    display: flex;
    justify-content: baseline;
    background: transparent;
    text-decoration: none;
    cursor: pointer;
    outline: none;
    border: none;
    margin-top: var(--WatsonAssistantChat-BASE-spacing-05);
  }

  .card__toggle-text {
    color: var(--WatsonAssistantChat-THEME-link-01);
    margin-right: var(--WatsonAssistantChat-BASE-spacing-03);

    
  }
  .card__toggle-text:hover {
    text-decoration: underline;
  }

  .card__link:hover {
    background: #e0e0e0;
  }

  .card__link:active {
    background: #8d8d8d;
    border: 3px solid var(--WatsonAssistantChat-THEME-link-01);
    box-shadow: none;
  }


  .no-limit {
    -webkit-line-clamp: 1000;
  }

  @media(max-width: 768px) {
    .card__text {
      max-width: 65vw
    }

    .card__url {
      max-width: 65vw;
    }
  }

</style>