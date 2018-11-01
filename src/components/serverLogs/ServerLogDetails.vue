<template>



  <div class="log-details-container">

    <div class="log-flow-control">
      <div class="log-data log-flow--row" v-if="log.data">
          <div class="inline-data" v-for="(val, key, i) in log.data" :key="i">
            <span class="data-title bracket" :data-key="key">[</span>
            <span>{{val}}</span>
            <span class="bracket">]</span>
        </div>
      </div>
    </div>

    <pre v-if="log.err"
         class="log-stack-container child-log-list"
      ><div class="log-stack">{{ $parent.filterStack(log.err.stack) }}</div>
    </pre>

  </div>



</template>





<script lang='ts' src='./_serverLogDetails.ts'></script>
