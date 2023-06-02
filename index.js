console.log("SOME DEBUG OUTPUT! (in all caps -_-)" );

const api = new window.CbWidgetApi.WidgetApi(window, 'widget-id', '*');

api.authenticate()
    .then(response => response.token)
    .then(token => fetch('https://advantest.codebeamer.com/api/v3/projects',{
        headers: {
            authorization: 'Bearer ' + token
        }
    }))
    .then(response => response.json())
    .then(projects => console.log(projects));
