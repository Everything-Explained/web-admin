<template>
  <div class="logs">
    <div class="container">
      <div class="log">
        <ul class="log-tray">

          <li v-for='log in logs'
              :key='log.uid'
              :class="[{ 'has-count': log.hasChildren }, getLevel(log)]"
              class="log-item">
            <div class="log-container open">
              <aside class="toggle" @click='toggle($event, log)'></aside>
              <span class="timestamp large">
                {{ formatDate(log.time, 'D/M => h:mm:ssa') }}
              </span>
              <span class="timestamp small">
                {{ formatDate(log.time, 'h:mm:ssa') }}
              </span>
              <span class="ip" v-if="!log.err">
                {{log.identity == '127.0.0.1' ? 'Aedaeum' : log.identity}}
              </span>
              <span class="method" v-if="!log.err">{{ getMethod(log) }}</span>
              <span class="message">{{ log.msg.replace(getMethod(log), '').trim() }}</span>
              <span class="count"
                    :class="getLevel(log)"
                    v-if="log.hasChildren">
                {{ log.children.length }}
              </span>
            </div>
            <div class="log-container" v-if="!log.err" :class="{ open: log.open }">
              <dl class="log-data">
                <dd>{{ log.uid }}</dd>
                <dd>{{ log.identity }}</dd>
                <dd v-if="log.browser">{{ log.browser }}</dd>
              </dl>
            </div>
            <div class="log-container" :class="{ open: log.open }">
              <pre v-if="log.err"
                   class="stack-container child-log-list">
                <span class="stack">{{ log.err.stack }}</span>
              </pre>
              <ul v-if="log.hasChildren"
                  class="child-log-list">
                <li v-for="clog of log.children"
                    :key="clog.uid"
                    class="log-child"
                    :class="getLevel(clog)">
                  <span class="timestamp large">
                    {{ formatDate(clog.time, 'D/M => h:mm:ssa') }}
                  </span>
                  <span class="timestamp small">
                    {{ formatDate(clog.time, 'h:mm:ssa') }}
                  </span>
                  <span class="method">{{ getMethod(clog) }}</span>
                  <span class="message">{{ clog.path || clog.msg }}</span>
                </li>
              </ul>
            </div>
          </li>

        </ul>
      </div>
    </div>
  </div>
</template>


<script lang="ts" src="./logs.ts"></script>
<style lang="scss" src="./_logs.scss"></style>
