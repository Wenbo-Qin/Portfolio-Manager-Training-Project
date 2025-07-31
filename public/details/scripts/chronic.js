$(function () {
    var Theight = $(window).height() - 260;
    $(".div_any_child").height(Theight);

    // 分页核心参数（全局变量，确保作用域正确）
    let currentPage = 1;       // 当前页码，初始为1
    const pageSize = 10;       // 每页显示条数
    let isLoading = false;     // 防止重复请求的锁
    let deleteTarget = null;   // 当前要删除的目标
    let dateRange = { start: null, end: null }; // 添加日期范围参数

    // 初始化分页组件
    function initPagination(totalPages, totalRecords) {
        totalPages = Math.max(Number(totalPages) || 1, 1); // 确保总页数至少为1
        totalRecords = Number(totalRecords) || 0;

        // 先销毁旧实例（如果存在）
        if ($('#pagination').data('pagination')) {
            $('#pagination').pagination('destroy');
        }

        // 重新初始化分页组件
        $('#pagination').pagination({
            dataSource: function(done) {
                // 创建一个简单的数组作为数据源，长度等于总记录数
                var result = [];
                for (var i = 1; i <= totalRecords; i++) {
                    result.push(i);
                }
                done(result);
            },
            pageSize: pageSize,
            pageNumber: currentPage,
            showInfo: true,
            showJump: true,
            showPageSizes: true,
            pageRange: 5,
            homePageText: "首页",
            endPageText: "尾页",
            prevPageText: "上一页",
            nextPageText: "下一页",
            callback: function (data, pagination) {
                var selectedPage = pagination.pageNumber;
                if (selectedPage !== currentPage && !isLoading) {
                    currentPage = selectedPage;
                    loadData();
                }
            }
        });
    }

    // 加载数据函数
    function loadData() {
        // 防止重复请求
        if (isLoading) return;
        isLoading = true;

        // 显示加载状态
        $('#tableBody').html('<tr><td colspan="8" style="text-align:center">加载中...</td></tr>');

        // 构造请求参数
        const requestParams = {
            page: currentPage,
            pageSize: pageSize,
            t: new Date().getTime() // 禁用缓存
        };
        
        // 如果有日期范围，则添加到请求参数中
        if (dateRange.start && dateRange.end) {
            requestParams.startDate = dateRange.start;
            requestParams.endDate = dateRange.end;
        }

        $.get('/api/asset-details', requestParams)
            .done(function (res) {
                console.log('后端响应:', res);
                processResponse(res);
            })
            .fail(function (xhr) {
                console.error('请求失败:', xhr);
                $('#tableBody').html(`<tr><td colspan="8" style="text-align:center">请求失败：${xhr.statusText}</td></tr>`);
                
                // 即使请求失败也显示分页控件
                initPagination(1, 0);
            })
            .always(function () {
                // 无论成功失败，都释放加载锁
                isLoading = false;
            });
    }
    
    // 处理响应数据的函数
    function processResponse(res) {
        // 验证响应格式
        if (!res || res.success !== true || !res.data) {
            $('#tableBody').html('<tr><td colspan="8" style="text-align:center">数据加载失败</td></tr>');
            // 即使数据加载失败也显示分页控件
            initPagination(1, 0);
            return;
        }

        const dataList = res.data.list || [];
        const pagination = res.data.pagination || {};
        const tableBody = $('#tableBody').empty();

        // 渲染数据
        if (dataList.length === 0) {
            tableBody.append('<tr><td colspan="8" style="text-align:center">暂无数据</td></tr>');
        } else {
            dataList.forEach(function (item, index) {
                const serialNumber = (pagination.currentPage - 1) * pagination.pageSize + index + 1;
                const row = `<tr>
                    <td>${serialNumber}</td>
                    <td>${item.stat_month || '-'}</td>
                    <td>${item.stock || '0'}</td>
                    <td>${item.fund || '0'}</td>
                    <td>${item.gold || '0'}</td>
                    <td>${item.bond || '0'}</td>
                    <td>${item.liquid_funds || '0'}</td>
                    <td>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">删除</button>
                    </td>
                </tr>`;
                tableBody.append(row);
            });
            
            // 绑定删除按钮事件
            $('.delete-btn').on('click', function() {
                const id = $(this).data('id');
                showDeleteConfirm(id);
            });
        }

        // 初始化分页（使用后端返回的分页信息）
        initPagination(pagination.totalPages, pagination.totalRecords);
    }

    // 显示删除确认对话框
    function showDeleteConfirm(id) {
        deleteTarget = id;
        $('#deleteConfirmModal').show();
        $('#modalOverlay').show();
    }

    // 执行删除操作
    function performDelete() {
        if (!deleteTarget) return;

        // 发送删除请求
        $.ajax({
            url: '/api/asset-details',
            method: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({ id: deleteTarget }),
            success: function(res) {
                if (res.success) {
                    // 删除成功，重新加载当前页数据
                    loadData();
                    alert('删除成功');
                } else {
                    alert('删除失败: ' + res.error);
                }
            },
            error: function(xhr) {
                alert('删除请求失败: ' + xhr.statusText);
            },
            complete: function() {
                // 隐藏确认对话框
                hideDeleteConfirm();
            }
        });
    }

    // 隐藏删除确认对话框
    function hideDeleteConfirm() {
        $('#deleteConfirmModal').hide();
        $('#modalOverlay').hide();
        deleteTarget = null;
    }

    // 绑定删除确认对话框的事件
    $('#confirmDeleteBtn').on('click', performDelete);
    $('#cancelDeleteBtn').on('click', hideDeleteConfirm);

    // 初始加载第一页数据
    loadData();
    
    // 暴露给全局作用域的函数和变量
    window.loadData = loadData;
    window.dateRange = dateRange;
});

