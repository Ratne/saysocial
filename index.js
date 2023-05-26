const express = require('express')
const app = express()
const port = 80
require('dotenv').config()
const axios = require('axios');
const cors = require('cors')
const Joi = require('joi');
const bodyParser = require("body-parser");
const baseUrl =process.env.URLAPI
const apiKey=process.env.APIKEY
app.use(cors());
app.use(bodyParser.json())

const contactSchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().allow(null, ''),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    city: Joi.string().required(),
    message: Joi.string().required(),
    privacy: Joi.boolean().required(),
    gdpr: Joi.boolean(),
    language: Joi.string().required()
})

const projectSchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().allow(null, ''),
    business_name: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    city: Joi.string().required(),
    know_us: Joi.string().required(),
    budget: Joi.string().required(),
    message: Joi.string().required(),
    privacy: Joi.boolean().required(),
    gdpr: Joi.boolean(),
    language: Joi.string().required()
})


const scrollTags = (contact,tags, index=0) => {
    callTagActivecampaign(contact,tags[index]).then(tag => {
        if (index < tags.length - 1) {
            scrollTags(contact,tags, index + 1)
        }
    })
}

const callTagActivecampaign = (contact, tag) => {
    return new Promise((resolve, reject) => {

        let dataContactTag = {
            "contactTag": {
                contact,
                tag
            }
        }

        axios.post(`${baseUrl}/contactTags`, dataContactTag, {
            headers: {
                'content-type': 'text/json',
                "Api-Token": apiKey
            }
        }).then(contactTag => {
            resolve(true)
        }).catch(errorContactTag => {
            reject(false)
        })

    })
}



const userExist = (contact) => {


  axios.get(`${baseUrl}/contacts?filters[email]=${contact.email}`, {
        headers: {
            'content-type': 'text/json',
            "Api-Token": apiKey
        }}).then(user => {

       if (user.data.contacts[0].id){
            // qui fare chiamate altre
       }
       else {
           // fare chiamata nuovo contatto e tutti i crismi
         }
        }).catch(errorNotFound => {
            console.log(errorNotFound)
    })

}


const newContact = (contact)=> {

    let dataNewContact = {
        "contact": {
            "email": contact.email,
            "firstName": contact.name,
            "lastName": contact.surname,
            "phone": contact.phone,
            "fieldValues": [
                {
                    "field": "3",
                    "value": contact.city.toString()
                },
                {
                    "field": "33",
                    "value": contact.message.toString()
                },
                {
                    "field": "1",
                    "value": contact.language.toString()
                }
            ]
        }
    }
    axios.post(`${baseUrl}/contacts`, dataNewContact, {
    headers: {
        'content-type': 'text/json',
        "Api-Token": apiKey
    }
    }).then(newContact => {
        const dataArray = ["37","40", ...(contact.gdpr === true ? ["38"] : [])]

        scrollTags(newContact.data.contact.id, dataArray)

            })
}




const newProject = (contact)=> {
    let dataNewContact = {
        "contact": {
            "email": contact.email,
            "firstName": contact.name,
            "lastName": contact.surname,
            "phone": contact.phone,
            "fieldValues": [
                {
                    "field": "3",
                    "value": contact.city.toString()
                },
                {
                    "field": "27",
                    "value": contact.message.toString()
                },
                {
                    "field": "26",
                    "value": contact.budget.toString()
                },
                {
                    "field": "25",
                    "value": contact.know_us.toString()
                },
                {
                    "field": "13",
                    "value": contact.business_name.toString()
                },
                {
                    "field": "1",
                    "value": contact.language.toString()
                }
            ]
        }
    }
    axios.post(`${baseUrl}/contacts`, dataNewContact, {
        headers: {
            'content-type': 'text/json',
            "Api-Token": apiKey
        }
    }).then(newContact => {
        const dataArray = ["37","39", ...(contact.gdpr === true ? ["38"] : [])]

        scrollTags(newContact.data.contact.id, dataArray)

    }
        ).catch(newContactError => {
        console.log('inserimento nuovo contatto errato ' +newContactError)
    })
}





app.post('/newcontact', (req, res) => {
    const isOk = contactSchema.validate(req.body)
    if (isOk.error) return res.status(400).send(isOk.error.details[0].message);
    else {
        newContact(req.body)
        res.status(200).json({message: 'Contatto Inserito'})}
})

app.post('/newproject', (req, res) => {
        const isOk = projectSchema.validate(req.body)
        if (isOk.error) return res.status(400).send(isOk.error.details[0].message);
        else {
            newProject(req.body)
            res.status(200).json({message: 'Contatto Inserito'})
        }

})

app.get('/', (req, res) => {
    res.status(200).send('Online')
})

app.post('/test', (req, res) => {
    userExist(req.body)
    res.status(200).send(req.body)
})

app.listen(port, () => {
    console.log(`Online`)
})
