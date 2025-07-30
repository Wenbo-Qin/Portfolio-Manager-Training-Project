// $(function(){
//   var Theight = $(window).height() - 260;
//   $(".div_any_child").height(Theight);
//   totalPage = 9;
//   currentPage = 1;
//   paging(totalPage,currentPage);
// })


$(function(){
    // 原有逻辑：设置高度
    var Theight = $(window).height() - 260;
    $(".div_any_child").height(Theight);
    
    // 分页参数
    var totalPage = 9;
    var currentPage = 1;
    var pageSize = 10; // 每页条数
    
    // 分页函数
    function paging(total, current) {
        $('#pagination').pagination({
            totalData: total * pageSize,
            showData: pageSize,
            current: current,
            coping: true,
            homePage: '首页',
            endPage: '末页',
            prevContent: '上一页',
            nextContent: '下一页',
            callback: function(api) {
                currentPage = api.getCurrent();
                loadData(); // 分页切换时加载数据
            }
        });
    }
    
    // 加载数据函数
    function loadData() {
        // 显示加载状态
        $('#tableBody').html('<tr><td colspan="7" style="text-align:center">加载中...</td></tr>');
        
        $.get('/api/asset-details', {
            page: currentPage,
            pageSize: pageSize
        }, function(res) {
            // 先检查响应是否有效
            if (!res || typeof res !== 'object') {
                $('#tableBody').html('<tr><td colspan="7" style="text-align:center">数据格式错误</td></tr>');
                return;
            }
            
            // 检查业务是否成功
            if (!res.success) {
                $('#tableBody').html('<tr><td colspan="7" style="text-align:center">'+ (res.error || '加载失败') +'</td></tr>');
                return;
            }
            
            // 检查数据结构是否完整
            if (!res.data || !Array.isArray(res.data.list)) {
                $('#tableBody').html('<tr><td colspan="7" style="text-align:center">数据结构异常</td></tr>');
                return;
            }
            
            var data = res.data.list;
            var total = res.data.total || 0;
            var tableBody = $('#tableBody');
            tableBody.empty();
            
            // 处理无数据情况
            if (data.length === 0) {
                tableBody.append('<tr><td colspan="7" style="text-align:center">暂无数据</td></tr>');
                return;
            }
            
            // 渲染表格数据
            data.forEach(function(item, index) {
                var serialNumber = (currentPage - 1) * pageSize + index + 1;
                var row = '<tr>' +
                    '<td>' + serialNumber + '</td>' +
                    '<td>' + (item.stat_month || '-') + '</td>' +  // 匹配后端的stat_month字段
                    '<td>' + (item.stock || '0') + '</td>' +
                    '<td>' + (item.fund || '0') + '</td>' +
                    '<td>' + (item.gold || '0') + '</td>' +
                    '<td>' + (item.bond || '0') + '</td>' +
                    '<td>' + (item.liquid_funds || '0') + '</td>' +  // 补充流动资金字段
                    '<td><button class="btn btn-primary btn-sm">删除</button></td>' +
                '</tr>';
                tableBody.append(row);
            });
            
            // 更新分页信息
            totalPage = Math.ceil(total / pageSize);
            paging(totalPage, currentPage);
        }).fail(function() {
            $('#tableBody').html('<tr><td colspan="7" style="text-align:center">网络错误，请重试</td></tr>');
        });
    }
    
    // 初始化分页和加载数据
    paging(totalPage, currentPage);
    loadData(); // 加载第一页数据
});

function handleAdd() {
    var confirmAdd = window.confirm("是否要增加？");
    if (confirmAdd) {
        alert("已确认增加！");
        // 你可以在这里执行实际的增加逻辑，比如 addRow() 等
    } else {
        console.log("用户取消增加操作");
    }
}


