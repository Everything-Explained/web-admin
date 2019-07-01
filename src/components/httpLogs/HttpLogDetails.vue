<template>
  <div class="log-details-container">

    <div class="table log-details">
      <!-- <div class="tr">
        <div class="cell">Date =></div>
        <div class="cell">{{ log.time | dateTime('MMMM Mo, YYYY') }}</div>
      </div> -->
      <div class="tr">
        <div class="cell">UID =></div>
        <div class="cell">{{ log.id }}</div>
      </div>
      <div class="tr">
        <div class="cell ident">Identity =></div>
        <div class="cell">{{ log.identity || log.address }}</div>
      </div>
      <div class="tr">
        <div class="cell">Agent =></div>
        <div class="cell">{{ log.agent }}</div>
      </div>
      <div class="tr">
        <div class="cell">Requests =></div>
        <div class="cell">{{ log.requests }}</div>
      </div>
    </div>

    <div class="log-flow-control log-flow--row">
      <div class="table log-data" v-if="log.data">
        <div class="tr" v-for="(val, key, i) in log.data" :key="i">
          <div class="cell">
            <span class="data-title bracket" :data-key="key">[</span>
            <span>{{val}}</span>
            <span class="bracket">]</span>
          </div>
        </div>
      </div>

      <div class="log-map-container" v-if="log.req.status">
        <div class="log-map" :class="getStatusColor(log)">{{ log.req.method }}</div>
        <div class="log-map" :class="getStatusColor(log)">{{ log.req.url }}
        </div>
        <div class="log-map" :class="getStatusColor(log)">{{ log.req.status }}</div>
      </div>
    </div>

    <pre v-if="log.err"
      class="log-stack-container child-log-list"
    ><div class="log-stack">{{ $parent.filterStack(log.err.stack) }}</div>
    </pre>


    <ul v-if="log.children.length" class="child-log-list">
      <li class="child-log"
          v-for="clog of log.children"
          :key="clog.uid"
          :class="$parent.getLevel(clog)"
      >
        <span class="timestamp large">
          {{ clog.date | dateTime('D/M => h:mm:ssa') }}
        </span>
        <span class="timestamp small">
          {{ clog.date | dateTime('h:mm:ssa') }}
        </span>
        <span class="method">{{ clog.kind }}</span>
        <span class="message" :class="$parent.getLevel(clog)">{{ clog.req.url }}</span>
        <span class="child-count"
              v-if="clog.children.length">
          {{ clog.children.length }}
        </span>
      </li>
    </ul>


  </div>

</template>

<script lang='ts' src='./_httpLogDetails.ts'></script>
<style lang='scss' src='./_httpLogDetails.scss'></style>

