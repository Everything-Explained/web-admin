
<template>
  <div class="msel-container" v-if="options.length">
    <label @click="toggle($event)"
      :class="{active: isActive}"
    >{{ selectedIndex < 0 ? title : options[selectedIndex] }}
    </label>
    <ul class="my-select" :class="{ hidden: hidden }">
      <li class='sel-item'
          v-for="(option,i) of watchedOptions"
          :key="i"
          @click="select(i), $emit('select', option, i)"
        >{{ option }}
      </li>
    </ul>
  </div>
</template>



<script lang="ts" src="./_mySelect.ts"></script>
<style lang="scss" src='./_mySelect.scss'></style>
