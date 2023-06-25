<script>
	import ObjectList from "./ObjectList.svelte"
	export let outServer

	const rowCount = outServer.json.posts.length;
</script>

Database result row count: {rowCount}


<hr />


{#if rowCount > 0}

 -- connect time: {outServer.timeConnect} -- parse time: {outServer.timeParse}

{#if outServer.output !== 'table'}
	<pre>
		{outServer.json}
	</pre>
{/if}

<hr />

<ObjectList items={outServer.json.posts} />

{/if}
<style>
</style>
