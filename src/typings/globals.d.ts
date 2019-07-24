import Vue from 'vue';



declare module "vue/types/vue" {
  interface Vue {
    readonly $apiURI: string;
  }
}