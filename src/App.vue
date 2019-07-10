
<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Chickens</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <div
      class="error-note"
      :class="{active: !!noteText}"
      @click="setNote('')"
      :data-text="noteText"
    ></div>
    <input type="checkbox" id="MenuFlag" ref="flag" />
    <label id="MenuIcon" for="MenuFlag"></label>
    <nav id="MainMenu">
      <ul>
        <li @mousedown='goTo("/")'
          ><span class="material-icons">home</span> Home
        </li>
        <li @mousedown='goTo("logs")'
          ><span class="material-icons"
            >subject</span> Logs
        </li>
        <li @mousedown="goTo('invites')"
          ><span class="material-icons"
            >card_giftcard</span> Invites
        </li>
        <li @mousedown="goTo('users')"
          ><span class="material-icons"
            >recent_actors</span> Users
        </li>
      </ul>
    </nav>
    <header>{{ title }}</header>
    <transition appear name="fade">
      <router-view id="RouterView" @notify="setNote" />
    </transition>
  </div>
</template>

<style lang="scss" src="./assets/styles/app/_app.scss"></style>
<script lang='ts' src='./app.ts'></script>

