const api = new window.CbWidgetApi.WidgetApi(window, 'widget-id', '*');

const pageSize = 25;
let pages = 1;
let items = []

await getItemsForPage(1);

async function getItemsForPage(pageNumber) {
    await api.authenticate()
        .then(response => response.token)
        .then(token => fetch(`https://advantest.codebeamer.com/api/v3/items/query?page=${pageNumber}&pageSize=${pageSize}&queryString=SELECT%20WHERE%20tracker.id%20%3D%202048%20and%20assignedTo%20IN%20%28%27current%20user%27%29%20GROUP%20BY%20status`, {
            headers: {
                authorization: 'Bearer ' + token
            }
        }))
        .then(response => response.json())
        .then(data => {
            console.log(data)
            pages = data.total / pageSize
            items.push(...(data.items))
        });
}

for (let page = 1; page < pages; page++) {
    await getItemsForPage(page)
}
const OPEN_REVIEW_STATUS = "Unset";
items.sort((a, b) => {
    const aStatus = a.status.name
    const bStatus = b.status.name
    if (aStatus !== bStatus) {
        if(aStatus === OPEN_REVIEW_STATUS) {
            return -1
        }
        if(bStatus === OPEN_REVIEW_STATUS) {
            return -1
        }
        return a.localeCompare(b)
    }
    return a.startDate > b.startDate ? -1 : a.startDate < b.startDate ? 1 : 0
})
items.forEach(it => addRowToTable(it))
window.frameElement.style.height = "400px"

const reviewCustomFieldReviewersFieldId = 1000;
const reviewCustomFieldModeratorsFieldId = 1001;

function addRowToTable(item) {
    const tableBody = document.getElementById('review_table_body');
    const newRow = tableBody.insertRow();
    createTableCellWithLink(newRow, "https://advantest.codebeamer.com/review/" + item.id, item.name);            // Review Title
    createTableCellWithDate(newRow, item.startDate);                                                                // Started
    createTableCellWithDate(newRow, item.endDate);                                                                  // Deadline
    createTableCellWithDate(newRow, item.closedAt);                                                                 // Finished
    createTableCellWithText(newRow, item.status.name)                                                               // Status
    createTableCellForReviewers(newRow, item);                                                                      // Reviewers
    createTableCellForModerators(newRow, item);                                                                     // Moderators
}

function createTableCellWithText(newRow, text) {
    const titleCell = newRow.insertCell();
    const titleText = document.createTextNode(text);
    titleCell.appendChild(titleText);
}

function createTableCellWithDate(newRow, text) {
    const actualText = text ? new Date(text).toLocaleString("sv-SE") : '-';
    createTableCellWithText(newRow, actualText)
}

function createTableCellWithLink(newRow, url, text) {
    const a = document.createElement('a');
    const linkText = document.createTextNode(text);
    a.appendChild(linkText);
    a.title = text;
    a.href = url;
    a.target = "_blank";
    document.body.appendChild(a);
    const titleCell = newRow.insertCell();
    titleCell.appendChild(a);
}

function createTableCellForReviewers(newRow, item) {
    const reviewers = item.customFields.find(it => it.fieldId === reviewCustomFieldReviewersFieldId).values;
    const text = reviewers.map(it => it.name).join(", ")
    createTableCellWithText(newRow, text)
}

function createTableCellForModerators(newRow, item) {
    const moderators = item.customFields.find(it => it.fieldId === reviewCustomFieldModeratorsFieldId).values;
    const text = moderators.map(it => it.name).join(", ")
    createTableCellWithText(newRow, text)
}
