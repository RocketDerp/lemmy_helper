<script>
    import ObjectList2 from "./ObjectList2.svelte"
    export let items

    function isObject(yourVariable) {
        if (yourVariable == null) {
            return false;
        }
        if (yourVariable == undefined) {
            return false;
        }
        if (
            typeof yourVariable === 'object' &&
            !Array.isArray(yourVariable) &&
            yourVariable !== null
        ) {
            return true;
        }
        return false;
    }

    // if it is an array, grab the first element in array and use that as object
    function grabObjectKeysFirstRow(yourVariable) {
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
      {#each Object.values(items) as row}
        <tr>
          {#each Object.values(row) as cell}
              {#if isObject(cell)}
                  <td>
                    <ObjectList2 items={cell} />
                  </td>
              {:else}
                  <td>{cell}</td>
              {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  
  