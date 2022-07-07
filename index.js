const api = new window.CbWidgetApi.WidgetApi(window, 'widget-id', '*');

api.authenticate()
    .then(response => response.token)
    .then(token => fetch('http://localhost:8080/cb/api/v3/projects',{
        headers: {
            authorization: 'Bearer ' + token
        }
    }))
    .then(response => response.json())
    .then(projects => console.log(projects));
