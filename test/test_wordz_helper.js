'use strict'

var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

var expect = chai.expect
var WordzHelper = require('../wordz_helper')
chai.config.includeStack = true

describe('WordzHelper', function () {
  var subject = new WordzHelper()
  var term
  describe('#getWordInfos', function () {
    context('with a valid term', function () {
      it('returns matching term', function () {
        term = 'Wetter'
        var value = subject.requestWordInfos(term).then(function (obj) {
          return Object.keys(obj)[0]
        })
        return expect(value).to.eventually.eq(term)
      })
    })
  })
  describe('#isSubject', function () {
    context('with a subject term', function () {
      var response = {
        'Wetter': [
          {
            'features': 'SUB:AKK:SIN:NEU',
            'stem': 'Wetter'
          }
        ]
      }
      it('formats the response as expected', function () {
        expect(subject.formatSubstantive(response)).to.eq(
          'Wetter ist ein Substantiv.'
        )
      })
    })
    context('with a non Subject term', function () {
      var response = {
        'rein': [
          {
            'features': 'ADJ:PRD:GRU',
            'stem': 'rein'
          }
        ]
      }
      it('formats the response as expected', function () {
        expect(subject.formatSubstantive(response)).to.eq(
          'rein ist kein Substantiv.'
        )
      })
    })
  })
  describe('#matchArticle', function () {
    var response = {
      'Mann': [
        {
          'features': 'SUB:AKK:SIN:MAS',
          'stem': 'Mann'
        },
        {
          'features': 'SUB:DAT:SIN:MAS',
          'stem': 'Mann'
        },
        {
          'features': 'SUB:NOM:SIN:MAS',
          'stem': 'Mann'
        }
      ]
    }
    context('with one correct of two article options', function () {
      it('returns the right choice', function () {
        expect(subject.matchArticle(response, 'Der', 'Das')).to.eq(
          'Der Mann ist richtig.'
        )
      })
    })
    context('with no correct of two article options', function () {
      it('returns a corrective answer', function () {
        expect(subject.matchArticle(response, 'Die', 'Das')).to.eq(
          'Weder noch. Es müsste lauten: der Mann oder dem Mann'
        )
      })
    })
    context('with Auto and options Das and Die', function () {
      var autoResponse = {
        "Auto": [
          {
            "features": "SUB:AKK:SIN:NEU",
            "stem": "Auto"
          },
          {
            "features": "SUB:DAT:SIN:NEU",
            "stem": "Auto"
          },
          {
            "features": "SUB:NOM:SIN:NEU",
            "stem": "Auto"
          }
        ]
      }
      it('returns Das Auto', function () {
        expect(subject.matchArticle(autoResponse, 'Die', 'Das')).to.eq(
          'Das Auto ist richtig.'
        )
      })
    })
  })
})
