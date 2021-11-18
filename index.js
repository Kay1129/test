window.onload = function () {
    function init_label(size) {
        // 单label
        let alphabetList = ['A', 'B', "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        // 双label
        let combinedAlphabetList = [];
        // 填入双label
        for (let item of alphabetList) {
            for (let element of alphabetList) {
                if ((item + element) in combinedAlphabetList == false) {
                    combinedAlphabetList.push(item + element);
                }
            }
        }

        // 合并并生成完整的column label
        let columnLabelList = alphabetList.concat(combinedAlphabetList);
        columnLabelList.unshift(' ');
        columnLabelList = columnLabelList.slice(0, size);

        return columnLabelList
    }

    function init_data(size, columnLabelList) {
        linkedList = [];
        dataList = [];
        idList = [];
        for (let i = 0; i < size; i++) {
            let rowlist = [];
            for (let j = 0; j < size; j++) {
                let value = '';
                rowlist.push(value);
                let id = columnLabelList[j + 1] + (i + 1);
                idList.push(id);
            }
            dataList.push(rowlist);
        }
        return [linkedList, dataList, idList]
    }

    function create_table(container, columnLabelList, dataList) {
        // DOM创建table
        let oTable = document.createElement("table");
        container.appendChild(oTable);
        oTable.setAttribute("border", 1);

        for (let row in dataList) {
            let oTableTr = document.createElement("tr");
            oTable.appendChild(oTableTr);
            for (let column in dataList) {
                let oTableTd = document.createElement("td");
                // 设置单元格宽度
                oTableTr.appendChild(oTableTd);
                oTableTd.setAttribute("width", 60);

                // 设置column label
                if (row == 0) {
                    oTableTd.innerHTML = columnLabelList[column];
                } else if (row != 0 && column == 0) {
                    oTableTd.innerHTML = row;
                } else {
                    oTableTd.innerHTML = dataList[row][column]
                }
            }
        }
    }

    function change_value(dataList, idList, linkedList, columnLabelList) {
        // console.log(id_label_list)
        let oTable = document.getElementsByTagName('table')[0];
        // for遍历筛选除了column title和row title的部分
        for (let row in dataList) {
            for (let column in dataList) {
                if (row != 0 && column != 0) {
                    oTable.rows[row].cells[column].onclick = function (ev) {
                        // 找到事件源，防止事件冒泡
                        let self = ev.target;
                        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;

                        let oInputBox = document.createElement("input");
                        oInputBox.type = "text";
                        oInputBox.value = self.innerHTML;
                        self.innerHTML = "";
                        self.appendChild(oInputBox);

                        let currentPos = [parseInt(row), parseInt(column)];
                        // 如果该单元格有公式，则点击时显示公式
                        oInputBox.onfocus = function () {
                            let isFormat = checkFormat(linkedList,currentPos);
                            if(isFormat != false){
                                oInputBox.value = isFormat;
                            }
                        }
                        oInputBox.focus();
                        oInputBox.onblur = function () {
                            
                            let regFomular = /^=[A-Z]{1,2}(100|[1-9][0-9]|[1-9])(\+|\-|\*|\/)[A-Z]{1,2}(100|[1-9][0-9]|[1-9])/g;
                            let regFunction = /^=(sum|average|min|max|if|count)\([A-Z]{1,2}(100|[1-9][0-9]|[1-9])\:[A-Z]{1,2}(100|[1-9][0-9]|[1-9])\)$/g;


                            // 判断为四则运算
                            if (regFomular.test(oInputBox.value) == true) {
                                let symbol = '';
                                let elementList = [];
                                if (oInputBox.value.indexOf("+") != -1) {
                                    symbol = "+";
                                    elementList = oInputBox.value.split("+");
                                } else if (oInputBox.value.indexOf("-") != -1) {
                                    symbol = "-";
                                    elementList = oInputBox.value.split("-");
                                } else if (oInputBox.value.indexOf("*") != -1) {
                                    symbol = "*";
                                    elementList = oInputBox.value.split("*");
                                } else {
                                    symbol = "/";
                                    elementList = oInputBox.value.split("/");
                                }
                                let element1 = elementList[0].slice(1);
                                let element2 = elementList[1];
                                let valuePosList = calculatePos(idList, element1, element2);
                                // 超出表格范围，默认当做字符串
                                if (valuePosList == -1) {
                                    self.innerHTML = oInputBox.value;
                                    updateData(dataList, currentPos, oInputBox.value);
                                } else {
                                    // let value1Pos = valuePosList[0]
                                    // let value2Pos = valuePosList[1]
                                    linkedList = createLink(linkedList, currentPos, valuePosList, oInputBox.value, symbol);
                                    // console.log(linkedList)
                                    let valueList = loadData(dataList, valuePosList);
                                    // console.log(valueList)
                                    let result = calculate(valueList, symbol);
                                    // console.log(result)
                                    updateData(dataList, currentPos, result);
                                    self.innerHTML = result;
                                    // console.log("yes")
                                }

                            }
                            // 判断基本方程 
                            else if (regFunction.test(oInputBox.value) == true) {
                                let symbol = '';
                                let elementList = [];
                                if (oInputBox.value.indexOf("sum") != -1) {
                                    symbol = "sum";
                                } else if (oInputBox.value.indexOf("average") != -1) {
                                    symbol = "average";
                                } else if (oInputBox.value.indexOf("min") != -1) {
                                    symbol = "min";
                                } else if (oInputBox.value.indexOf("max") != -1) {
                                    symbol = "max";
                                } else {
                                    symbol = "count";
                                }
                                elementList = oInputBox.value.split(":");
                                let element1 = elementList[0].split("(")[1];
                                let element2 = elementList[1].split(")")[0];
                                let valuePosList = calculatePos(idList, element1, element2);
                                // console.log(valuePosList)

                                // 超出表格范围，默认当做字符串
                                if (valuePosList == -1) {
                                    self.innerHTML = oInputBox.value;
                                    updateData(dataList, currentPos, oInputBox.value);
                                } else {
                                    // 分析按行还是按列
                                    // 按行
                                    if (valuePosList[0][0] == valuePosList[1][0]) {
                                        for (let i = 1; i < Math.abs(valuePosList[0][1] - valuePosList[1][1]); i++) {
                                            let minPos = Math.min(valuePosList[0][1], valuePosList[1][1]);
                                            valuePosList.push([valuePosList[0][0], minPos + i]);
                                        }
                                    }
                                    // 按列
                                    if (valuePosList[0][1] == valuePosList[1][1]) {
                                        for (let i = 1; i < Math.abs(valuePosList[0][0] - valuePosList[1][0]); i++) {
                                            let minPos = Math.min(valuePosList[0][0], valuePosList[1][0]);
                                            valuePosList.push([minPos + i, valuePosList[0][1]]);
                                        }
                                    }
                                    // console.log(valuePosList)

                                    linkedList = createLink(linkedList, currentPos, valuePosList, oInputBox.value, symbol);
                                    // console.log(linkedList)
                                    let valueList = loadData(dataList, valuePosList);
                                    // console.log(valueList)
                                    let result = calculate(valueList, symbol);
                                    // console.log(result)
                                    updateData(dataList, currentPos, result);
                                    self.innerHTML = result;
                                    // console.log("yes")
                                }

                            } else {
                                self.innerHTML = oInputBox.value;
                                updateData(dataList, currentPos, oInputBox.value);
                                // console.log(linkedList)
                                let updateList = checkLink(linkedList, currentPos);
                                console.log("the update link list is: ", updateList);
                                if (updateList.length != 0) {
                                    for (let item of updateList) {
                                        // let item1 = item
                                        // console.log(item)
                                        // console.log(item1[1])
                                        // console.log(item1[3])
                                        let updateValueList = loadData(dataList, item[1]);
                                        console.log("the update value are: ", updateValueList);
                                        // console.log(item1[3])
                                        let result = calculate(updateValueList, item[3]);
                                        console.log("the result is: ", result);
                                        updateData(dataList, item[0], result);
                                        // console.log(dataList)
                                        oTable.rows[item[0][0]].cells[item[0][1]].innerHTML = result;
                                    }
                                }
                                console.log(dataList);
                            }
                        }

                    }
                }
            }
        }
    }

    function calculatePos(idList, value1, value2) {
        if (idList.indexOf(value1) != -1 && idList.indexOf(value2) != -1) {
            let value1Pos = idList.indexOf(value1);
            let value1Row = Math.floor(value1Pos / 100) + 1;
            let value1Column = value1Pos % 101 + 1;

            let value2Pos = idList.indexOf(value2);
            let value2Row = Math.floor(value2Pos / 100) + 1;
            let value2Column = value2Pos % 101 + 1;

            return [
                [value1Row, value1Column],
                [value2Row, value2Column]
            ]
        }
        // 公式上的单元格超出表格范围，找不到此单元格返回-1
        else {
            return -1
        }
    }

    function updateData(dataList, currentPos, value) {
        // console.log(currentPos)
        dataList[currentPos[0]][currentPos[1]] = value;
    }

    function createLink(linkedList, currentPos, valuePosList, formula, symbol) {
        // console.log(currentPos, valuePosList, formula, symbol)
        linkedList.push([currentPos, valuePosList, formula, symbol]);
        console.log("the linked list is: ", linkedList);
        return linkedList
    }

    function loadData(dataList, valuePosList) {
        let valueList = [];
        // console.log(valuePosList)
        for (let item of valuePosList) {
            valueList.push(dataList[item[0]][item[1]]);
        }
        return valueList
    }

    function calculate(valueList, symbol) {
        // console.log(symbol)
        result = 0;
        let numList = [];
        for (let item of valueList) {
            if (isNaN(item) == false) {
                if (item == "") {
                    item = 0;
                }
                numList.push(parseInt(item));
            }
        }
        // console.log(numList)
        if (symbol == "+") {
            // 加法允许忽略字符串
            // 不输入值默认为0
            for (let item of numList) {
                result += item;
            }
        } else if (symbol == "-") {
            // 不输入值默认为0
            if (numList.length == valueList.length) {
                for (let item of numList) {
                    result += item;
                }
                result = numList[0] * 2 - result;
            } else {
                result = "NaN"
            }
        } else if (symbol == "*") {
            // 不输入值默认为0
            result = 1
            if (numList.length == valueList.length) {
                for (let item of numList) {
                    result *= item;
                }
            } else {
                result = "NaN";
            }
        } else if (symbol == "/") {
            // 不输入值默认为0
            result = 1
            if (numList.length == valueList.length) {
                for (let item of numList) {
                    result *= item;
                }
                result = (numList[0] * 2 / result).toFixed(2);
            } else {
                result = "NaN";
            }
        } else if (symbol == "sum") {
            // 求和允许忽略字符串
            // 不输入值默认为0
            // console.log('yes')
            for (let item of numList) {
                if (isNaN(item) == false) {
                    result += item;
                }
            }
        } else if (symbol == "average") {
            // 不输入值默认不包括
            count = 0;
            for (let item of valueList) {
                item = parseInt(item);
                if (isNaN(item) == false) {
                    result += item;
                    count += 1;
                }
            }
            result = (result / count).toFixed(2);
        } else if (symbol == "min") {
            // 不允许出现空字符和字符串
            // 数字和字符串比较永远返回数字
            if (numList.length == 0) {
                result = "NaN";
            } else {
                let min = valueList[0]
                for (let item of valueList) {
                    item = parseInt(item);
                    if (item != 'NaN') {
                        min = Math.min(min, item);
                    }

                }
                result = min
            }

        } else if (symbol == "max") {
            if (numList.length == 0) {
                result = "NaN";
            } else {
                let max = valueList[0];
                for (let item of valueList) {
                    item = parseInt(item);
                    if (item != 'NaN') {
                        max = Math.max(max, item);
                    }

                }
                result = max;
            }
        } else {
            // count只包括数字
            for (let item of valueList) {
                item = parseInt(item);
                if (isNaN(item) == false) {
                    result += 1;
                }
            }

        }
        console.log("the result is: ", result);
        return result
    }

    function checkFormat(linkedList, currentPos) {
        let isFormat = false;
        if (linkedList.length == 0) {
            return isFormat
        } else {
            for (index in linkedList) {
                if (currentPos[0] == linkedList[index][0][0] && currentPos[1] == linkedList[index][0][1]) {
                    isFormat = true;
                    return linkedList[index][2]
                }
            }
            return false
        }
    }

    function checkLink(linkedList, currentPos) {
        // console.log(currentPos)
        // console.log(linkedList)
        let returnLinkList = [];
        if (linkedList.length != 0) {
            for (index in linkedList) {
                // 被绑定的单元格，解除绑定
                if (currentPos[0] == linkedList[index][0][0] && currentPos[1] == linkedList[index][0][1]) {
                    alert("release the cell");
                    linkedList.splice(index, 1);
                }
                console.log("the linked list is:", linkedList)
            }
            for (index in linkedList) {
                // 绑定其他的单元格,重新计算其数值
                for (index1 in linkedList[index][1]) {
                    if (currentPos[0] == linkedList[index][1][index1][0] && currentPos[1] == linkedList[index][1][index1][1]) {
                        returnLinkList.push(linkedList[index]);
                    }
                }
            }
            return returnLinkList
        } else {
            return returnLinkList
        }
    }

    function refresh() {
        console.log("refresh now");
        let oTable = document.getElementsByTagName("table")[0];
        oTable.parentNode.removeChild(oTable);
    }



    function main() {
        let oTableContainer = document.getElementsByClassName("tableContainer")[0];
        let oRefreshBtn = document.getElementById("refreshBtn");
        let oBoldBtn = document.getElementById("boldBtn");
        let oItalicBtn = document.getElementById("italicBtn");
        let oUnderlineBtn = document.getElementById("underlineBtn");
        let tableSize = 100;

        let columnLabelList = init_label(tableSize + 1);
        console.log(columnLabelList);

        let dataGroup = init_data(tableSize + 1, columnLabelList);
        let linkedList = dataGroup[0];
        let dataList = dataGroup[1];
        let idList = dataGroup[2];
        console.log(linkedList, dataList, idList);

        create_table(oTableContainer, columnLabelList, dataList);
        change_value(dataList, idList, linkedList, columnLabelList);


        oRefreshBtn.onclick = function () {
            refresh();
            create_table(oTableContainer, columnLabelList, dataList);
            change_value(dataList, idList, linkedList, columnLabelList);
        }

        oBoldBtn.onclick = function () {
            let oTable = document.getElementsByTagName('table')[0];
            oTable.style.fontWeight = 'bold';
        }

        oItalicBtn.onclick = function () {
            let oTable = document.getElementsByTagName('table')[0];
            oTable.style.fontStyle = 'italic';
        }

        oUnderlineBtn.onclick = function () {
            let oTable = document.getElementsByTagName('table')[0];
            oTable.style.textDecoration = 'underline';
        }
    }

    main()
}