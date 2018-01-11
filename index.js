'use strict'
module.change_code = 1
var _ = require('lodash')
var Alexa = require('alexa-app')
var app = new Alexa.app('derdiedas')
var WordzHelper = require('./wordz_helper')

app.launch(function (req, res) {
  var prompt = 'Du kannst mich fragen welches der richtige Artikel für ein Wort ist'
  res.say(prompt).reprompt(prompt).shouldEndSession(false)
})

app.intent('derdiedas', {
    'slots': {
      'DET1': 'DETERMINER',
      'DET2': 'DETERMINER',
      'WORD': 'WORD'
    },
    'utterances': [
      '{Heißt es|Ist es|Sagt man|-} {DET1} oder {DET2} {WORD}?',
      '{Heißt es|Ist es|Sagt man|-} {DET1} {WORD} oder {DET2} {WORD}?'
    ]
  },
  function (req, res) {
    var word = req.slot('WORD')
    var det1 = req.slot('DET1')
    var det2 = req.slot('DET2')

    var reprompt = 'Du kannst mich fragen welches der richtige Artikel für ein Wort ist'
    if (_.isEmpty(word)) {
      var prompt = 'Ich habe das Wort nicht verstanden. Kannst du es bitte wiederholen?'
      res.say(prompt).reprompt(reprompt).shouldEndSession(false)
      // return true
    } else {
      var wordzHelper = new WordzHelper()
      wordzHelper.requestWordInfos(word).then(function (wordInfos) {
        console.log(wordInfos)
        console.log(det1)
        console.log(det2)
        var answer = wordzHelper.matchArticle(wordInfos, det1, det2)
        console.log('answer ' + answer)
        res.say(prompt).reprompt(reprompt).shouldEndSession(false)
      }).catch(function (err) {
        console.log(err.statusCode)
        var prompt = 'Ich konnte keine Daten für das Wort ' + word + ' finden'
        res.say(prompt).reprompt(reprompt).shouldEndSession(false).send()
      })
      // return true
    }
  }
)

module.exports = app