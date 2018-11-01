import { createDecorator } from 'vue-class-component';


export const NoCache = createDecorator((options, key) => {
  const computed: any = options.computed[key];
  computed.cache = false;
});

