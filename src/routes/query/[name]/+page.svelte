<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData
</script>

<h1>Lemmy-Helper Query: {data.queryName}</h1>

Database result row count: {data.outRowsRaw.length}

<pre>
    {data.outRows}
</pre>

<hr />

<nl>
{#each data.outRowsRaw as singleRow}
    <li><pre>{JSON.stringify(singleRow)}</pre></li>
{/each}
</nl>

<hr />

<table>
  <thead>
    <tr>
      {#each Object.keys(data.outRowsRaw[0]) as columnHeading}
        <th>{columnHeading}</th>
      {/each}
    <tr/>
  </thead>

  <tbody>
    {#each Object.values(data.outRowsRaw) as row}
      <tr>
        {#each Object.values(row) as cell}
          <td>{cell}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>


<style>
    table, th, td {
      border: 1px solid;
      border-collapse: collapse;
      margin: 10px;
    }
</style>
