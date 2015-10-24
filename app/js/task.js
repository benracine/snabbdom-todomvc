var h = require('snabbdom/h');
var Type = require('union-type');
var helpers = require('./helpers');
var bind = helpers.bind;
var sequence = helpers.sequence;
var isBoolean = helpers.isBoolean;
var target_checked = helpers.target_checked;

// Model: {id: Number, title: String, done: Boolean, editing: Boolean, editing_value: String}
function init(id, title) {
  return {'id': id, 'title': title, 'done': false, 'editing': false, 'editing_value': ''};
}

// Update(s)
var Action = Type({
  SetTitle: [String],
  Toggle: [isBoolean],
  StartEdit: [],
  CommitEdit: [String],
  CancelEdit: []
});

function update(model, action) {
  return Action.case({
    Toggle: done => ({...model, done}),
    StartEdit: () => ({...model, editing: true, editing_value: ''}),
    CommitEdit: title => ({...model, title, editing: false, editing_value: ''}),
    CancelEdit: title => ({...model, editing: false, editing_value: ''})
  }, action);
}

// View
function view(task, handler, remove) {
  return h('li', {class: {completed: !!task.done && !task.editing, editing: task.editing}, key: task.id}, [
    h('div.view', [
      h('input.toggle', {props: {checked: !!task.done, type: 'checkbox'}, on: {click: sequence(target_checked, Action.Toggle, handler)}, }),
      h('label', {on: {dblclick: bind(handler, Action.StartEdit())}}, task.title ),
      h('button.destroy', {on: {click: bind(remove, task.id) }})
    ]),
    h('input.edit', {props: {value: task.title}, on: {blur: bind(handler, Action.CancelEdit()), keydown: bind(onInput, handler), }})
  ]);
}

function onInput(handler, e) {
  if(e.keyCode == 13)
    handler(Action.CommitEdit(e.target.value))
}

// Export
module.exports = {init, Action, update, view};
