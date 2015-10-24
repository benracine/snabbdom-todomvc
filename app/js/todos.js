var h = require('snabbdom/h');
var Type = require('union-type');
var helpers = require('./helpers');
var bind = helpers.bind;
var sequence = helpers.sequence;
var isBoolean = helpers.isBoolean;
var target_checked = helpers.target_checked;
var task = require('./task');

// Model {nextID: Number, editingTitle: String, tasks: [task.model], filter: String }
function init(tasks) {
  var tasks = tasks || [];
  return { 
    nextID: tasks.reduce((acc, task) => Math.max(acc, task.id), 0) + 1, 
    tasks: tasks,
    editingTitle: '', 
    filter: 'all' 
  }
}
// Update(s)
var Action = Type({
  Add: [String],
  Remove: [Number],
  Archive: [],
  ToggleAll: [isBoolean],
  Filter: [String],
  Modify: [Number, task.Action]
});

function update(model, action) {
  return Action.case({
    Add       : title => addTodo(model, title),
    Remove    : id => removeTodo(model, id),
    Archive   : () => archiveTodos(model),
    ToggleAll : done => toggleAll(model, done),
    Filter    : filter => ({...model, filter }),
    Modify    : (id, action) => modifyTodo(model, id, action)
  }, action);
}

function addTodo(model, title) {
  return {...model,
    tasks         : [ ...model.tasks, 
                    task.init(model.nextID, title)],
    editingTitle  : '',
    nextID        : model.nextID + 1
  }
}

function removeTodo(model, id) {
  return {...model, tasks : model.tasks.filter(taskModel => taskModel.id != id)};
}

function archiveTodos(model, id) {
  return {...model, tasks : model.tasks.filter(taskModel => !taskModel.done)};
}

function toggleAll(model, done) {
  return {...model, tasks : model.tasks.map(taskModel => task.update(taskModel, task.Action.Toggle(done)))};
}

function remainingTodos(tasks) {
  return tasks.reduce( (acc, task) => !task.done ? acc+1 : acc, 0);
}

function filteredTodos(tasks, filter) {
  return   filter === 'completed' ? tasks.filter( todo => todo.done )
         : filter === 'active'    ? tasks.filter( todo => !todo.done )
                                  : tasks;
}

function modifyTodo(model ,id, action) {
  return {...model, tasks : model.tasks.map( taskModel => taskModel.id !== id ? taskModel : task.update(taskModel, action))};
}

// View
function view(model, handler) {
  var remaining = remainingTodos(model.tasks);
  var filtered  = filteredTodos(model.tasks, model.filter);
  return h('section.todoapp', {
    windowOn: { hashchange: _ => handler(Action.Filter(window.location.hash.substr(2) || 'all')) },
    on : { click: () => console.log('clicked') }
  }, [
    h('header.header', [
      h('h1', 'todos'),
      h('input#new-todo.new-todo', {
        props: {placeholder: 'What needs to be done?', value: model.editingTitle },
        on: { keydown: bind(onInput, handler)}
      }),
    ]),
    h('section.main', {style: {display: model.tasks.length ? 'block' : 'none'}}, [
      h('input.toggle-all', {
        props: { type: 'checkbox', checked: remaining === 0 }, 
        on: {click: sequence(target_checked, Action.ToggleAll, handler)}
      }),
      h('ul.todo-list', filtered.map( todo => 
          task.view(
            todo, 
            action => handler(Action.Modify(todo.id, action)),
            id => handler(Action.Remove(id))
          ) )),
    ]),
    h('footer.footer', {
      style: {display: model.tasks.length ? 'block' : 'none'}
    }, [
      h('span.todo-count', [h('strong', remaining), ` item${remaining === 1 ? '' : 's'} left`]),
      h('ul.filters', [
        h('li', [h('a', {class: {selected: model.filter === 'all'}, props: {href: '#/'}}, 'All')]),
        h('li', [h('a', {class: {selected: model.filter === 'active'}, props: {href: '#/active'}}, 'Active')]),
        h('li', [h('a', {class: {selected: model.filter === 'completed'}, props: {href: '#/completed'}}, 'Completed')]),
      ]),
      h('button.clear-completed', {
        on: { click: bind(handler, Action.Archive() ) }
      }, 'Clear completed'),
    ])
  ]);
}

// Helpers
var target_checked = e => e.target.checked;

var target_value = e => e.target.value;

function onInput(handler, e) {
  if(e.keyCode === 13) {
    handler(Action.Add(e.target.value));
  }
}

export default { init, Action, update, view }
