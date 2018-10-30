<template>
  <ul class="log-tray">
    <li v-for='log of logs'
        :key='log.uid'
        :class="[{ 'has-count': log.children, open: log.open }, getLevel(log)]"
        class="log-item"
    >
      <div class="log-infobar"
            @click='toggle($event, log)'>
        <span class="timestamp large"
          >{{ log.time | dateTime('D/M => h:mm:ssa') }}
        </span>
        <span class="timestamp small"
          >{{ log.time | dateTime('h:mm:ssa') }}
        </span>
        <span class="ip"
          >{{log.identity == '127.0.0.1' ? 'localhost' : log.identity}}
        </span>
        <span class="method">{{ log.kind }}</span>
        <span class="message" :class="getLevel(log)">{{ getMessage(log) }}</span>
        <span class="log-count"
              :class="getLevel(log)"
              v-if="log.requests > 1 || log.children.length"
          >{{ getRequestCount(log) }}
        </span>
      </div>
      <HttpLogDetails :log=log v-if="log.open"></HttpLogDetails>
    </li>
  </ul>
</template>


<script lang="ts" src="./_httpLogs.ts"></script>
<script lang="scss" src="./_httpLogs.scss"></script>

