var view = {
    displayMessage: function (msg) {
        var messageArea = document.getElementById('messageArea');
        messageArea.innerHTML = msg;
    },
    displayHit: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute('class', 'hit');
    },
    displayMiss: function (location) {
        var cell = document.getElementById(location);
        cell.setAttribute('class', 'miss');
    }
    //setAttribute(,)添加指定的属性，并为其赋指定的值。
};
var model = {
    boardSize: 7,//游戏板网格的大小
    numShips: 3,//游戏包含的战舰数
    shipLength: 3,//每艘战舰占多少个单元格
    shipsSunk: 0,//初始化为0，当前击沉了多少艘战舰
    //生成战舰的占据的单元格位置
    //hits战舰位置，和击中的部位
    ships: [
        {
            locations: [0, 0, 0],
            hits: ['', '', '']
        },

        {
            locations: [0, 0, 0],
            hits: ['', '', '']
        },

        {
            locations: [0, 0, 0],
            hits: ['', '', '']
        }
    ],
    //guess 攻击战舰的位置
    fire: function (guess) {
        for (var i = 0; i < this.numShips; i++) {
            var ship = this.ships[i];//取model.ships的第 i 数组，获取战舰位置
            var index = ship.locations.indexOf(guess);//如果取不到战舰位置，guess!=locations[,,]，indexOf返回-1，跳出for循环
            //indexOf() 返回某个指定的字符串值在字符串中首次出现的位置。返回number
            if (index >= 0) {
                ship.hits[index] = 'hit';//ships.hits['','',''],在''里给'hit'
                view.displayHit(guess);
                view.displayMessage('HIT!');
                if (this.isSunk(ship)) {//如果 this.isSunk(ship) 的返回值=ture,进入if()
                    view.displayMessage('You sank my battleship!');
                    this.shipsSunk++;//增加当前击中战舰数
                }
                return true;
                //击中了战舰！
            }
        }
        view.displayMiss(guess);
        view.displayMessage('You missed.');
        return false;
        //未击中战舰！
    },
    isSunk: function (ship) {
        for (var i = 0; i < this.shipLength; i++) {//如果ships.hits['hit','hit','hit']跳出循环，返回true
            if (ship.hits[i] !== 'hit') {
                return false;
            }
        }
        return true;
    },
    generateShipLocations: function () {
        var locations;
        for (var i = 0; i < this.numShips; i++) {
            do {
                locations = this.generateShip();
            } while (this.collision(locations));// 返回true循环下面的代码
            this.ships[i].locations = locations;
        }
    },
    generateShip: function () {
        var direction = Math.floor(Math.random() * 2);
        //floor() 方法可对一个数进行下舍入
        //random() 方法可返回介于 0 ~ 1 之间的一个随机数。
        //boardSize: 7
        //shipLength: 3
        var row, col;
        if (direction === 1) {
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
        } else {
            row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
            col = Math.floor(Math.random() * this.boardSize);
        }
        var newShipLocations = [];
        for (var i = 0; i < this.shipLength; i++) {
            if (direction === 1) {
                newShipLocations.push(row + '' + (col + i));//横的战舰，行的位置+列的位置++
            } else {
                newShipLocations.push((row + i) + '' + col);
            }
        }
        return newShipLocations;
    },
    collision: function (locations) {
        for (var i = 0; i < this.numShips; i++) {
            var ship = model.ships[i];
            for (var j = 0; j < locations.length; j++) {
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }

};
//将用户输入的'ABCDEFG'转换成'0123456'，然后进行拼接
function parseGuess(guess) {
    var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    if (guess === null || guess.length !== 2) {//如果玩家输入的 数字不等于2 or 输入空值，弹出提示框
        alert('Oops, please enter a letter and a number on the board.');
    } else {
        firstChar = guess.charAt(0);//firstChar=guess值里的第一个字符
        //charAt() 方法可返回指定位置的字符。
        var row = alphabet.indexOf(firstChar);//row存'ABCDEFG'对应的位置，如alphabet.indexOf(A)返回0，row=0
        var column = guess.charAt(1);//column存guess值里的第二个字符
        if (isNaN(row) || isNaN(column)) {//isNaN() 函数用于检查其参数是否是非数字值。
            alert("Oops, that isn't on the board.");//都是数字返回false，向下执行
        } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {//小于0大于6，给弹窗
            alert("Oops, that's off the board!");
        } else {
            return row + column;//返回 'ABCDEFG'所对应的'0123456' + guess值里的第二个数字
        }
    }
    return null;
}
var controller = {
    guesses: 0,
    processGuess: function (guess) {
        var location = parseGuess(guess);
        if (location) {//parseGuess 不返回 null，进入if
            this.guesses++;
            var hit = model.fire(location);//hit 存 ture or false
            if (hit && model.shipsSunk === model.numShips) {//hit and 战舰数 全等于 被击中战舰的数目 都为true 执行代码            
                view.displayMessage('You sank all my battleships, in ' + this.guesses + 'guesses')
            }
        }
    }
};
function init() {
    //Fire按钮事件
    var fireButton = document.getElementById('fireButton');
    fireButton.onclick = handleFireButton;
    //文本框事件
    var guessInput = document.getElementById('guessInput');
    guessInput.onkeypress = handleKeyPress;
    model.generateShipLocations();
    //作弊按钮事件
    var cheatButton = document.getElementById('cheat');
    cheatButton.onclick = cheat;
    //文本框获得焦点，不显示作弊
    guessInput.onfocus = focus;
    //网页加载完，编辑框自动获得焦点
    document.getElementById('guessInput').focus();
}
function handleFireButton() {
    var guessInput = document.getElementById('guessInput');
    var guess = guessInput.value;//获取文本框value的内容
    controller.processGuess(guess);
    guessInput.value = '';
}
function handleKeyPress(e) {
    var fireButton = document.getElementById('fireButton');
    if (e.keyCode === 13) {
        fireButton.click();
        return false;
    }
}
//作弊
function cheat() {
    for (var a = 0; a < model.shipLength; a++) {
        var arry = model.ships[a].locations;
        var hitmiss = model.ships[a].hits;
        for (var i = 0; i < arry.length; i++) {
            var value = arry[i];
            var inner = document.getElementById(value);
            inner.setAttribute("style", "background: url('ship.png') no-repeat center center;")
            var ifhit = hitmiss[i];
            if (ifhit == 'hit') {
                inner.style = "background: url('ship.png') no-repeat center center;filter: hue-rotate(220deg);";
            } else {
                inner.style = "background: url('ship.png') no-repeat center center;filter: opacity(30%);";
            }
        }

    }
}
//文本框获得焦点，不显示作弊
function focus() {
    for (var a = 0; a < model.shipLength; a++) {
        var arry = model.ships[a].locations;
        for (var i = 0; i < arry.length; i++) {
            var value = arry[i];
            var obj = document.getElementById(value)
            obj.style.background = "";
            obj.style.filter = '';
        }
    }
}
window.onload = init;