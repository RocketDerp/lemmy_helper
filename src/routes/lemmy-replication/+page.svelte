<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData

    import LemmyFetch from './LemmyFetch.svelte';
</script>

<h1>Lemmy-Helper replication comparison</h1>

<LemmyFetch outServer={data.outServer0} />

<LemmyFetch outServer={data.outServer1} />


<style>
    table, th, td {
      border: 1px solid;
      border-collapse: collapse;
      margin: 10px;
    }

    td, th {
      padding: 3px 3px;
    }
</style>
