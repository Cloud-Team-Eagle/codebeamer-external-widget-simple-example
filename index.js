const api = new window.CbWidgetApi.WidgetApi(window, 'widget-id', '*');

const pageSize = 25;
const OPEN_REVIEW_STATUS = "Unset";
const NEW_REVIEW_STATUS = "New";
let pages = 1;
let items = []

getItemsForPage(1)
.then(_ => {
        const pageNumbers = [];
        for (let page = 2; page <= pages; page++) {
            pageNumbers.push(page);
        }
        const promises = pageNumbers.map(it => getItemsForPage(it))
        Promise.all(promises).then(_ => {
            items.sort((a, b) => {
                const aStatus = a.status.name
                const bStatus = b.status.name
                if (aStatus !== bStatus) {
                    if(aStatus === OPEN_REVIEW_STATUS) {
                        return -1
                    }
                    if(bStatus === OPEN_REVIEW_STATUS) {
                        return 1
                    }
                    return aStatus.localeCompare(bStatus)
                }
                return a.startDate > b.startDate ? -1 : a.startDate < b.startDate ? 1 : 0
            })
            items.forEach(it => addRowToTable(it))
        })
    });

function getItemsForPage(pageNumber) {
    return api.authenticate()
        .then(response => response.token)
        .then(token => fetch(`https://advantest.codebeamer.com/api/v3/items/query?page=${pageNumber}&pageSize=${pageSize}&queryString=tracker.id%20%3D%202048%20and%20assignedTo%20IN%20%28%27current%20user%27%29%20and%20status%21%3D%27Closed%27`, {
            headers: {
                authorization: 'Bearer ' + token
            }
        }))
        .then(response => response.json())
        .then(data => {
            console.log(data)
            pages = Math.ceil(data.total / pageSize)
            items.push(...(data.items))
        });
}

const reviewCustomFieldReviewersFieldId = 1000;
const reviewCustomFieldModeratorsFieldId = 1001;

function getStatusName(item) {
    return item.status.name === OPEN_REVIEW_STATUS || item.status.name === NEW_REVIEW_STATUS ? "Open" : item.status.name;
}

function addRowToTable(item) {
    const tableBody = document.getElementById('review_table_body');
    const newRow = tableBody.insertRow();
    createTableCellWithLink(newRow, "https://advantest.codebeamer.com/review/" + item.id, item.name);            // Review Title
    createTableCellWithDate(newRow, item.startDate);                                                                // Started
    createTableCellWithDate(newRow, item.endDate);                                                                  // Deadline
    createTableCellWithDate(newRow, item.closedAt);                                                                 // Finished
    createTableCellWithText(newRow, getStatusName(item))                                                            // Status
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
