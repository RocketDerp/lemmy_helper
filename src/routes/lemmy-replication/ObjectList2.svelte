<script>
	export let items

  // if it is an array, grab the first element in array and use that as object
  function grabObjectKeysFirstRow(yourVariable) {
      // return { "test1": "value1", "test2": "value2" };
      if (Array.isArray(yourVariable)) {
          return yourVariable[0];
      } else {
          return yourVariable;
      }
  }
</script>

<table>
    <thead>
      <tr>
        {#each Object.keys(grabObjectKeysFirstRow(items)) as columnHeading}
          <th>{columnHeading}</th>
        {/each}
      <tr/>
    </thead>
    <tbody>
      <tr>
        {#each Object.values(items) as row}
          <td>{row}</td>
        {/each}
      </tr>
    </tbody>
  </table>
