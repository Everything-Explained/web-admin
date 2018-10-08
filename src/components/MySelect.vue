
<template>
  <div class="msel-container" v-if="options.length">
    <label @click="toggle($event)"
           @blur="toggle($event)"
           :class="{active: isActive}"
      >{{ selectedIndex < 0 ? title : options[selectedIndex] }}
    </label>
    <ul class="my-select" v-if="!hidden">
      <li class='sel-item'
          v-for="(option,i) of options"
          :key="i"
          @click="select(i), $emit('select', option)"
        >{{ option }}
      </li>
    </ul>
  </div>
</template>



<script lang="ts" src="./myselect.ts"></script>
<style lang="scss" src='./_myselect.scss'></style>
