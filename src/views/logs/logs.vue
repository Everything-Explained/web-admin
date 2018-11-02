<template>

<div class="log-display">
  <div class="log-controls">
    <MySelect :title="'Select Log Type'"
              :options="selectTypeOptions"
              @select="selectLogType"
    ></MySelect>
    <MySelect v-if="selectedLogType"
              :title="'Select a Log'"
              :options="selectedLogOptions"
              @select="selectLogFile"
    ></MySelect>
    <StatDisplay class="log-stat log-stat-lines" :title="'Log Count'" :display="logLength"></StatDisplay>
    <StatDisplay class="log-stat log-stat-lines" :title="'Lines'" :display="logLines"></StatDisplay>
  </div>
  <div class="log-scroll"
       :class="{watermark: logLength == 0}"
       data-text="Empty or Unselected File"
  >
    <HttpLogs v-if="selectedLogType == getLogType('HTTP')"
              :selectedLog="selectedLog"
              @updated="logUpdated"
    ></HttpLogs>
    <ServerLogs v-if="selectedLogType == getLogType('SERVER')"
                :selectedLog="selectedLog"
                @updated="logUpdated"
    ></ServerLogs>
  </div>
  <div class="log-controls">
    <button class="standard"
            :disabled="!selectedLog.name || !!~selectedLog.name.indexOf('.log.')"
            @click="togglePollLogs(selectedLog)"
      >{{ logPollInterval ? 'Stop Polling' : 'Start Polling' }}
    </button>
    <button class="dangerous"
            @click="eraseFile(selectedLog.name)"
            :disabled="!selectedLog.name"
      >clear
    </button>
    <StatDisplay class="log-stat log-stat-count" :title="'Total'" :display="logPerf"></StatDisplay>
    <StatDisplay class="log-stat log-stat-count" :title="'Render'" :display="renderPerf"></StatDisplay>
    <StatDisplay class="log-stat log-stat-count" :title="'Filter'" :display="filterPerf"></StatDisplay>
    <StatDisplay class="log-stat log-stat-count" :title="'Request'" :display="requestPerf"></StatDisplay>
  </div>
</div>


</template>


<script lang="ts" src="./_logs.ts"></script>
<style lang="scss" src="./_logs.scss"></style>
