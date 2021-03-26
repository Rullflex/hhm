import { App, Form } from '../../modules/scripts/_core'

document.addEventListener(`DOMContentLoaded`, function () {
    const app = new App()
    app.init()

    const form = new Form()
    form.init()


    fetch(`api.php`).then(response => {
        return response.json()
    }).then(json => {
        let html = ''
        json.map((person, idx) => {
            html += `
            <div class="col-12 col-lg-4">
                <div class="s2__card${idx % 2 !== 0 ? ' s2__card--even' : ''}">
                    <div class="s2__card-head"> 
                        <p class="s2__card-name">${person.name}</p>
                    </div>
                    <div class="s2__card-body">
                        <p class="s2__card-email">${person.email}</p>
                        <p class="s2__card-text">${person.text}</p>
                    </div>
                </div>
            </div>`
            
        })
        document.querySelector(`#cards-load`).innerHTML = html
    }).catch(error => {
        console.error(error)
    })
})
