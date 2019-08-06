username = ""
password = ""
summery = {};
orders = []
filter = {
    filter: {
        "statuses": [0, 1, 2, 3, 4, 5, 6, 7]
    },
    pageinfo: {
        "limit": 100
    }
}
url_orderinfo = "";
url_orders = "";
image = {};
$('document').ready(function() {
    username = infodata.username;
    password = infodata.md5;
    url_orderinfo = infodata.url_orderinfo;
    url_orders = infodata.url_orders;
    $('#abc').change(function(a) {
        if (this.checked) {
            $('.yichuli').hide();
        } else {
            $('.yichuli').show();
        }
    })
    image = new Image();
    image.src = 'logo.jpg';
    _date = new Date;
    _timestamp = parseInt(_date.getTime() / 1e3);
    _token = md5(btoa(username + ":" + _timestamp) + password);

    var bt1 = $('<button>详细</button>').click(function() {
        $('#s').hide();
        $('#l').hide();
        $('#tt').hide();
        $('#t').show();
    });
    var bt2 = $('<button>汇总</button>').click(function() {
        $('#l').hide();
        $('#t').hide();
        $('#tt').hide();
        $('#s').show();
    });;
    var bt3 = $('<button>地点</button>').click(function() {
        $('#s').hide();
        $('#t').hide();
        $('#tt').hide();
        $('#l').show();
    });
    var bt4 = $('<button>贴纸</button>').click(function() {
        $('#s').hide();
        $('#t').hide();
        $('#l').hide();
        $('#tt').show();
    });
    var bt5 = $('<button>跟新</button>').click(function() {
        get_data();
    });
    $('#btn').append(bt1).append(bt2).append(bt3).append(bt4).append(bt5);
    $('#s').hide();
    $('#l').hide();
    $('#tt').hide();
    summery = {
        num: 0,
        dish: {
            num: 0
        },
        starter: null,
        address: {},
        rice: 0,
        starter_order: [],
        riceorder: []
    };
    plist = [];
    o = [];
    get_data();
    $('#set').click(function() {
        $.each(o, function(i, v) {
            v.printed = true;
            v.chuli.text('已处理');
            v.chuli.css('background-color', '#80ced6')
        })
        $('.weichuli').addClass('yichuli');
        $('.yichuli').removeClass('weichuli');
        if ($('#abc').checked) {
            $('.yichuli').hide();
        }
    })
})

function get_data() {
    var p = new Promise(function(resolve, reject) {
        _date = new Date;
        _timestamp = parseInt(_date.getTime() / 1e3);
        _token = md5(btoa(username + ":" + _timestamp) + password);
        var d;
        $.ajax({
            url: url_orders,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('timestamp', _timestamp);
                xhr.setRequestHeader('token', _token);
                xhr.setRequestHeader('username', 'tiantian');
            },
            data: filter,
            type: "GET",
            success: function(data) {
                d = data;
                resolve(d);
            }
        });
    })
    p.then(function(data) {
        orders = data;
    }).then(function() {
        $.each(orders, function(index, val) {
            if (val.restaurant.id == 92) {
                var t = new Promise(function(resolve, reject) {
                    _date = new Date;
                    _timestamp = parseInt(_date.getTime() / 1e3);
                    _token = md5(btoa(username + ":" + _timestamp) + password);
                    var d;
                    $.ajax({
                        url: url_orderinfo + val.id,
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader('timestamp', _timestamp);
                            xhr.setRequestHeader('token', _token);
                            xhr.setRequestHeader('username', 'tiantian');
                        },
                        type: "GET",
                        success: function(data) {
                            d = data;
                            $.each(d.goods, function(i, v) {
                                if (o.find(function(a) {
                                        return a.id == d.sn
                                    }) != undefined) {} else {
                                    for (var x = 0; x < v.numbers; x++) {
                                        if (val.pickup_address.address == '请选择送餐地址 Seattle WA') {
                                            val.pickup_address.address = val.address;
                                        }
                                        var item = {
                                            id: val.sn,
                                            name: val.name,
                                            mobile: val.mobile,
                                            address: val.pickup_address.address.indexOf(',') > 0 ? val.pickup_address.address.substring(0, val.pickup_address.address.indexOf(',')) : val.pickup_address.address,
                                            dish: v.name.substring(0, v.name.indexOf('(')) > 0 ? v.name.substring(0, v.name.indexOf('(')) : v.name,
                                            num: 1,
                                            updated: v.selected_attrs['升级豪华套餐'] == undefined ? false : true,
                                            addrice: v.selected_attrs['饭不够吃？'] == undefined ? false : true,
                                            starter: v.selected_attrs['升级豪华套餐'] == undefined ? '无' : v.selected_attrs['升级豪华套餐'][0].name,
                                            note: val.user_remark,
                                            order: data,
                                            printed: false
                                        }
                                        if (val.deliverer_remark != null) {
                                            item.note = val.deliverer_remark;
                                        }
                                        if (val.pickup_address.address.indexOf(';') > 0)
                                            item.address = val.pickup_address.address.substring(0, val.pickup_address.address.indexOf(';'))
                                        else if (val.pickup_address.address.indexOf(':') > 0)
                                            item.address = val.pickup_address.address.substring(0, val.pickup_address.address.indexOf(':'))
                                        o.push(item);
                                        if (item.dish.indexOf('(') > 0) {
                                            item.dish = item.dish.substring(0, item.dish.indexOf('('));
                                        }
                                        addrow(item);
                                    }
                                }
                            })
                            resolve('ok');
                        }
                    });
                })
                plist.push(t);
            }
        })
    }).then(function() {
        let a = Promise.all(plist).then(values => {
            build_summery(summery);
            makefilter()
            console.log(o);
        })
    })
}

