<template>
  <div class="logs">
    <div class="container">
      <div class="log">
        <ul class="log-tray">
          <li v-for='log in logs'
              :key='log.uid'
              :class='getLevel(log)'
              class="log-item"
          >
            <span class="timestamp">{{ formatDate(log.time) }}</span>
            <span class="ip">{{log.identity}}</span>
            <span class="method">{{ getMethod(log) }}</span>
            <span class="message">{{ log.msg.replace(getMethod(log), '').trim() }}</span>
          </li>
          <!-- <li class="log-item default">
            <span class="timestamp">8/10/2018 4:53 PM</span>
            <span class="ip">255.255.255.255</span>
            <span class="method">GET</span>
            <span class="message">/robots.txt</span>
          </li> -->
        </ul>
      </div>
    </div>
  </div>
</template>


<script lang="ts" src="./logs.ts"></script>
<style lang="scss" src="./_logs.scss"></style>
