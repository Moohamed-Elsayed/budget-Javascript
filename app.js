
// BUDGET CONTROLLER
let budgetController = (function () {


    let Expense = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        totalIncome > 0 ? this.percentage = Math.round((this.value / totalIncome) * 100) : this.percentage = -1;
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    let Income = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
    }


    // sum value  for inc and  exp
    let calculateTotal = function (type) {
        let sum = 0;

        data.allItem[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.allTotal[type] = sum;

    }

    // data used storage  exp and inc and budget and percentage
    let data = {
        allItem: {
            exp: [],
            inc: []
        },
        allTotal: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }


    // public
    return {

        addItem: function (type, desc, value) {

            let newItem, ID;


            // [1 2 3 4 5] nextId = 6
            // [1 2 4 6 8] nextId = 9
            // ID = lastid +1;


            //create new ID
            data.allItem[type].length > 0 ? ID = data.allItem[type][data.allItem[type].length - 1].id + 1 : ID = 0;


            // create  new item based  on 'inc', 'exp' type
            type == 'exp' ? newItem = new Expense(ID, desc, value) : newItem = new Income(ID, desc, value);

            //Push it into our  data structue
            data.allItem[type].push(newItem);

            // return new item
            return newItem;
        },

        deleteItem: function (type, id) {

            var ids, index;

            // id =6
            //data.allItem[type][id]; not work becouse not valid index 6
            //[1 2 4 6 8]
            //index = 3
            ids = data.allItem[type].map(function (current) {
                return current.id;
            });
            // ids = [1 2 4 6 8];
            index = ids.indexOf(id);
            // index = 3

            if (index !== -1) {
                data.allItem[type].splice(index, 1);
            }


        },

        // calculate budget  total exp and inc and budget and percentage
        calculateBudget: function () {
            // calculate total income and expenses.
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget incone - expenses.
            data.budget = data.allTotal.inc - data.allTotal.exp;
            // calculate the  percentage of income that we spent
            if (data.allTotal.inc > 0) {
                // becouse  90/0 infinty (error )
                data.percentage = Math.round((data.allTotal.exp / data.allTotal.inc) * 100);
            } else
                data.percentage = -1;
            // ? Ex : exp =100 and inc =300 spent = 33.333  100/300 = 0.33.333 *100 = 33.33% round = 33%

        },

        calaculatePercentage: function () {
            /**
             * a=10, b=20, c=30
             * incame = 100
             * 10/100= 10%
             * 20/100= 20%
             * 30/100=30%
             */

            data.allItem.exp.forEach(function (cur) {
                cur.calcPercentage(data.allTotal.inc);
            });


        },

        getPercentages: function () {
            const allPerc = data.allItem.exp.map(function (cur) {
               return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.allTotal.inc,
                totalExp: data.allTotal.exp,
                percentage: data.percentage
            }
        },

        test: function () {
            console.log(data);
        }

    }
})();

// UI CONTROLLER
let UIController = (function () {

    // private
    let DOMstring = {
        inputType: '.add__type',
        inputDesacription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContenier: '.income__list',
        expenseContenier: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percemtageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    }

     let  formatNumber = function(num, type) {
        /**
         *  - or +  befour number
         * exavtyle 2 decimal  point
         * comma separating the thousand 
         * 
         * 2310.456 -> + 2,310.46 (round)
         * 2000 -> + 2,000.00
         * 
         */ 
        let numSplit, int, dec;
         num = Math.abs(num);
         num = num.toFixed(2);//"222.00"  String

         numSplit = num.split('.');

         int = numSplit[0];

         if(int.length > 3)
         {
             if(int.length > 5)
             {
                int =int.substr(0,int.length-6) +','+int.substr(int.length-3, 3) + ','+int.substr(int.length-6, 3); //23,
             }else{
             int =int.substr(0,int.length-3) +','+int.substr(int.length-3, 3); //23,
             }
         }
         dec = numSplit[1];

         return (type === 'exp' ? '-' : '+') +' ' + int + '.'+ dec ;

    };

    
    let nodeListForEach = function(list,callback){

        for (let index = 0; index < list.length; index++) {
            callback(list[index],index);    
        }
    };

    return {
        getInput: function () {
            return {
                // return object
                type: document.querySelector(DOMstring.inputType).value,//will be either inc or exp
                description: document.querySelector(DOMstring.inputDesacription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            };
        },


        addLitstItem: function (obj, type) {
            let html, newHtml, element;

            // Create HTML  String with  placeHolder text
            if (type === 'inc') {
                element = DOMstring.incomeContenier;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>';
            }
            else if (type === 'exp') {
                element = DOMstring.expenseContenier;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div></div>';
            }

            //Replace the placeHolder text  with some actual date
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber( obj.value,type));
            //insert the  HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('afterend', newHtml);



        },


        deleteListItem: function (selectorId) {
            let el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        // clear all fields in screan after enter.
        clearFields: function () {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstring.inputDesacription + ', ' + DOMstring.inputValue);
            // fields.slice(); not work becouse querySelectorAll have  in array

            fieldsArr = Array.prototype.slice.call(fields);

            //forEach can used three argment curent , index ,array
            fieldsArr.forEach(function (curent) {
                curent.value = "";
            });

            fieldsArr[0].focus();

        },


        // display  all budget in screan.
        displayBudget: function (obj) {
            let type ;
            obj.budget > 0 ? type ='inc' : type = 'exp';
            let persentageDOM = document.querySelector(DOMstring.percemtageLabel);
            document.querySelector(DOMstring.budgetLabel).textContent =formatNumber(obj.budget, type);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expensesLabel).textContent = formatNumber( obj.totalExp, 'exp');
            obj.percentage > 0 ? persentageDOM.textContent = obj.percentage + '%' : persentageDOM.textContent = '---';  

        },

        // * v.v.v.v.import
        displayPercentage:function(precentage){

                let fields =document.querySelectorAll(DOMstring.expensesPercLabel);

                nodeListForEach(fields,function (current,index) {
                    
                    precentage[index] > 0 ? current.textContent = precentage[index] + '%' : current.textContent ='---';

                })



        },

        displayMonth:function () {
            let now, months, month , year;
            now =new Date();
            // now = new Date(2016, 11, 25);
            year = now.getFullYear();
            months =['January', 'Februaty', 'March', 'April', 'May', 'June', 'July', 'August', 'september', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMstring.dateLabel).textContent = months[month]  +' '+ year;
            console.log(month); // 0 for 11 
        },


        changedType: function(){
            let field = document.querySelectorAll(
                DOMstring.inputType + ','+
                DOMstring.inputDesacription + ','+
                DOMstring.inputValue 
            );

            nodeListForEach(field,function(cur){

                cur.classList.toggle('red-focus'); 
            });
            document.querySelector(DOMstring.inputBtn).classList.toggle('red');
        },
    

        // return all DOM class
        getDOMstring: function () {
            return DOMstring;
        }


    }
})();


// GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {

    let setupEventListener = function () {
        let DOM = UICtrl.getDOMstring();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            // event.which for brouser old
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }

    let updateBudget = function () {
        let budget;
        // 1.Calculate the budget
        budgetCtrl.calculateBudget();
        // 2.Return the budget
        budget = budgetCtrl.getBudget();
        // 3.Display the budget  on the UI
        UICtrl.displayBudget(budget);


    }

    let updatePresantage = function () {
        let percentage;
        // 1.Calculate Persentage
        budgetCtrl.calaculatePercentage();
        // 2.Read percentage fron the budget Conteoll
        percentage = budgetCtrl.getPercentages();
        // 3.Update the  UI with the new percentages 
       UICtrl.displayPercentage(percentage);
    };
    let ctrlAddItem = function () {
        let input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the  item  to the  UI
            UICtrl.addLitstItem(newItem, input.type);
            // 4. clear fields all
            UICtrl.clearFields();
            // 5. Calculate and Update budget
            updateBudget();
            // 6.Calculate and update percentages
            updatePresantage();
        }
    };

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // primative convert object
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // 1. delete the item from the  dtat structure.
        budgetCtrl.deleteItem(type, ID);

        // 2.Delete the item from the Ui.
        UICtrl.deleteListItem(itemID);

        // 3. Update and show the new budget.
        updateBudget();

        // 6.Calculate and update percentages
        updatePresantage();
    };

    // public
    return {
        init: function () {
            UICtrl.displayBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                }
              
            );
            UICtrl.displayMonth(); 
            setupEventListener();

        }
    }

})(budgetController, UIController);


controller.init();
