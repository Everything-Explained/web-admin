
<template>
  <div class="invites">
    <div class="invite-controls">
      <label class="page generate-invite">{{ invite || 'GENERATE' }}</label>
      <MySelect
        class="uses"
        :options="selectUses"
        :title="'Uses'"
        @select="onUsesSelect"
      ></MySelect>
      <MySelect
        class="days"
        :options="selectDays"
        :title="'Days'"
        @select="onDaySelect"
      ></MySelect>
      <div class="button-control">
        <button
          class="standard"
          @click="generateInvite"
          :disabled="!canGenerate"
        >Generate</button>
        <button
          class="permanent"
          :disabled="!canSave"
          @click="execInvite"
        >Save</button>
      </div>
    </div>
  </div>
</template>


<script lang="ts"   src="./_invites.ts"></script>
<style  lang="scss" src="./_invites.scss"></style>



