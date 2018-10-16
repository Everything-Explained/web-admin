<template>

<div class="log-display">
  <div class="log-controls">
    <MySelect :options="files" :title="selectTitle" @select="selectFile"></MySelect>
    <StatDisplay v-if="logs.length" class="log-stat log-stat-count" :title="'Log Count'" :display="rawLogLength"></StatDisplay>
    <StatDisplay v-if="logs.length" class="log-stat log-stat-lines" :title="'Lines'" :display="logLines"></StatDisplay>
  </div>
  <div class="log-scroll"
       :class="{watermark: logs.length == 0}"
       data-text="Empty or Unselected File"
  >
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
          <span class="method">{{ log.type }}</span>
          <span class="message" :class="getLevel(log)">{{ getMessage(log) }}</span>
          <span class="log-count"
                :class="getLevel(log)"
                v-if="log.requests > 1 || log.children.length"
            >{{ getRequestCount(log) }}
          </span>
        </div>
        <LogDetails :log=log></LogDetails>
      </li>

    </ul>
  </div>
  <div class="log-controls">
    <button class="standard"
            :disabled="!selectedLog || selectedLog != 'requests.log'"
            @click="togglePollLogs(selectedLog)"
      > {{ logPollInterval ? 'Stop Polling' : 'Start Polling' }}
    </button>
    <button class="dangerous"
            @click="clearFile(selectedLog)"
            :disabled="!selectedLog"
      >clear
    </button>
    <StatDisplay v-if="logs.length" class="log-stat log-stat-count" :title="'Render'" :display="renderPerf"></StatDisplay>
    <StatDisplay v-if="logs.length" class="log-stat log-stat-lines" :title="'Request'" :display="requestPerf"></StatDisplay>
  </div>
</div>


</template>


<script lang="ts" src="./_logs.ts"></script>
<style lang="scss" src="./_logs.scss"></style>
