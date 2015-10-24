var boilerplate = require('./boilerplate');

var todos = require('./todos');
boilerplate.main(todos.init(), document.querySelector('#todoapp'), todos);