function addrow(value) {
    var table = $('#table');
    var row = $('<tr>', {
        class: 'weichuli'
    });
    table.append(row);
    var a = $('<a>', {
        style: 'background-color: coral;',
        text: '未处理'
    }).click(function() {
        if (!value.printed) {
            value.printed = !value.printed;
            a.text('已处理');
            a.css('background-color', '#80ced6')
            a.addClass('yichuli');
            a.removeClass('weichuli');
            if ($('#abc').checked) {
                $('.yichuli').hide();
            }
        } else {
            value.printed = !value.printed;
            a.text('未处理');
            a.css('background-color', 'coral')
            a.addClass('weichuli');
            a.removeClass('yichuli');
        }
    });
    value['chuli'] = a;
    if (value.id == 'US138162') {
        console.log('a');
    }
    row.append($('<td>').append(a));
    $.each(value, function(i, v) {
        if (i != 'order' && i != 'chuli' && i != 'updated' && i != 'addrice' && i != 'printed') {
            var c = $('<td>', {
                style: 'padding-right:10px',
                text: v
            });
            row.append(c);
        }
    })

    if (!value.printed) {
        a.val('已处理');
        a.css('background-color:', 'green')
    }
    addsummery(value);
}

function addsummery(value) {
    summery.num += 1;
    if (summery.address[value.address] == undefined) {
        summery.address[value.address] = {
            num: 0,
            order: []
        }
    }
    if (summery.dish[value.dish] == undefined) {
        summery.dish[value.dish] = {
            num: 0,
            starter: {},
            order: []
        }
        $.each(value.order.goods[0].attrs, function(i, v) {
            if (v.name == '升级豪华套餐' || v.name == '豪华套餐配菜') {
                $.each(v.values, function(ind, val) {
                    summery.dish[value.dish].starter[val.name] = 0;
                })
                if (summery.starter == null) {
                    summery.starter = {
                        num: 0
                    };
                    $.each(v.values, function(ind, vals) {
                        summery.starter[vals.name] = 0;
                    })
                }
            }
        })
    }
    summery.address[value.address].num += 1;
    summery.address[value.address].order.push(value);
    summery.dish.num += 1;
    summery.dish[value.dish].num += 1;
    summery.dish[value.dish].order.push(value);
    if (value.updated) {
        summery.dish[value.dish].starter[value.starter] += 1;
        summery.starter[value.starter] += 1;
        summery.starter.num += 1;
        summery.starter_order.push(value);
    }

    if (value.addrice) {
        summery.rice += 1;
        summery.riceorder.push(value);
    }

}

function updatedinfo() {

}

