<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData
</script>

<h1>Lemmy-Helper Query: {data.queryName}</h1>

output goes here

<pre>
    {data.outRows}
</pre>

<nl>
{#each data.outRowsRaw as singleRow}
    <li><pre>{JSON.stringify(singleRow)}</pre></li>
{/each}
</nl>
