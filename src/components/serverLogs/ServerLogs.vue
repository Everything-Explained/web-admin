<template>
  <ul class="log-tray">
    <li v-for='log of logs'
        :key='log.uid'
        :class="[{ open: log.open }, getLevel(log)]"
        class="log-item"
    >
      <div class="log-infobar"
           @click='toggle($event, log)'
      >
        <span class="timestamp large"
          >{{ log.time | dateTime('D/M => h:mm:ssa') }}
        </span>
        <span class="timestamp small"
          >{{ log.time | dateTime('h:mm:ssa') }}
        </span>
        <span class="ip"
          >{{ log.pid }}
        </span>
        <span class="message" :class="getLevel(log)">{{ log.msg}}</span>
      </div>
      <!-- <HttpLogDetails :log=log v-if="log.open"></HttpLogDetails> -->
    </li>
  </ul>
</template>

<script lang="ts" src="./_serverLogs.ts"></script>
<style lang="scss" src="./_serverLogs.scss"></style>