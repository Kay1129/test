window.onload = function () {
    function init_label() {
        // 单label
        let column_single_label_list = ['A', 'B', "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        // 双label
        let column_double_label_list = [];
        for (let i = 0; i < column_single_label_list.length; i++) {
            for (let j = 0; j < column_single_label_list.length; j++) {
                if ((column_single_label_list[i] + column_single_label_list[j]) in column_double_label_list == false) {
                    column_double_label_list.push(column_single_label_list[i] + column_single_label_list[j]);
                }
            }
        }
        // for (let i = 0; i < column_double_label_list.length; i++) {
        //     console.log(column_double_label_list[i]);
        // }

        // 合并并生成完整的column label
        var column_label_list = column_single_label_list.concat(column_double_label_list);
        column_label_list.unshift(' ');
        column_label_list = column_label_list.slice(0, 101);
        for (let i = 0; i < 100; i++) {
            // console.log(column_label_list[i]);
        }
        return column_label_list
    }

    function create_table(column_label_list, saved_data) {
        // 得到外层div
        let tableArea = document.getElementsByClassName("tableArea")[0];
        // DOM创建table
        let oTable = document.createElement("table");
        tableArea.appendChild(oTable);
        oTable.setAttribute("border", 1)
        for (let i = 0; i < 101; i++) {
            let oTable_tr = document.createElement("tr");
            oTable.appendChild(oTable_tr);
            for (let j = 0; j < 101; j++) {
                let oTable_td = document.createElement("td");
                // 设置单元格宽度
                oTable_tr.appendChild(oTable_td);
                oTable_td.setAttribute("width", 60);

                // 设置column label
                if (i == 0) {
                    oTable_td.innerHTML = column_label_list[j];
                } else if (i != 0 && j == 0) {
                    oTable_td.innerHTML = i;
                } else {
                    // let oInputBox = document.createElement("input")
                    // oTable_td.appendChild(oInput)
                    if (saved_data[i][j].value != "") {
                        oTable_td.innerHTML = saved_data[i][j].value;
                    } else {
                        oTable_td.innerHTML = "";
                    }
                    // oTable_td.innerHTML=''

                }
            }
        }
    }

    function change_value(saved_data, id_label_list, simple_link_list,hard_link_list,column_label_list) {
        // console.log(id_label_list)
        let oTable = document.getElementsByTagName('table')[0];
        // for遍历筛选除了column title和row title的部分
        for (let i = 0; i < 101; i++) {
            for (let j = 0; j < 101; j++) {
                if (i != 0 && j != 0) {
                    oTable.rows[i].cells[j].onclick = function (ev) {
                        // 找到事件源，防止事件冒泡
                        var self = ev.target;
                        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;

                        var oInputBox = document.createElement("input");
                        oInputBox.type = "text";
                        oInputBox.value = self.innerHTML;
                        self.innerHTML = "";
                        self.appendChild(oInputBox);

                        oInputBox.focus();


                        // document.onclick = function () {
                        //     // console.log(self.innerHTML)
                        //     self.innerHTML = oInputBox.value;
                        //     // console.log(self.innerHTML)
                        //     saved_data[i - 1][j - 1].value = oInputBox.value;
                        //     console.log(oInputBox.value)
                        //     console.log(saved_data)
                        //     // 点击其他地方结束input，并只允许操作一次
                        //     document.onclick = '';
                        // }

                        // if (oInputBox.blur() == true) {
                        //     console.log("yes")
                        //     // console.log(self.innerHTML)
                        //     self.innerHTML = oInputBox.value;
                        //     // console.log(self.innerHTML)
                        //     saved_data[i - 1][j - 1].value = oInputBox.value;
                        //     console.log(oInputBox.value)
                        //     console.log(saved_data)
                        // }

                        oInputBox.onblur = function () {

                            // 判断是否调用第一个功能
                            if (oInputBox.value.indexOf("=") != -1 && oInputBox.value.indexOf("+") != -1) {
                                let value_data = oInputBox.value.split("+");
                                // console.log(id_label_list)
                                value_data[0] = value_data[0].slice(1);
                                if (id_label_list.indexOf(value_data[0]) != -1 && id_label_list.indexOf(value_data[1]) != -1) {
                                    // console.log('yes')
                                    let value1_pos = id_label_list.indexOf(value_data[0]);
                                    let value1_column = Math.ceil(value1_pos / 100);
                                    let value1_row = value1_pos % 101;

                                    let value2_pos = id_label_list.indexOf(value_data[1]);
                                    let value2_column = Math.ceil(value2_pos / 100);
                                    let value2_row = value2_pos % 101;

                                    let current_link = {
                                        current_value: [i, j],
                                        v1: [value1_row, value1_column],
                                        v2: [value2_row, value2_column]
                                    }
                                    simple_link_list.push(current_link);
                                    console.log(simple_link_list);
                                    let result = auto_simple_sum(saved_data, current_link);

                                    self.innerHTML = result;
                                    saved_data[i][j].value = parseInt(result);
                                } else {
                                    alert("the formula is incorrect. please check it again");
                                }
                                console.log(value_data);
                            } 
                            // 判断是否调用第二个功能
                            else if(oInputBox.value.indexOf("=") != -1 && oInputBox.value.indexOf(":") != -1 && oInputBox.value.indexOf("(") != -1 && oInputBox.value.indexOf(")") != -1 && oInputBox.value.indexOf("sum") != -1){
                                // console.log("fun2 yes")
                                let value_data = oInputBox.value.split(":");
                                value_data[0] = value_data[0].split("(")[1];
                                value_data[1] = value_data[1].split(")")[0];
                                // console.log(value_data[0],value_data[1])
                                if (id_label_list.indexOf(value_data[0]) != -1 && id_label_list.indexOf(value_data[1]) != -1){
                                    // console.log('ok')
                                    let started_value_pos = id_label_list.indexOf(value_data[0]);
                                    let started_value_column = Math.ceil(started_value_pos / 100);
                                    let started_value_row = started_value_pos % 101;

                                    let ended_value_pos = id_label_list.indexOf(value_data[1]);
                                    let ended_value_column = Math.ceil(ended_value_pos / 100);
                                    let ended_value_row = ended_value_pos % 101;

                                    // 判断按行求和还是按列求和
                                    let started_value_num = value_data[0].match(/\d+/g)[0];
                                    let ended_value_num = value_data[1].match(/\d+/g)[0];
                                    console.log(started_value_num,ended_value_num);

                                    let started_value_str = value_data[0].split(started_value_num)[0];
                                    let ended_value_str = value_data[1].split(ended_value_num)[0];
                                    console.log(started_value_str,ended_value_str);

                                    if(started_value_num == ended_value_num){
                                        // 按行
                                        let current_link = {};
                                        current_link.current_value = [i,j];
                                        let link_list = [];
                                        let length = column_label_list.indexOf(ended_value_str) - column_label_list.indexOf(started_value_str);
                                        for(let index =0; index<length+1; index++){
                                            link_list.push([started_value_row, started_value_column+index]);
                                        }
                                        current_link.link_data = link_list;
                                        let result = auto_hard_sum(saved_data,current_link);
                                        hard_link_list.push(current_link);
                                        console.log(hard_link_list);
                                        self.innerHTML = result;
                                        saved_data[i][j].value = parseInt(result);
                                    } 
                                    else{
                                        // 按列
                                        let current_link = {};
                                        current_link.current_value = [i,j];
                                        let link_list = [];
                                        for(let index =0; index<(ended_value_num-started_value_num+1); index++){
                                            link_list.push([started_value_row+index, started_value_column]);
                                        }
                                        current_link.link_data = link_list;
                                        let result = auto_hard_sum(saved_data,current_link);
                                        hard_link_list.push(current_link);
                                        console.log(hard_link_list);
                                        self.innerHTML = result;
                                        saved_data[i][j].value = parseInt(result);
                                    }

                                }
                            }
                            else if (isNaN(oInputBox.value) == true) {
                                alert("the formula is incorrect. please check it again");
                            } else {
                                // console.log(self.innerHTML)
                                self.innerHTML = oInputBox.value;
                                // console.log(self.innerHTML)
                                // console.log(i,j)
                                saved_data[i][j].value = parseInt(oInputBox.value);
                                // console.log(typeof(saved_data[i - 1][j].value))
                                console.log(oInputBox.value);
                                console.log(saved_data);
                                // 点击其他地方结束input，并只允许操作一次
                                // document.onclick = '';

                                // 排除当前input为公式的单元格
                                // 当涉及第一种功能的cell值被改动时
                                for (let index = 0; index < simple_link_list.length; index++) {
                                    if (simple_link_list[index].v1[0] == i && simple_link_list[index].v1[1] == j) {
                                        // console.log('v1 yes')
                                        let result = auto_simple_sum(saved_data, simple_link_list[index]);
                                        saved_data[simple_link_list[index].current_value[0]][simple_link_list[index].current_value[1]].value = result;
                                        oTable.rows[simple_link_list[index].current_value[0]].cells[simple_link_list[index].current_value[1]].innerHTML = result;
                                    }
                                    if (simple_link_list[index].v2[0] == i && simple_link_list[index].v2[1] == j) {
                                        // console.log('v2 yes')
                                        let result = auto_simple_sum(saved_data, simple_link_list[index]);
                                        saved_data[simple_link_list[index].current_value[0]][simple_link_list[index].current_value[1]].value = result;
                                        oTable.rows[simple_link_list[index].current_value[0]].cells[simple_link_list[index].current_value[1]].innerHTML = result;
                                    }
                                    if (simple_link_list[index].current_value[0] == i && simple_link_list[index].current_value[1] == j) {
                                        simple_link_list.splice(index, 1);
                                        alert("unbind and release the cell already");
                                        console.log(simple_link_list);
                                    }
                                }

                                // 当涉及第二种功能的cell值被改动时
                                for (let index = 0; index < hard_link_list.length; index++) {
                                    for(let index1=0; index1<hard_link_list[index].link_data.length;index1 ++){
                                        if(hard_link_list[index].link_data[index1][0] == i && hard_link_list[index].link_data[index1][1] == j){
                                            let result = auto_hard_sum(saved_data,hard_link_list[index]);
                                            saved_data[hard_link_list[index].current_value[0]][hard_link_list[index].current_value[1]].value = result;
                                            oTable.rows[hard_link_list[index].current_value[0]].cells[hard_link_list[index].current_value[1]].innerHTML = result;
                                        }
                                    }

                                    if (hard_link_list[index].current_value[0] == i && hard_link_list[index].current_value[1] == j) {
                                        hard_link_list.splice(index, 1);
                                        alert("unbind and release the cell already");
                                        console.log(hard_link_list);
                                    }
                                }

                            }


                        }

                    }
                }
            }
        }
    }

    function refresh() {
        console.log("refresh now");
        let oTable = document.getElementsByTagName("table")[0];
        oTable.parentNode.removeChild(oTable);
    }

    function auto_simple_sum(saved_data, current_link) {
        // console.log(saved_data[current_link.v1[0]][current_link.v1[1]].value, saved_data[current_link.v2[0]][current_link.v2[1]].value)
        let result = saved_data[current_link.v1[0]][current_link.v1[1]].value + saved_data[current_link.v2[0]][current_link.v2[1]].value
        return result
    }

    function auto_hard_sum(saved_data,current_link) {
        let link_list  = current_link.link_data;
        let result = 0;
        for(let index=0; index<link_list.length;index++){
            result += saved_data[link_list[index][0]][link_list[index][1]].value
        }
        return result
    }

    function main() {
        let saved_data = []
        for (let i = 0; i < 101; i++) {
            data_row = [];
            for (let j = 0; j < 101; j++) {
                data_row.push({
                    value: ''
                });
            }
            saved_data.push(data_row);
        }
        let column_label_list = init_label()
        console.log(column_label_list)

        // id列表
        let id_label_list = []
        for (let i = 0; i < 101; i++) {
            for (let j = 0; j < 101; j++) {
                let id_label = column_label_list[i + 1] + j;
                id_label_list.push(id_label)
            }
        }
        // console.log(id_label_list)

        let simple_link_list = []
        let hard_link_list = []

        create_table(column_label_list, saved_data)
        change_value(saved_data, id_label_list, simple_link_list,hard_link_list,column_label_list)
        // refresh(column_label_list,saved_data)
        let oRefreshBtn = document.getElementById("refreshBtn");
        oRefreshBtn.onclick = function () {
            refresh()
            create_table(column_label_list, saved_data)
            change_value(saved_data, id_label_list, simple_link_list,hard_link_list,column_label_list)
        }

        let oBoldBtn = document.getElementById("boldBtn");
        let oItalicBtn = document.getElementById("italicBtn");
        let oUnderlineBtn = document.getElementById("underlineBtn");

        oBoldBtn.onclick = function () {
            let oTable = document.getElementsByTagName('table')[0];
            oTable.style.fontWeight = 'bold'
        } 

        oItalicBtn.onclick = function () {
            let oTable = document.getElementsByTagName('table')[0];
            oTable.style.fontStyle = 'italic'
        } 

        oUnderlineBtn.onclick = function () {
            let oTable = document.getElementsByTagName('table')[0];
            oTable.style.textDecoration = 'underline'
        } 
    }

    main()
}