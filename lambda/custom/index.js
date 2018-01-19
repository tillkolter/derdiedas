'use strict'

const Alexa = require('alexa-sdk')
const WordzHelper = require('./wordz_helper')

const APP_ID = 'derdiedas'

const extractSlot = function (intent, slotName) {
  const slot = intent.slots[slotName]
  let slotValue
  if (slot && slot.value) {
    slotValue = slot.value.toLowerCase()
  }
  return slotValue
}

const languageStrings = {
  'de': {
    translation: {}
  }
}

const handlers = {
  'LaunchRequest': function () {
    this.attributes.speechOutput = 'Du kannst mich fragen welches der richtige Artikel für ein Wort ist'
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    this.attributes.repromptSpeech = 'Du kannst mich fragen welches der richtige Artikel für ein Wort ist'
    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech)
    this.emit(':responseReady')
  },
  'ArticleIntent': function () {
    const intent = this.event.request.intent
    let word = extractSlot(intent, 'Word')
    let determiner1 = extractSlot(intent, 'DetA')
    let determiner2 = extractSlot(intent, 'DetB')

    if (word) {
      const wordzHelper = new WordzHelper()
      let intent = this
      wordzHelper.requestWordInfos(word).then(function (wordInfos) {
        let answer = wordzHelper.matchArticle(wordInfos, determiner1, determiner2)
        console.log(`${word}, ${determiner1}, ${determiner2} -> ${answer}`)
        intent.attributes.speechOutput = answer
        intent.attributes.repromptSpeech = 'Sage einfach Wiederholen'
        intent.emit(':responseReady')
      }).catch(function (err) {
        console.log(`error: ${err}`)
        intent.attributes.speechOutput = `Ich konnte keine Daten für das Wort ${word} finden`
        intent.attributes.repromptSpeech = 'Mache einfach weiter'
        intent.emit(':tell', 'oops!')
      })
    } else {
      this.attributes.speechOutput = 'Ich habe das Wort nicht verstanden. Kannst du es bitte wiederholen?'
      this.attributes.repromptSpeech = 'Sage einfach Halt Stop Ich werde hier gemobbt.'
    }
  },
  'AMAZON.HelpIntent': function () {
    this.attributes.speechOutput = 'Hilfe'
    this.attributes.repromptSpeech = 'Mithilfe'

    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech)
    this.emit(':responseReady')
  },
  'AMAZON.RepeatIntent': function () {
    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech)
    this.emit(':responseReady')
  },
  'AMAZON.StopIntent': function () {
    this.response.speak('Tschüss')
    this.emit(':responseReady')
  },
  'AMAZON.CancelIntent': function () {
    this.response.speak('Tschüss')
    this.emit(':responseReady')
  },
  'SessionEndedRequest': function () {
    console.log(`Session ended: ${this.event.request.reason}`)
  },
  'Unhandled': function () {
    this.attributes.speechOutput = 'Hilfe'
    this.attributes.repromptSpeech = 'Schmilfe'
    this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech)
    this.emit(':responseReady')
  }
}

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)
  alexa.APP_ID = APP_ID
  // To enable string internationalization (i18n) features, set a resources object.
  alexa.resources = languageStrings
  alexa.registerHandlers(handlers)
  alexa.execute()
}
