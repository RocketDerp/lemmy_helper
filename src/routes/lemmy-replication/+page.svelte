<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData

    import LemmyFetch from './LemmyFetch.svelte';
    import LemmyFetchCompare from './LemmyFetchCompare.svelte';
</script>

<h1>Lemmy-Helper replication comparison</h1>

<LemmyFetchCompare outServers={data} />
<br />

{#if 1==2}
<LemmyFetch outServer={data.outServer0} />
<br />
<LemmyFetch outServer={data.outServer1} />
{/if}

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
