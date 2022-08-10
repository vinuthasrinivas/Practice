<template>
  <v-app>
    <v-main>
      <JobsNew></JobsNew>
    </v-main>
  </v-app>
</template>

<script>
import JobsNew from './components/JobsNew.vue'

export default {
  name: 'App',

  components: {
    JobsNew,
  },

  data: () => ({
    //
  }),
}
</script>