function handleAdd() {
    document.getElementById('addModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
    // 设置默认时间为今天
    document.getElementById('inputTime').valueAsDate = new Date();
}

function closeModal() {
    // 隐藏弹窗和遮罩层，并重置表单
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('addForm').reset();
    // 移除可能的验证错误样式
    const inputs = document.getElementById('addForm').querySelectorAll('input');
    inputs.forEach(input => {
        input.style.borderColor = '';
    });
}

function saveData() {
    // 获取输入值
    const time = document.getElementById('inputTime').value;
    const stock = document.getElementById('inputStock').value ? Number(document.getElementById('inputStock').value) : 0;
    const fund = document.getElementById('inputFund').value ? Number(document.getElementById('inputFund').value) : 0;
    const gold = document.getElementById('inputGold').value ? Number(document.getElementById('inputGold').value) : 0;
    const bond = document.getElementById('inputBond').value ? Number(document.getElementById('inputBond').value) : 0;
    const cash = document.getElementById('inputCash').value ? Number(document.getElementById('inputCash').value) : 0;

    // 验证必填字段
    if (!time) {
        alert('请填写时间字段');
        return;
    }

    // 构造要发送的数据对象
    const requestData = {
        stat_month: time,
        stock: stock,
        fund: fund,
        gold: gold,
        bond: bond,
        liquid_funds: cash
    };

    // 发送数据到后端
    $.ajax({
        url: '/api/asset-details',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        success: function(res) {
            if (res.success) {
                alert('数据添加成功');
                closeModal();
                // 重新加载数据以显示新添加的记录
                loadData();
            } else {
                alert('添加失败: ' + (res.error || '未知错误'));
            }
        },
        error: function(xhr) {
            alert('请求失败: ' + xhr.statusText);
        }
    });
    
}

function openMonthRangeModal() {
    document.getElementById('monthRangeModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
}

function closeMonthRangeModal() {
    document.getElementById('monthRangeModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
}

// 修改这个函数以实现真正的查询功能
function confirmMonthRangeQuery() {
    const start = document.getElementById('startMonth').value;
    const end = document.getElementById('endMonth').value;

    if (!start || !end) {
        alert('请填写完整的起止月份');
        return;
    }

    if (start > end) {
        alert('起始月份不能晚于结束月份');
        return;
    }

    // 设置日期范围并重新加载数据
    window.dateRange.start = start;
    window.dateRange.end = end;
    window.currentPage = 1; // 重置到第一页
    loadData(); // 重新加载数据
    
    closeMonthRangeModal();
}

// 添加一个重置查询的函数
function resetQuery() {
    window.dateRange.start = null;
    window.dateRange.end = null;
    window.currentPage = 1;
    loadData();
}