function build_summery(data) {
    var div = $('#s');
    div.empty();
    var title = $('<div>').append($('<h1>', {
        text: '总数:' + data.num
    }));
    var dish = $('<div>');
    var sdiv = $('<div>');
    $.each(data.dish, function(i, v) {
        if (i != 'num') {
            var _dish = $('<div>');
            _dish.append($('<div>').append($('<h3>', {
                text: i + ':' + v.num
            })))
            $.each(v.starter, function(ind, val) {
                if (val > 0) {
                    _dish.append($('<div>').append($('<h4>', {
                        text: ind + ':' + val
                    })))
                }
            })
            dish.append(_dish);
        }

    })
    $.each(data.starter, function(i, v) {
        if (v != 0)
            if (i == 'num')
                sdiv.append($('<div>').append($('<h1>', {
                    text: '配菜:' + v
                })));
            else
                sdiv.append($('<div>').append($('<h3>', {
                    text: i + ':' + v
                })));
    })
    div.append(title).append($('<hr>')).append(dish).append($('<hr>')).append(sdiv).append($('<hr>')).append($('<div>').append($('<h3>', {
        text: '加饭:' + data.rice
    })));
    var loc = $('#l');
    loc.empty();
    $.each(data.address, function(i, v) {
        var _loc = $('<div>', { style: 'page-break-inside:avoid' });
        var table = $('<table>');

        _loc.append($('<div>').append($('<h1>' + i + '&emsp;&emsp;' + v.num + '</h1>')));
        _loc.append(table);

        $.each(v.order, function(ind, val) {
            table.append($('<tr>').append($('<td>', {
                style: 'padding-right:15px',
                text: val.name
            })).append($('<td>', {
                text: val.mobile
            })).append($('<td>', {
                text: val.dish
            })).append($('<td>', {
                text: val.starter
            })));
            if (val.note.length > 0) {
                table.append($('<tr>').append($('<td>', {
                    colspan: '3'
                }).append($('<a>' + val.note + '</a>'))));
            }
        })
        loc.append(_loc);
    })

}

function makefilter() {
    var f = $('#f');
    f.empty();
    f.append($('<input>', {
        name: 'all',
        id: 'ttall',
        type: 'CheckBox',
        value: 'all'
    })).append($('<lable>', {
        for: 'ttall',
        text: 'all'
    })).click(function() {
        console.log($("input[name='all']").is(':checked'));
    });
    f.append($('<input>', {
        name: 'starter',
        id: 'ttstarter',
        type: 'CheckBox',
        value: 'starter'
    })).append($('<lable>', {
        for: 'ttstarter',
        text: '小菜'
    }));
    f.append($('<input>', {
        name: 'rice',
        id: 'ttrice',
        type: 'CheckBox',
        value: 'rice'
    })).append($('<lable>', {
        for: 'ttrice',
        text: '加饭'
    }));
    $.each(summery.dish, function(i, v) {
        if (i != 'num') {
            f.append($('<input>', {
                name: 'dish',
                id: 'tt' + i,
                type: 'CheckBox',
                value: i
            })).append($('<lable>', {
                text: i,
                for: 'tt' + i
            }));
        }
    })
    f.append($('<button>确认</button>').click(function() {
        build_sticker();
        build_stickerprint()
    }))
}

function build_sticker() {

    var order = [];
    $('#pp').empty();
    if ($("input[name='all']").is(':checked')) {
        order = o;
    } else {
        if ($("input[name='starter']").is(':checked')) {
            order = order.concat(summery.starter_order);
        }
        if ($("input[name='rice']").is(':checked')) {
            order = order.concat(summery.riceorder);
        }
        $.each($("input[name='dish']:checked"), function(i, v) {
            order = order.concat(summery.dish[v.value].order);
        })
    }
    var tablenum = summery.num / 15;
    var tablelist = [];
    var trlist = [];
    var tdlist = [];
    for (var i = 0; i < tablenum; i++) {
        tablelist.push($('<table>', {
            style: 'width:100%;font-size:12px;font-weight: bold;'
        }));
        if (i > 0) {
            $('#pp').append($('<div>', {
                class: 'page',
                style: 'margin-top:16px'
            }).append(tablelist[i]));
        } else {
            $('#pp').append($('<div>', {
                class: 'page'
            }).append(tablelist[i]));
        }

        for (var j = 0; j < 5; j++) {
            var tr = $('<tr>', {
                style: 'width:100%'
            });
            trlist.push(tr);
            tablelist[i].append(tr);
            for (var x = 0; x < 3; x++) {
                var td = $('<td>', {
                    style: 'width:32%'
                });
                tr.append(td);
                tdlist.push(td);
                if (x == 1) {
                    td.css({
                        'padding-left': '19px',
                        'padding-right': '19px'
                    })
                }
                if (x == 0) {
                    td.css({
                        'padding-right': '20px',
                        'padding-left': '18px'
                    })
                }
                if (x == 2) {
                    td.css({
                        'padding-left': '18px',
                        'padding-right': '20px'
                    })
                }
            }
        }

    }
    var x = 0;
    $.each(order, function(i, v) {
        if (!v.printed) {
            tdlist[x].append($('<div>', {
                style: 'width:100%;margin-top:30px'
            }).append($('<img>', {
                src: 'logo.jpg',
                width: '100%'
            })))
            tdlist[x].append($('<div>', {
                style: 'TEXT-ALIGN: center'
            }).append($('<a>', {
                text: v.id
            })))
            tdlist[x].append($('<div>', {
                style: 'TEXT-ALIGN: center'
            }).append($('<a>', {
                text: v.name + v.mobile
            })))
            tdlist[x].append($('<div>', {
                style: 'TEXT-ALIGN: center'
            }).append($('<a>', {
                text: v.dish
            })))
            tdlist[x].append($('<div>', {
                style: 'TEXT-ALIGN: center'
            }).append($('<a>', {
                text: v.starter
            })))
            if ((x + 1) % 15 == 13 || (x + 1) % 15 == 14 || (x + 1) % 15 == 0)
                tdlist[x].append($('<div>', {
                    style: 'TEXT-ALIGN: center;'
                }).append($('<a>', {
                    text: v.address
                })))
            else
                tdlist[x].append($('<div>', {
                    style: 'TEXT-ALIGN: center;margin-bottom:28px'
                }).append($('<a>', {
                    text: v.address
                })))
            x += 1;
        }
    })
}

