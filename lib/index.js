'use strict';

var _czConventionalChangelog = require('ibb-cz-conventional-changelog');

var _czConventionalChangelog2 = _interopRequireDefault(_czConventionalChangelog);

var _PackageUtilities = require('lerna/lib/PackageUtilities');

var _PackageUtilities2 = _interopRequireDefault(_PackageUtilities);

var _Repository = require('lerna/lib/Repository');

var _Repository2 = _interopRequireDefault(_Repository);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function getAllPackages() {
  return _PackageUtilities2.default.getPackages(new _Repository2.default());
}

function getChangedPackages() {
  var changedFiles = _shelljs2.default.exec('git diff --cached --name-only', { silent: true }).stdout.split('\n');

  return getAllPackages().filter(function (pkg) {
    var packagePrefix = _path2.default.relative('.', pkg.location) + _path2.default.sep;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = changedFiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var changedFile = _step.value;

        if (changedFile.indexOf(packagePrefix) === 0) {
          return true;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }).map(function (pkg) {
    return pkg.name;
  });
}

module.exports = {
  prompter: function prompter(cz, commit) {

    var allPackages = getAllPackages().map(function (pkg) {
      return pkg.name;
    });

    _czConventionalChangelog2.default.prompter(cz, function (commitMessage) {
      var _commitMessage$split = commitMessage.split('\n\n'),
          _commitMessage$split2 = _toArray(_commitMessage$split),
          messageHead = _commitMessage$split2[0],
          restOfMessageParts = _commitMessage$split2.slice(1);

      cz.prompt({
        type: 'checkbox',
        name: 'packages',
        'default': getChangedPackages(),
        choices: allPackages,
        message: 'The packages that this commit has affected (' + getChangedPackages().length + ' detected)\n',
        validate: function validate(input) {
          var type = commitMessage.type;
          var isRequired = ['feat', 'fix'].some(function (type) {
            return messageHead.indexOf(type) === 0;
          });
          var isProvided = input.length > 0;
          return isRequired ? isProvided ? true : 'Commit type "' + type + '" must affect at least one component' : true;
        }
      }).then(function (packageAnswers) {
        var messages = [messageHead];

        var selectedPackages = packageAnswers.packages;
        if (selectedPackages && selectedPackages.length) {
          messages.push('affects: ' + selectedPackages.join(', '));
        }

        messages.push.apply(messages, _toConsumableArray(restOfMessageParts));

        var modifiedCommitMessage = messages.join('\n\n');

        console.log(modifiedCommitMessage);

        commit(modifiedCommitMessage);
      });
    });
  }
};