const api = new window.CbWidgetApi.WidgetApi(window, 'widget-id', '*');

api.authenticate()
    .then(response => response.token)
    .then(token => fetch('https://advantest.codebeamer.com/api/v3/items/query?page=1&pageSize=25&queryString=tracker.id%20%3D%202048%20and%20assignedTo%20IN%20%28%27current%20user%27%29',{
        headers: {
            authorization: 'Bearer ' + token
        }
    }))
    .then(response => response.json())
    .then(data => {
        console.log(data)
        data.items.forEach(item => addRowToTable(item))
    });

function addRowToTable(item) {
    const tableBody = document.getElementById('review_table_body');
    const newRow = tableBody.insertRow();
    createTableCell(newRow, item.name);         // Review Title
    createTableCell(newRow, item.startDate);    // Started
    createTableCell(newRow, item.endDate);      // Deadline
    createTableCell(newRow, item.closedAt);     // Finished
}

function createTableCell(newRow, text) {
    const actualText = text ?? '-';
    const titleCell = newRow.insertCell();
    const titleText = document.createTextNode(actualText);
    titleCell.appendChild(titleText);
}
