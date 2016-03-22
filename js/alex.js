var QuestionsModel = Backbone.Model.extend({
​
selectMode: function(mod) {
    if (mod == "Formativ") {
        this.set({"mod": "Formativ"});
        $(".sp2").removeClass("undisplayed");
    } else {
        this.set({"mod": "Sumativ"});
        $(".sp2").addClass("undisplayed");
    }
},
​
previewModuleSwitch: function() {
    this.set({"module": "preview"});
},
​
editModuleSwitch: function() {
    this.set({"module": "edit"});
},
​
updateInstructions: function(text) {
    this.set({"instruction": text}, { silent: true });
},
​
updateAnswer: function(text, id) {
    var answers = this.get("answers");
    answers[id-1] = text;
    this.set({"answers": answers});
},
​
updateTries: function(number) {
    this.set({"maxTries": number});
},
​
validateAnswers: function() {
    if (this.get("tries") != this.get("maxTries")) {
        if(!(this.get("gameOver"))) {
            var answers = this.get("answers");
            var usedTry = false;
            var allAreCorrect = true;
            var nrAnswers = 0;
            $(".exercise-div").children(".answer").each(function() {
                if(!$(this).hasClass("correct")) {
                    var id = $(this).attr("data-id");
                    if ($(this).val() != answers[id-1]) {
                        $(this).addClass("wrong");
                        usedTry = true;
                        allAreCorrect = false;
                    } else {
                        nrAnswers++;
                        $(this).addClass("correct");
                    }
                }
            });
            this.set({"correctAnswers": this.get("correctAnswers") + nrAnswers});
            if (usedTry) {
                this.set({"tries": this.get("tries")+1});
            }
            if (allAreCorrect) {
                this.set({"gameOver": true});
            }
        } else {
            $(".alert").removeClass("undisplayed");
            setTimeout(function() {
                $(".alert").addClass("undisplayed");
            }, 1500);
        }
    } else {
        $(".sp").addClass("wrong2");
        setTimeout(function() {
            $(".sp").removeClass("wrong2");
        }, 1500);
    }
},
​
calculateScore: function() {
    var score = 0;
    if(this.get("gameOver")) {
        if (this.get("mod") == "Formativ") {
            var tries = this.get("tries");
            var maxTries = this.get("maxTries");
            score = 100 - ((tries / maxTries) * 100);
        } else {
            score = this.get("correctAnswers");
        }
        $(".score-box").removeClass("undisplayed");
        $(".score").text(score);
    }
    },
​
	addInput: function() {
        this.set({ "answers" : this.get("answers").concat("")});
    }
​
});
​
var questionsModel = new QuestionsModel({
​
answers: [],
    module: "edit",
    tries: 0,
    maxTries: 5,
    gameOver: false,
    instruction: "Completati tabelul de mai jos",
    mod: "Formativ",
    correctAnswers: 0
​
});
​
var QuestionsView = Backbone.View.extend({
​
model: questionsModel,
​
el: '.container',
​
template1: _.template("<input type='text' class='answer' data-id='<%= answers.length %>' value=>"),
​
template2: _.template("<span contenteditable=" + "<% (module === 'edit') ? print('true') : print('false') %>" + "><%= instruction %></span>"),
​
template3: _.template("<span><button class='add-btn'>Adauga input</button></span><span class='sp'><label>Mod:</label><select><option>Formativ</option><option>Sumativ</option></select></span><span class='sp sp2'><label>Numar maxim incercari:</label><input type='number' min='0' max='10' value='<%= maxTries %>' /></span><span><button class='preview-btn'>Preview</button></span>"),
​
template4: _.template("<span><button class='validate-btn'>Valideaza</button></span><span><button class='find-btn'>Solutii</button></span><span class='sp'><label>Numar ramas incercari:</label><span class='tries'><%= maxTries - tries %></span></span><span><button class='edit-btn'>Editeaza</button></span>"),
​
initialize: function() {
    this.model.on('change', this.render, this);
},
​
render: function() {
    this.$el.find(".instruction-div").html(this.template2(this.model.toJSON()));
​
		if (this.model.get("module") === "edit") {
            this.$el.find(".button-stripe").html(this.template3(this.model.toJSON()));
        } else {
            this.$el.find(".button-stripe").html(this.template4(this.model.toJSON()));
        };
​
    /*this.$el.find(".exercise-div").children(".answer").remove();
     this.model.get("answers").forEach(function(answer) {
     var ans = { answer: answer };
     this.$el.find(".exercise-div").append(this.template1(ans));
     }.bind(this));*/
},
​
events: {
    "click .add-btn": "addInput",
        "click .preview-btn": "previewModuleSwitch",
        "click .edit-btn": "editModuleSwitch",
        "click .find-btn": "displayAnswers",
        "click .validate-btn": "validateAnswers",
        "keyup .instruction-div>span": "updateInstructions",
        "keyup .exercise-div>.answer": "updateAnswer",
        "change input[type='number']": "updateTries",
        "change select": "selectMode"
},
​
selectMode: function(event) {
    var mod = $(event.target).val();
    this.model.selectMode(mod);
},
​
updateInstructions: function(event) {
    if (this.model.get("module") === "edit") {
        var text = $(event.target).text();
        this.model.updateInstructions(text);
    }
},
​
updateAnswer: function(event) {
    if (this.model.get("module") === "edit") {
        var text = $(event.target).val();
        var id = $(event.target).attr("data-id");
        this.model.updateAnswer(text, id);
    }
},
​
updateTries: function(event) {
    var number = $(event.target).val();
    this.model.updateTries(number);
},
​
validateAnswers: function() {
    this.model.validateAnswers();
},
​
displayAnswers: function() {
    var answers = this.model.get("answers");
    this.$el.find(".exercise-div").children(".answer").each(function() {
        var id = $(this).attr("data-id");
        $(this).val(answers[id-1]);
    });
    this.model.calculateScore();
},
​
previewModuleSwitch: function() {
    $(".exercise-div").attr('contenteditable','false');
    this.model.previewModuleSwitch();
    this.$el.find(".exercise-div").children(".answer").val("");
},
​
editModuleSwitch: function() {
    $(".exercise-div").attr('contenteditable','true');
    this.model.editModuleSwitch();
    var answers = this.model.get("answers");
    this.$el.find(".exercise-div").children(".answer").each(function() {
        var id = $(this).attr("data-id");
        $(this).val(answers[id-1]);
    });
},
​
addInput: function(){
    this.model.addInput();
    this.$el.find(".exercise-div").append(this.template1(this.model.toJSON()));
}
​
});
​
$(document).ready(function() {
    ​
	var questionsView = new QuestionsView();
    questionsView.render();
​
});
