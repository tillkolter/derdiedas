'use strict'
// var _ = require('lodash')
var rp = require('request-promise')
var ENDPOINT = 'http://wordz.kolter.it:3696/wordinfo/?term='

function WordzHelper () { }

WordzHelper.prototype.requestWordInfos = function (term) {
  return this.getWordInfos(term).then(
    function (response) {
      console.log('success - received airport info for ' + term)
      return response.body
    }
  )
}

WordzHelper.prototype.getWordInfos = function (term) {
  var options = {
    method: 'GET',
    uri: ENDPOINT + term,
    resolveWithFullResponse: true,
    json: true
  }
  return rp(options)
}

WordzHelper.prototype.getSubstantiveForms = function (response) {
  var result = []
  for (var word in response) {
    var morphVariants = response[word]
    for (var variant in morphVariants) {
      if (morphVariants[variant].features.split(':').includes('SUB')) {
        result.push(morphVariants[variant].features.split(':'))
      }
    }
  }
  return result
}

WordzHelper.prototype.formatSubstantive = function (response) {
  for (var word in response) {
    var morphVariants = response[word]
    for (var variant in morphVariants) {
      if (morphVariants[variant].features.split(':').includes('SUB')) {
        return word + ' ist ein Substantiv.'
      }
    }
  }
  return word + ' ist kein Substantiv.'
}

WordzHelper.prototype.articleGenusList = function (article) {
  var lowerArticle = article.toLowerCase()
  if (lowerArticle === 'der') {
    return ['FEM', 'MAS', 'NEU']
  } else if (lowerArticle === 'des') {
    return ['MAS', 'NEU']
  } else if (lowerArticle === 'dem') {
    return ['MAS', 'NEU']
  } else if (lowerArticle === 'die') {
    return ['FEM', 'MAS', 'NEU']
  } else if (lowerArticle === 'das') {
    return ['NEU']
  }
}

WordzHelper.prototype.getArticle = function (featureSet) {
  if (featureSet.includes('SUB')) {
    var casus = featureSet[1]
    var numerus = featureSet[2]
    var genus = featureSet[3]

    if (numerus === 'SIN') {
      if (['GEN', 'DAT'].includes(casus)) {
        if (['MAS', 'NEU']) {
          if ('GEN' === casus) {
            return 'des'
          } else {
            return 'dem'
          }
        } else {
          return 'der'
        }
      }
      if (genus === 'MAS') {
        if (['NOM', 'AKK'].includes(casus)) {
          return 'der'
        }
      } else if (genus === 'FEM') {
        if (['NOM', 'AKK'].includes(casus)) {
          return 'die'
        }
      } else if (genus === 'NEU') {
        if (['NOM', 'AKK'].includes(casus)) {
          return 'das'
        }
      }
    } else if (['NOM', 'AKK'].includes(genus)) {
      return 'die'
    } else if ('GEN' === genus) {
      return 'der'
    } else {
      return 'den'
    }
  }
}

WordzHelper.prototype.matchArticle = function (response, article1, article2) {
  var featuresArray = WordzHelper.prototype.getSubstantiveForms(response)
  var matchingArticles = []
  for (var features in featuresArray) {
    matchingArticles.push(WordzHelper.prototype.getArticle(featuresArray[features]))
  }
  var word = Object.keys(response)[0]

  console.log('articles ' + matchingArticles)
  if (matchingArticles.includes(article1.toLowerCase())) {
    if (matchingArticles.includes(article2.toLowerCase())) {
      return 'Beides ist richtig.'
    } else {
      return article1 + ' ' + word + ' ist richtig.'
    }
  } else if (matchingArticles.includes(article2.toLowerCase())) {
    return article2 + ' ' + word + ' ist richtig.'
  } else {
    var unifiedArticles = matchingArticles.filter(function (item, pos) {
      return matchingArticles.indexOf(item) === pos
    })
    return 'Weder noch. Es müsste lauten: ' + unifiedArticles.map(function (x) { return x + ' ' + word }).join(' oder ')
  }
}

module.exports = WordzHelper
