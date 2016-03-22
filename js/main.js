'use strict';
var app = {};

app.Learning = Backbone.Model.extend({
    defaults: {
        currentState: 'editing',
        header: '',
        content: '',
        text: '',
        id: 0,
        solutie: [],
        answers: [],
        totalTries: 0,
        remainedTries: 3
    }
});

var learning = new app.Learning();

app.InputView = Backbone.View.extend({
    tagName: 'span',
    template: _.template($('#item-template').html()),
    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this;
    }
});

app.AppView = Backbone.View.extend({
    el: '#from-template',
    template: _.template($('#all').html()),
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

app.appView = new app.AppView({model: learning});

$('#add-input').on('click', function() {
    var value = learning.get('id');
    value ++;
    learning.set('id', value);
    var view = new app.InputView({model: learning});
    $('#middle').append(view.render().el);
    for (var i=0; i< value; i++) {
        $('.edit').eq(i).attr('data-id', i);
    }
});

$('#preview').on('click', function() {
    var noOfTries = $('#try').val();
    learning.set('remainedTries', noOfTries);
    var correctVals = learning.get('solutie');
    for (var index = 0; index < learning.id; index++) {
        correctVals.push($('.edit').eq(index).val());
    }
    learning.set('solutie', correctVals);
    console.log("get sol: ", learning.get('solutie'));
    console.log(correctVals);
    learning.set('currentState', 'preview');
    $('#try').attr('readonly', true);
    $('#header').prop('contenteditable', false);
    $('#middle').prop('contenteditable', false);
    $('#editing-btn').removeClass('hidden').addClass('display')
    $('#score').removeClass('hidden').addClass('display');
    $('#validate').removeClass('hidden').addClass('display');
    $('#preview').removeClass('display').addClass('hidden');
    $('.select').removeClass('display').addClass('hidden');
    $('.mod').removeClass('display').addClass('hidden');
    $('#add-input').removeClass('display').addClass('hidden');
    for (var index = 0; index < learning.id; index++) {
       $('.edit').eq(index).val('');
    }
});

$('#solutie').on('click', function(){
    var solutie = learning.get('solutie');
    console.log("solutie: ", solutie);
    for (var i=0; i<learning.id; i++) {
        $('.edit').eq(i).val(solutie[i]);
        $('.edit').removeClass('right wrong');
    }
});

$('#validate').on('click', function() {
    var answ = $('.edit').map(function(){
        return this.value;
    }).get();
    learning.set('answer', answ);
    var totalTries = learning.get('totalTries');
    var leftTries = learning.get('remainedTries');
    $('#try').val(leftTries - totalTries-1);
    console.log("answers: ", answ);
    var a = answ.toString();
    var b = learning.get('solutie').toString();
    if (a === b) {
        var score = (100 - totalTries/leftTries*100).toFixed(2);
        $('#score').val(score);
        $('#validate').removeClass('display').addClass('hidden');
    } else if (totalTries < leftTries - 1){
        var sol = learning.get('solutie');
        for (var i=0; i<learning.id; i++) {
            if(answ[i] === sol[i]) {
                $('.edit').eq(i).addClass('right');
            } else {
                $('.edit').eq(i).addClass('wrong');
            }
        }
        totalTries++;
        learning.set('totalTries', totalTries);
    }else {
        var score = (100 - totalTries/leftTries*100).toFixed(2);
        $('#score').val(score);
        $('#validate').removeClass('display').addClass('hidden');
        $('#solutie').addClass('display').removeClass('hidden');
    }
});

$('#editing-btn').on('click', function() {
    $('#header').prop('contenteditable', true);
    $('#middle').prop('contenteditable', true);
    learning.set('currentState', 'editing');
    $('#solutie').removeClass('hidden display').addClass('hidden');
    $('#add-input').addClass('display').removeClass('hidden');
    $('.select').addClass('display').removeClass('hidden');
    $('.mod').addClass('display').removeClass('hidden');
    $('#try').attr('readonly', false);
    $('#preview').addClass('display').removeClass('hidden');
    $('#score').removeClass('display').addClass('hidden');
    $('#validate').removeClass('display').addClass('hidden');
    $('#editing-btn').removeClass('display').addClass('hidden');
    var solutie = learning.get('solutie');
    for (var i=0; i<learning.id; i++) {
        $('.edit').eq(i).val(solutie[i]);
        $('.edit').removeClass('right wrong');
    }
});