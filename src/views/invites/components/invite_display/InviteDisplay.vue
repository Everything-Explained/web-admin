<template>
  <div class="invite-list">
    <div class="inv-header">
      <div>Code</div>
      <div>Used</div>
      <div>Uses</div>
    </div>
    <div class="invite" v-for="(invite, i) of renderedInvites" :key="i">
      <div
        class="copied-overlay"
        :class="{ active: invite.copied }"
      >COPIED</div>
      <div
        class="delete inv-item inv-del material-icons"
        @dblclick="deleteInvite(invite.code)"
      >delete_forever</div>
      <div class="code inv-item">{{ invite.code }}</div>
      <div class="inv-used inv-item">{{ invite.used }}</div>
      <div class="inv-uses inv-item">{{ invite.uses }}</div>
      <div
        class="inv-copy material-icons"
        @click="copyInvite(invite)"
      >event_available</div>
    </div>
  </div>
</template>

<script lang="ts" src="./_inviteDisplay.ts"></script>
<style lang="scss" src="./_inviteDisplay.scss"></style>