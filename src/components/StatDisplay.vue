<template>


<div class="stat-display">
  <label class="title">{{ title }}</label>
  <div class="display">{{ display }}</div>
</div>


</template>



<script lang='ts'>
import Component from 'vue-class-component';
import Vue from 'vue';
@Component({
  props: {
    title: {
      type: String,
      required: true,
    },
    display: {
      required: true,
    }
  }
})
export default class extends Vue {}
</script>
<style lang='scss' src='./_statDisplay.scss'></style>
