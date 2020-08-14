var budgetController = (function () {

    // NOTE - factory functions 

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    // FUNCTION - adding a method that calculate the percentage

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    // FUNCTION - adding a method to get the percentage 

    Expense.prototype.getPercentage = function () {
        return this.percentage
    };

    // NOTE - OUR DATA

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    // FUNCTION - calculate total 

    var calculateTotal = (type) => {
        var sum = 0;

        data.allItems[type].forEach(e => sum += e.value);
        data.totals[type] = sum;
    }

    return {

        // FUNCTION - adding new item

        addItem: (type, description, value) => {

            var newItem, ID;

            // NOTE creating id 

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }

            // NOTE - adding new item 

            if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            } else if (type === 'inc') {
                newItem = new Income(ID, description, value);
            }

            data.allItems[type].push(newItem);

            // NOTE - returning the item 

            return newItem
        },

        // FUNCTION - calculate the budget 

        calculateBudget: () => {

            // NOTE - calculate total (income and expenses) ;

            calculateTotal('inc');
            calculateTotal('exp');

            // NOTE - calculate the budget (income - expenses) 

            data.budget = data.totals.inc - data.totals.exp;

            // NOTE - calculate the percentage 
            // NOTE - we set an if statement cuz we can't devide by 0 , it gives us infinity .
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1
            }
        },

        // FUNCTION - calculate the percentages  

        calculatePercentages: () => {

            data.allItems.exp.forEach(cur => cur.calcPercentage(data.totals.inc));
        },

        // FUNCTION - get the percentages  

        getPercentages: () => {
            var allPerc = data.allItems.exp.map((el) => {
                return el.getPercentage();
            })
            return allPerc
        },

        // FUNCTION - deleting item from datd struture 
        deleteItem: (type, id) => {

            console.log(id);
            var IDs, index;

            // NOTE - retrieve the index of the item that we want to delete 

            IDs = data.allItems[type].map((e) => e.id);
            console.log(IDs);
            index = IDs.indexOf(id);
            console.log(index);

            // NOTE - deleting item 

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        test: () => data,

        // FUNCTION - returning the budget data 
        getBudget: () => {
            return {
                TotalInc: data.totals.inc,
                TotalExp: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        }

    }
})();




