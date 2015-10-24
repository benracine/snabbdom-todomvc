var snabbdom = require('snabbdom');
var patch = snabbdom.init([
  require('snabbdom/modules/class'),          
  require('snabbdom/modules/props'),          
  require('snabbdom/modules/style'),          
  require('snabbdom/modules/eventlisteners'), 
  require('./snabbdom-modules/window-events') 
]);

function main(initState, oldVnode, _ref) {
  var view = _ref.view;
  var update = _ref.update;
  var newVnode = view(initState, function (e) {
    var newState = update(initState, e);
    main(newState, newVnode, {view: view, update: update});
  });
  patch(oldVnode, newVnode);
}

module.exports = {main: main};
