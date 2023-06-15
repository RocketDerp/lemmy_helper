<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData
</script>

<h1>Lemmy-Helper Query: {data.queryName}</h1>

output goes here

<pre>
    {data.outrows}
</pre>