var UIController = (() => {

    // VAR - saving DOM classes in vars 
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        yearNonth: '.budget__title--month'
    };
    // FUNCTION - formatting Strings 
    formatStrings = (num, type) => {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    // FUNCTION - used to loop through our nodelist
    var NodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }
    return {

        // FUNCTION - selecting input values 

        getinput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },

        // FUNCTION - add items to list 

        addListItem: (object, type) => {
            // NOTE - creating the html string with placeholder text 
            var html, newHtml;
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // NOTE - replace the placeholder with actual data 

            newHtml = html.replace('%id%', object.id)
            newHtml = newHtml.replace('%description%', object.description)
            newHtml = newHtml.replace('%value%', formatStrings(object.value, type))

            // NOTE - insert the HTML into the DOM 

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        // FUNCTION - delete item from list 

        deleteListItem: (selectorID) => {
            var el;
            // NOTE - selecting the element 
            el = document.getElementById(selectorID);
            // NOTE - selecting the element's parent and then passing the child to be removed 
            el.parentNode.removeChild(el);
        },

        // FUNCTION - clearing all fields 

        clearFields: () => {
            var fields, fieldsArr;
            // NOTE - selecting all the values (node list) 

            fields = document.querySelectorAll(DOMstrings.inputDesc + ',' + DOMstrings.inputValue);

            // NOTE - node-list to array

            fieldsArr = Array.prototype.slice.call(fields);

            // NOTE - setting input Values to empty ''

            fieldsArr.forEach(e => e.value = '');

            // NOTE - after we hit enter we make the DESCRIOTION IN FOCUS

            fieldsArr[0].focus();
        },

        // FUNCTION - display budget on UI 

        displayBudget: (obj) => {

            var type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatStrings(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.TotalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.TotalExp;

            // NOTE - avoiding showing the -1 to the user 
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        // FUNCTION - display the percentages 
        displayPercentages: (percentages) => {

            // NOTE  - our nodeList 
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            console.log(fields);

            NodeListForEach(fields, function (cur, ind) {

                if (percentages[ind] > 0) {
                    cur.textContent = percentages[ind] + '%';
                } else {
                    cur.textContent = '---';
                }
            });
        },

        displayDate: () => {
            var now, year, month;

            now = new Date;
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.yearNonth).textContent = year + ' / ' + month;
        },

        // FUNCTION - changing input focus 

        changeFocus: () => {
            // NOTE - selecting fields 
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue
            );

            NodeListForEach(fields, (cur) => {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },


        // FUNCTION - making DOMstrings public for the controller to use ;
        DOMclasses: () => DOMstrings
    }
})();



var Controller = ((budgetCtrl, UI) => {

    // FUNCTION SETTING UP EVENTLISTENERS 

    var events = () => {

        // NOTE GET DOM CLASSES ;

        DOM = UI.DOMclasses();

        // NOTE ADD ITEM ON CLICK

        document.querySelector(DOM.inputBtn).addEventListener('click', budgetCtrlAddItem);

        // NOTE ADD ITEM ON ENTER PRESS
        document.addEventListener('keypress', (e) => {
            if (e.keyCode === 13 || e.which === 13) {
                budgetCtrlAddItem();
            }
        })
        // NOTE - add event listener to delete items 
        document.querySelector(DOM.container).addEventListener('click', budgetCtrlDeleteItem);

        // NOTE - add event listener to change input focus color 
        document.querySelector(DOM.inputType).addEventListener('change', UI.changeFocus);
    }

    // FUNCTION - update the budget function 

    var updateBudget = () => {

        // TODO - calculate the budget 
        budgetCtrl.calculateBudget()

        // TODO - return the budget
        var budget = budgetCtrl.getBudget();

        // TODO - Display the budget on the UI 

        UI.displayBudget(budget);
    }

    // FUNCTION - updating the percentages 

    updatePercentages = () => {

        // NOTE - calculate percentages 
        budgetCtrl.calculatePercentages();

        // NOTE - read percentages from budget controller 
        var percentages = budgetCtrl.getPercentages();

        // NOTE - update the percentages in the UI 
        UI.displayPercentages(percentages);
    }


    // FUNCTION - ADD ITEM

    var budgetCtrlAddItem = () => {

        // TODO - GET DATA FROM FIELD  

        var input = UI.getinput();

        // NOTE - checking if input is valid 

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // TODO - add the new item to the budget controller

            newItem = budgetController.addItem(input.type, input.description, input.value);

            // TODO - add the item to the UI 

            UI.addListItem(newItem, input.type);

            UI.clearFields();

            // NOTE - calculating and upating the budget 

            updateBudget()

            // NOTE - calculate and update percentages 

            updatePercentages();
        }

    }

    // FUNCTION - DELETE ITEM 

    var budgetCtrlDeleteItem = (eventObject) => {
        var itemId, splitId, type, id;

        // NOTE - selecting the element id 

        itemId = eventObject.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            console.log(type, '----', id);

            // NOTE - delete item from our data structure 

            budgetCtrl.deleteItem(type, id);

            // NOTE - delete item from UI 

            UI.deleteListItem(itemId);

            // NOTE - updating the UI (we are going to reuse the update budget method)

            updateBudget();

            // NOTE - calculate and update percentages 

            updatePercentages();
        }
    }

    return {
        // FUNCTION - init function 
        init: () => {

            UI.displayDate();
            events();

            // NOTE - using the DISPLAY BUDGET function and passing a emty budget object to reset everything to 0

            UI.displayBudget({
                TotalInc: 0,
                TotalExp: 0,
                budget: 0,
                percentage: -1
            })

            console.log('initiating..... done !');
        }
    }

})(budgetController, UIController);



// NOTE initiating !
Controller.init();