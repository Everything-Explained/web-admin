<template>
  <div class="log-display">
    <MySelect :options="files" :title="selectTitle" @select="selectFile"></MySelect>
    <div class="log-scroll">
      <ul class="log-tray">
        <li v-for='log of logs'
            :key='log.uid'
            :class="[{ 'has-count': log.children, open: log.open }, getLevel(log)]"
            class="log-item"
        >
          <div class="log-infobar"
               @click='toggle($event, log)'>
            <span class="timestamp large">
              {{ log.time | dateTime('D/M => h:mm:ssa') }}
            </span>
            <span class="timestamp small">
              {{ log.time | dateTime('h:mm:ssa') }}
            </span>
            <span class="ip">
              {{log.identity == '127.0.0.1' ? 'localhost' : log.identity}}
            </span>
            <span class="method">{{ getLogType(log) }}</span>
            <span class="message" :class="getLevel(log)">{{ getMessage(log) }}</span>
            <span class="log-count"
                  :class="getLevel(log)"
                  v-if="log.requests > 1 || log.children.length">
              {{ getRequestCount(log) }}
            </span>
          </div>
          <LogDetails :log=log></LogDetails>
        </li>

      </ul>
    </div>
  </div>
</template>


<script lang="ts" src="./logs.ts"></script>
<style lang="scss" src="./_logs.scss"></style>
