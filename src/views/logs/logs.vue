<template>
  <div class="logs">
    <div class="container">
      <div class="log">
        <ul class="log-tray">
          <li class="log-item default">
            <span class="timestamp">8/10/2018 4:53 PM</span>
            <span class="ip">255.255.255.255</span>
            <span class="method">GET</span>
            <span class="message">/robots.txt</span>
          </li>
          <li class="log-item warn">
            <span class="timestamp">10/11/2018 12:32 PM</span>
            <span class="ip">43.13.123.3</span>
            <span class="method">GET</span>
            <span class="message">Direct Connection Denied</span>
          </li>
          <li class="log-item good">
            <span class="timestamp">8/25/2018 1:07 PM</span>
            <span class="ip">78.221.220.3</span>
            <span class="method">DELETE</span>
            <span class="message">Deleted an Invite</span>
          </li>
          <li class="log-item error">
            <span class="timestamp">1/5/2018 7:11 PM</span>
            <span class="ip">83.2.31.89</span>
            <span class="method">DELETE</span>
            <span class="message">Invalid Exception Occurred</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script lang="ts" src="./logs.ts"></script>
<style lang="scss" src="./_logs.scss"></style>
