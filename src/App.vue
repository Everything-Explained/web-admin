<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Chickens</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <div class="error-note" :class="{active: !!noteText}" :data-text="noteText"></div>
    <input type="checkbox" id="MenuFlag" ref="flag" />
    <label id="MenuIcon" for="MenuFlag"></label>
    <nav id="MainMenu">
      <ul>
        <li @mousedown='goTo("/")'><span class="material-icons">home</span> Home</li>
        <li @mousedown='goTo("logs")'><span class="material-icons">subject</span> Logs</li>
        <li><span class="material-icons">card_giftcard</span> Invites</li>
        <li><span class="material-icons">recent_actors</span> Users</li>
      </ul>
    </nav>

    <header>
    </header>

    <router-view id="RouterView" @notify="setNote" />
  </div>
</template>

<style lang="scss" src="./assets/styles/app/_app.scss"></style>
<script lang='ts' src='./app.ts'></script>

