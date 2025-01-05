# @derek46518/table-sort

`@derek46518/table-sort` is a lightweight and efficient library for sorting HTML table content. It supports sorting by text, numbers, and dates and provides a customizable and interactive user experience.

## Features

- **Easy Integration**: Quickly integrate sorting functionality into your HTML tables.
- **Customizable Sorting**: Supports sorting by text, numbers, and dates.
- **Interactive User Experience**: Includes indicators for sorting directions.
- **Cross-Browser Compatibility**: Works seamlessly on all modern browsers.

## Installation

Install the package via npm:

```bash
npm i install @derek46518/table-sort -D
```
## Usage 
1. **Include the script in your HTML**
```bash
<script src="node_modules/@derek46518/table-sort/dist/tableSort.min.js" defer></script>
```
2. **Create an HTML table**
   Design your HTML table and assign the class `table-sortable`. This enables sorting functionality for the table. You can also add `data-sort-method` attributes to customize the sorting behavior for each column (e.g., `string`, `number`, or `date`).
   ```bash
   <table class="table-sortable">
    <thead>
        <tr>
            <th data-sort-method="string">Name</th>
            <th data-sort-method="number">Age</th>
            <th data-sort-method="date">Date of Birth</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John Doe</td>
            <td>25</td>
            <td data-sort="2023-01-15">15 Jan 2023</td>
        </tr>
        <tr>
            <td>Jane Smith</td>
            <td>30</td>
            <td data-sort="2022-05-10">10 May 2022</td>
        </tr>
    </tbody>
   </table>
   ```
3. **Initialize the sorting functionality**
Use the `TableSort` class to enable sorting on the table. Add this script after the table or ensure it runs once the DOM is loaded.
```
<script>
    document.addEventListener("DOMContentLoaded", function() {
        // Initialize TableSort for the sortable table
        const tableElement = document.querySelector(".table-sortable");
        const tableSortInstance = new tableSortjs.TableSort(tableElement);
    });
</script>
```
4. **Optional: Add custom sorting buttons**
You can add buttons to trigger sorting programmatically using the `sortTable` method. Here's an example:
```
<button id="sortByAge">Sort by Age</button>
<button id="sortByDate">Sort by Date of Birth</button>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        const tableElement = document.querySelector(".table-sortable");
        const tableSortInstance = new tableSortjs.TableSort(tableElement);

        // Sort by Age
        document.getElementById("sortByAge").addEventListener("click", function() {
            const ageHeader = tableElement.querySelector("th:nth-child(2)");
            tableSortInstance.sortTable(ageHeader);
        });

        // Sort by Date of Birth
        document.getElementById("sortByDate").addEventListener("click", function() {
            const dateHeader = tableElement.querySelector("th:nth-child(3)");
            tableSortInstance.sortTable(dateHeader);
        });
    });
</script>
```

## API

### `TableSort`

- **Constructor**: `new TableSort(tableElement)`
  - Accepts an HTML `<table>` element to initialize sorting.

- **Methods**:
  - `sortTable(headerElement)`: Sorts the table by the specified header element.

## Contribution
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License
This project is licensed under the MIT License.