function build_stickerprint() {

    var order = [];
    $('#ppp').empty();
    if ($("input[name='all']").is(':checked')) {
        order = o;
    } else {
        if ($("input[name='starter']").is(':checked')) {
            order = order.concat(summery.starter_order);
        }
        if ($("input[name='rice']").is(':checked')) {
            order = order.concat(summery.riceorder);
        }
        $.each($("input[name='dish']:checked"), function(i, v) {
            order = order.concat(summery.dish[v.value].order);
        })
    }
    var tablenum = summery.num / 15;
    var tablelist = [];
    var trlist = [];
    var tdlist = [];
    for (var i = 0; i < tablenum; i++) {
        tablelist.push($('<table>', {
            style: 'width:100%;font-size:12px;font-weight: bold;'
        }));
        if (i > 0) {
            $('#ppp').append($('<div>', {
                class: 'page',
                style: 'margin-top:16px'
            }).append(tablelist[i]));
        } else {
            $('#ppp').append($('<div>', {
                class: 'page'
            }).append(tablelist[i]));
        }

        for (var j = 0; j < 5; j++) {
            var tr = $('<tr>', {
                style: 'width:100%'
            });
            trlist.push(tr);
            tablelist[i].append(tr);
            for (var x = 0; x < 3; x++) {
                var td = $('<td>', {
                    style: 'width:32%'
                });
                tr.append(td);
                tdlist.push(td);
                if (x == 1) {
                    td.css({
                        'padding-left': '19px',
                        'padding-right': '19px'
                    })
                }
                if (x == 0) {
                    td.css({
                        'padding-right': '20px',
                        'padding-left': '18px'
                    })
                }
                if (x == 2) {
                    td.css({
                        'padding-left': '18px',
                        'padding-right': '20px'
                    })
                }
            }
        }

    }
    var x = 0;
    $.each(order, function(i, v) {
        if (!v.printed) {
            tdlist[x].append($('<div>', {
                style: 'width:100%;margin-top:30px'
            }).append($('<img>', {
                src: 'logo.jpg',
                width: '100%'
            })))
            tdlist[x].append($('<div>', {
                style: 'TEXT-ALIGN: center'
            }).append($('<a>', {
                text: v.id
            })))
            tdlist[x].append($('<div>', {
                style: 'TEXT-ALIGN: center'
            }).append($('<a>', {
                text: v.name + v.mobile
            })))
            tdlist[x].append($('<div>', {
                style: 'TEXT-ALIGN: center'
            }).append($('<a>', {
                text: v.dish
            })))
            tdlist[x].append($('<div>', {
                style: 'TEXT-ALIGN: center'
            }).append($('<a>', {
                text: v.starter
            })))
            if ((x + 1) % 15 == 13 || (x + 1) % 15 == 14 || (x + 1) % 15 == 0)
                tdlist[x].append($('<div>', {
                    style: 'TEXT-ALIGN: center;'
                }).append($('<a>', {
                    text: v.address
                })))
            else
                tdlist[x].append($('<div>', {
                    style: 'TEXT-ALIGN: center;margin-bottom:28px'
                }).append($('<a>', {
                    text: v.address
                })))
            x += 1;
        }
    })
}

async function getdata(data, url, res) {
    _date = new Date;
    _timestamp = parseInt(_date.getTime() / 1e3);
    _token = md5(btoa(username + ":" + _timestamp) + password);
    var d;
    $.ajax({
        url: url,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('timestamp', _timestamp);
            xhr.setRequestHeader('token', _token);
            xhr.setRequestHeader('username', 'tiantian');
        },
        data: data,
        async: false,
        type: "GET",
        success: function(data) {
            d = data;
            res(d)
        }
    });
}


function gettoken() {
    _date = new Date;
    _timestamp = parseInt(_date.getTime() / 1e3);
    _token = md5(btoa(username + ":" + _timestamp) + password);
    return _token;
}