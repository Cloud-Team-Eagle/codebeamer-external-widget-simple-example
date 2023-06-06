const api = new window.CbWidgetApi.WidgetApi(window, 'widget-id', '*');

api.authenticate()
    .then(response => response.token)
    .then(token => fetch('https://advantest.codebeamer.com/api/v3/items/query?page=1&pageSize=25&queryString=SELECT%20WHERE%20tracker.id%20%3D%202048%20and%20assignedTo%20IN%20%28%27current%20user%27%29%20GROUP%20BY%20status',{
        headers: {
            authorization: 'Bearer ' + token
        }
    }))
    .then(response => response.json())
    .then(data => {
        console.log(data)
        data.items.forEach(item => addRowToTable(item))
    });

const reviewCustomFieldReviewersFieldId = 1000;
const reviewCustomFieldModeratorsFieldId = 1001;

function addRowToTable(item) {
    const tableBody = document.getElementById('review_table_body');
    const newRow = tableBody.insertRow();
    createTableCellWithLink(newRow, "https://advantest.codebeamer.com/review/" + item.id, item.name);            // Review Title
    createTableCellWithDate(newRow, item.startDate);                                                                // Started
    createTableCellWithDate(newRow, item.endDate);                                                                  // Deadline
    createTableCellWithDate(newRow, item.closedAt);                                                                 // Finished
    createTableCellForReviewers(newRow, item);                                                                      // Reviewers
    createTableCellForModerators(newRow, item);                                                                      // Moderators
}

function createTableCellWithDate(newRow, text) {
    const actualText = text ? new Date(text).toLocaleString("en-GB") : '-';
    const titleCell = newRow.insertCell();
    const titleText = document.createTextNode(actualText);
    titleCell.appendChild(titleText);
}

function createTableCellWithLink(newRow, url, text) {
    const a = document.createElement('a');
    const linkText = document.createTextNode(text);
    a.appendChild(linkText);
    a.title = text;
    a.href = url;
    document.body.appendChild(a);
    const titleCell = newRow.insertCell();
    titleCell.appendChild(a);
}

function createTableCellForReviewers(newRow, item) {
    const reviewers = item.customFields.find(it => it.fieldId === reviewCustomFieldReviewersFieldId);
    const text = reviewers.map(it => it.name).join(", ")
    const titleCell = newRow.insertCell();
    const titleText = document.createTextNode(text);
    titleCell.appendChild(titleText);
}

function createTableCellForModerators(newRow, item) {
    const moderators = item.customFields.find(it => it.fieldId === reviewCustomFieldModeratorsFieldId);
    const text = moderators.map(it => it.name).join(", ")
    const titleCell = newRow.insertCell();
    const titleText = document.createTextNode(text);
    titleCell.appendChild(titleText);
}
