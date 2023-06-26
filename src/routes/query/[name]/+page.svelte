<script lang="ts">
    import type { PageData } from './$types'

    export let data: PageData

    const rowCount = data.outRowsRaw.length;
</script>

<h2><a href="../">Home</a>. You are on Lemmy-Helper Query: <b>{data.queryName}</b></h2>

Database result row count: {rowCount}
 -- output format: {data.output}
 -- now: {data.serverResultTime}
 -- connect time: {data.timeConnect}
 -- query time: {data.timeQuery}
<br />

{#if data.errorCode > 0}
  Error code {data.errorCode} -- message: <tt>{data.errorMessage}</tt>
  <br />
{/if}

{#if rowCount > 0}

{#if data.output !== 'table'}
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
{/if}

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
