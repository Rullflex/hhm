import 'lazysizes'
import IMask from 'imask'
import validate from 'validate.js'

class App {
    constructor() {
        this.isMobile = {
            Android: () => navigator.userAgent.match(/Android/i),
            BlackBerry: () => navigator.userAgent.match(/BlackBerry/i),
            iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
            Opera: () => navigator.userAgent.match(/Opera Mini/i),
            Windows: () => navigator.userAgent.match(/IEMobile/i),
            any: () => (this.isMobile.Android() || this.isMobile.BlackBerry() || this.isMobile.iOS() || this.isMobile.Opera() || this.isMobile.Windows())
        }
        
        this.md = 768
        this.lg = 1320

        this._apiBase = 'http://localhost/api/api.php';  
    }

    init() {
        // FORM

    }

    // plural(number, ['год', 'года', 'лет'])
    plural(number, titles) {
        const cases = [2, 0, 1, 1, 1, 2]
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]]
    }

    matchMediaListener(breakpoint, callbackLessThan, callbackBiggerThan) {
        const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`)
        function handleBreakpointCross(e) {
            // Check if the media query is true
            if (e.matches) {
                callbackBiggerThan()
            } else {
                callbackLessThan()
            }
        }
        // Register event listener
        mediaQuery.addListener(handleBreakpointCross)

        // Initial check
        handleBreakpointCross(mediaQuery)
    }
    // меняют класс акстивности в сетах
    changeActivitySet(set, index, activeClass = `active`) {
        set.forEach(e => e.classList.remove(activeClass))
        set[index].classList.add(activeClass)
    }

    // возвр. индекс элемента в сете
    indexOfElements(el, set) {
        return [...set].indexOf(el)
    }
   
}


class Form extends App {
    constructor() {
        super()
        this.selectorMessages = `.messages`
        this.classHasError = `has-error`
        this.classHasSuccess = `has-success`
        this.formInput = `.input-wrap`
        this.disableIMask = false,
        this.disableMessages = true,
        this.removeErrorOnFocus = true,
        this.constraints = {
            email: {
              // Email is required
              presence: true,
              // and must be an email (duh)
              email: true
            },
            password: {
              // Password is also required
              presence: true,
              // And must be at least 5 characters long
              length: {
                minimum: 5
              }
            },
            "confirm-password": {
              // You need to confirm your password
              presence: true,
              // and it needs to be equal to the other password
              equality: {
                attribute: "password",
                message: "^The passwords does not match"
              }
            },
            "Имя": {
              // You need to pick a username too
              presence: true,
              // And it must be between 3 and 20 characters long
              length: {
                minimum: 3,
                maximum: 20
              },
              format: {
                // We don't allow anything that a-z and 0-9
                pattern: "[А-яA-z ]+",
                // but we don't care if the username is uppercase or lowercase
                flags: "i",
                message: "Только русские буквы"
              }
            },
            // birthdate: {
            //   // The user needs to give a birthday
            //   presence: true,
            //   // and must be born at least 18 years ago
            //   date: {
            //     latest: moment().subtract(18, "years"),
            //     message: "^You must be at least 18 years old to use this service"
            //   }
            // },
            country: {
              // You also need to input where you live
              presence: true,
              // And we restrict the countries supported to Sweden
              inclusion: {
                within: ["SE"],
                // The ^ prevents the field name from being prepended to the error
                message: "^Sorry, this service is for Sweden only"
              }
            },
            zip: {
              // Zip is optional but if specified it must be a 5 digit long number
              format: {
                pattern: "\\d{5}"
              }
            },
            "number-of-children": {
              presence: true,
              // Number of children has to be an integer >= 0
              numericality: {
                onlyInteger: true,
                greaterThanOrEqualTo: 0
              }
            },
            "Телефон": {
                presence: true
            },
            "comment": {
                presence: true
            }
        }
    }

    init(form = `form`) {
        this.disableIMask || this.phoneMask(form)

        // Hook up the form so we can prevent it from being posted
        document.querySelectorAll(form).forEach(el => {
            el.addEventListener(`submit`, ev => {
                ev.preventDefault();
                this.handleFormSubmit(el)
            });
        });

        // Hook up the inputs to validate on the fly
        document.querySelectorAll(`${form} input, ${form} textarea, ${form} select`).forEach((el) => {
            el.addEventListener("change", ev => {

                const target = ev.target
                const currentForm = target.closest(form)
                const errors = validate(currentForm, this.formConstraints(currentForm)) || {}
                this.showErrorsForInput(target, errors[target.name])
            });
            if (this.removeErrorOnFocus) {
                el.addEventListener('focus', ev => {
                    ev.target.closest(this.formInput).classList.remove(this.classHasError)
                });
            }
        })

    }


    phoneMask(form) {
        let mask
        document.querySelectorAll(`${form} input.phone`).forEach((e) => {
            e.addEventListener(`focusin`, () => {
                mask = IMask(
                    e, {
                        mask: `+7 (000) 000-00-00`,
                        startsWith: `7`,
                        lazy: false,
                        country: `Russia`
                    })
            })
            e.addEventListener(`focusout`, () => {
                if (mask.value.match(/_/g) != null) {
                    e.value = null
                    e.parentElement.classList.remove(`complete`)
                } else {
                    e.parentElement.classList.add(`complete`)
                }
                mask.destroy()

                e.classList.remove(`focus`)
                e.parentElement.classList.remove(`focus`)
            })
        })
    }

    handleFormSubmit(form, input) {
        // validate the form against the constraints
        
        let errors = validate(form, this.formConstraints(form));
        // then we update the form to reflect the results
        this.showErrors(form, errors || {});
        if (!errors) {
            this.showSuccess(form);
        }
    }

    // Updates the inputs with the validation errors
    showErrors(form, errors) {
        // We loop through all the inputs and show the errors for that input
          // Since the errors can be null if no errors were found we need to handle
          // that
        form.querySelectorAll("input[name], select[name], textarea[name]").forEach(input => this.showErrorsForInput(input, errors && errors[input.name]))
    }

      // Shows the errors for a specific input
    showErrorsForInput(input, errors) {
        // This is the root of the input
        let formGroup = input.closest(this.formInput)
          // Find where the error messages will be insert into
        let messages = null
        if (formGroup != null) {
            if (!this.disableMessages) {
                messages = formGroup.querySelector(this.selectorMessages)
            }
            // First we remove any old messages and resets the classes
            this.resetFormGroup(formGroup);
            // If we have errors
            if (errors) {
              // we first mark the group has having errors
              formGroup.classList.add(this.classHasError);
              // then we append all the errors
              errors.forEach(error => this.addError(error, messages))
            } else {
              // otherwise we simply mark it as success
              formGroup.classList.add(this.classHasSuccess);
            }
        }
    }

    

    resetFormGroup(formGroup) {
        // Remove the success and error classes
        formGroup.classList.remove(this.classHasError);
        formGroup.classList.remove(this.classHasSuccess);
        // and remove any old messages
        formGroup.querySelectorAll(".help-block.error").forEach(el => el.parentNode.removeChild(el))
    }

      // Adds the specified error with the following markup
      // <p class="help-block error">[message]</p>
    addError(error, messages) {
        const block = document.createElement("p");
        block.classList.add("help-block");
        block.classList.add("error");
        block.innerText = error;
        if (!this.disableMessages && messages != null) {
            messages.appendChild(block);
        }
        
    }

    showSuccess(form) {
        const formData = new FormData(form)

        // console.log(this.loadJSON(res => console.log(res)));
        fetch(`api.php`, {
            method: 'post',
            body: formData
        }).then(response => {
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
        
    }

    formConstraints(form) {
        let localConstraints = {}
        form.querySelectorAll(`input[name], select[name], textarea[name]`).forEach(e => {
            if (this.constraints[e.name] != undefined) {
                localConstraints[e.name] = this.constraints[e.name]
            }
            
        })
        return localConstraints
    }
    loadJSON(callback) {

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', `${this._apiBase}`, true);
        xobj.onreadystatechange = function() {
            if (xobj.readyState == 4 && xobj.status == "200") {
    
                // .open will NOT return a value but simply returns undefined in async mode so use a callback
                callback(xobj.responseText);
    
            }
        }
        xobj.send(null);
    
    }
}



export { App, Form }
