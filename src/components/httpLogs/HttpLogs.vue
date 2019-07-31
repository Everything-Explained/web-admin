<template>
  <ul class="log-tray">
    <li
      v-for='log of logs'
      :key='log.uid'
      :class="[{ 'has-count': log.children.length, open: log.open }, getLevel(log)]"
      class="log-item"
    >
      <div class="log-infobar"
        @click='toggle($event, log)'
      >
        <span class="timestamp large"
          >{{ log.date | dateTime }}
        </span>
        <span class="timestamp small"
          >{{ log.date | timeOnly }}
        </span>
        <span class="ip"
          >{{ log.identity || normalizeAddress(log.address) }}
        </span>
        <span class="method">{{ log.type }}</span>
        <span
            class="message"
            :class="log.level"
          >{{ log.req.url.replace(/\?.+$/, '') }}
        </span>
        <span class="log-count"
              :class="log.level"
              v-if="log.requests > 1 || log.children.length"
          >{{ getRequestCount(log) }}
        </span>
      </div>
      <HttpLogDetails :log=log v-if="log.open"></HttpLogDetails>
    </li>
  </ul>
</template>


<script lang="ts" src="./_httpLogs.ts"></script>
<style lang="scss" src="./_httpLogs.scss"></style>

