// ==UserScript==
// @name         抖店-多功能脚本
// @version      0.3
// @description  一键复制订单信息，批量显示隐藏信息，一键下载订单
// @author       羊种草 706597125@qq.com
// @match        https://fxg.jinritemai.com/ffa/morder/order/list
// @icon         https://lf1-fe.ecombdstatic.com/obj/eden-cn/upqphj/homepage/icon.svg
// @require      https://greasyfork.org/scripts/433586-simpletools/code/SimpleTools.js?version=977251
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @namespace    doudian-plus
// @run-at document-end
// ==/UserScript==

async function getShopName() {
  await WaitUntil(() => {
    return !!document.querySelector('div.headerShopName')
  })

  return document.querySelector('div.headerShopName').innerText
}

function toCsvString(headers, dataList) {
  let rows = []
  rows.push(headers)
  for (let d of dataList) {
    let row = []
    for (let h of headers) {
      row.push(d[h])
    }
    rows.push(row)
  }
  rows = rows.map(row => {
    return row.map(s => `"${s}"`).join(',')
  }).join('\n')
  return 'data:text/csv;charset=utf-8,\ufeff' + rows
}

// 将订单 div里的内容处理成对象
function extractOrderDiv(div) {
  let resp = {}
  let header = div.querySelector('div[class^="index_rowHeader"] > div[class^="index_RowHeader"] > div[class^="index_leftWrapper"]')
  let spanList = header.querySelectorAll('span')
  if (spanList.length >= 1) {
    // console.log(spanList[0].innerText)
    resp.orderId = spanList[0].innerText.match(/订单号\s*(\d+)/)[1]
    resp.extOrderId = '`'+spanList[0].innerText.match(/订单号\s*(\d+)/)[1]
  }
  if (spanList.length >= 2) {
    // console.log(spanList[1].innerText)
    resp.orderTime = spanList[1].innerText.match(/下单时间\s*([\d\/ :]+)/)[1]
  }
  if (spanList.length >= 3) {
    // console.log(spanList[1].innerText)
    resp.sourceType = spanList[2].innerText.match(/推广类型：\s*(.*)/)[1]
  }

  // content
  let content = div.querySelector('div:nth-of-type(2)')
  let product = content.querySelector('div[class^="style_productItem"] > div[class^="style_content"]')
  resp.image = product.querySelector('img').getAttribute('src')
  resp.title = product.querySelector('div[class^="style_detail"] > div[class^="style_name"]').innerText
  resp.sku = product.querySelector('div[class^="style_property"] > div[class^="style_desc"]').innerText

  resp.unitPrice = content.querySelector('div[class^="index_cellRow"] > div[class^="index_cell"]:nth-of-type(2) > div[class^="table_comboAmount"]').innerText
  resp.number = content.querySelector('div[class^="index_cellRow"] > div[class^="index_cell"]:nth-of-type(2) > div[class^="table_comboNum"]').innerText

  resp.payAmount = content.querySelector('div[class^="index_payAmount"]').innerText

  resp.nickname = content.querySelector('a[class^="table_nickname"]').innerText
  resp.contact = content.querySelector('div[class^="index_locationDetail"]').innerText
  let contactList = resp.contact.split('，')
  if (contactList.length >= 3) {
    resp.contactName = contactList[0]
    resp.contactPhone = contactList[1]
    resp.contactAddress = contactList[2]
  }
  resp.status = div.querySelector('div:nth-of-type(2) > div[class^="index_cell"]:nth-of-type(4) > div:first-of-type').innerText
  resp.status_id = div.getAttribute('data-kora_order_status')
  return resp
}

//下载订单
async function downloadCurrentPage() {
  let divList = document.querySelectorAll('div.auxo-spin-container > div:nth-of-type(2) > div > div[data-kora_order_status]')
  let dataList = []
  let headers = ['extOrderId', 'orderTime', 'sourceType', 'title', 'sku', 'unitPrice', 'number', 'payAmount', 'nickname', 'contactName', 'contactPhone', 'contactAddress', 'contact', 'status', 'image']
  for (let div of divList) {
    let data = extractOrderDiv(div)
    //console.log(data)
    dataList.push(data)
  }
  const csvString = toCsvString(headers, dataList)
  //console.log('csvString', csvString)

  let shopName = await getShopName()

  let link = document.createElement('a')
  link.setAttribute('href', csvString)
  let filename = `${shopName}-订单`
  link.setAttribute('download', filename + '.csv')
  link.click()
}

// 添加“下载订单”按钮
async function addDownloadButton() {
  console.log('增加下载订单按钮')
  await WaitUntil(() => {
    return !!document.querySelector('div[class^="index_middle-bar-wrapper"] div[class^="index_batchOpWrap"] div[class^="index_buttonGroup"]')
  })

  let div = document.querySelector('div[class^="index_middle-bar-wrapper"] div[class^="index_batchOpWrap"] div[class^="index_buttonGroup"]')

  let btn = div.querySelector('button').cloneNode(true)
  btn.setAttribute('data-id', '下载订单')
  btn.setAttribute('_cid', 'export-orders')
  btn.innerHTML = `<span>下载订单</span>`
  div.appendChild(btn)

  btn.onclick = (e) => {
    downloadCurrentPage()
  }

  let btn2 = div.querySelector('button').cloneNode(true)
  btn2.setAttribute('data-id', '批量查看隐藏信息')
  btn2.setAttribute('_cid', 'show-orders-info')
  btn2.innerHTML = `<span>查看隐藏信息</span>`
  div.appendChild(btn2)
  btn2.onclick = (e) => {
    console.log('批量查看隐藏信息', e)
    showUserAddress()
  }

  let btn3 = div.querySelector('button').cloneNode(true)
  btn3.setAttribute('data-id', '更新复制按钮')
  btn3.setAttribute('_cid', 'update-button')
  btn3.innerHTML = `<span>更新按钮</span>`
  div.appendChild(btn3)
  btn3.onclick = (e) => {
    console.log('添加复制按钮', e)
    addCopyOrderInfoButton()
  }
}

//添加复制订单信息按钮
async function addCopyOrderInfoButton() {
  console.log("增加复制订单信息按钮")
  await WaitUntil(() => {
    return !!document.querySelector('div[class^="index_rowHeader"] div[class^="index_RowHeader"]')
  })
  let divList = document.querySelectorAll('div.auxo-spin-container > div:nth-of-type(2) > div > div[data-kora_order_status]')
  //console.log(divList)
  for (let div of divList) {
    let tableRowId   = div.getAttribute('id')
    let btnDiv = document.querySelector('div[class^="index_middle-bar-wrapper"] div[class^="index_batchOpWrap"] div[class^="index_buttonGroup"]')
    let btn = btnDiv.querySelector('button').cloneNode(true)
    let divHeader = div.querySelector('div[class^="index_rowHeader"] div[class^="index_RowHeader"]')
    let haveCopyBtn = divHeader.querySelector('button[data-id="复制信息"]')
    if(haveCopyBtn == null){
        btn.setAttribute('data-id', '复制信息')
        btn.setAttribute('_cid', 'copy-order-info')
        btn.innerHTML = `<span>复制信息</span>`
        divHeader.appendChild(btn)
        btn.onclick = (e) => {
            copyOrderInfo(tableRowId)
        }
    }

  }
}

// 批量显示敏感信息
function showUserAddress () {
    console.log('批量显示敏感信息')
    let divList = document.querySelectorAll('div.auxo-spin-container > div:nth-of-type(2) > div > div[data-kora_order_status]')
    for (let div of divList) {
           setTimeout(function (){
               let data = extractOrderDiv(div)
               if(data['status_id'] !== '4'){
                   let showDiv = div.querySelector('a[data-kora="查看敏感信息"]')
                   showDiv.click()
               }
           },1000)
    }
}

function copyOrderInfo (divid) {
    console.log('复制订单信息')
    let div = document.getElementById(divid);
    let data = extractOrderDiv(div)
    //console.log(data)
    let copyInfo = data['orderId'] + '\n' +  data['contact'] +  '\n' + data['title'] +   ' ' +data['sku'] +  '\n' + data['status']
    var c = copyMgr(copyInfo);
    if(c){
        showToast('复制成功')
    }else {
        showToast('复制失败!')
    }
}

function copyMgr(data) {
    var textarea = document.createElement('textarea');
    textarea.style = 'position:absolute;top: -150px;left:0;';
    document.body.appendChild(textarea);
    textarea.value = data;
    textarea.select();
    try {
        //进行复制到剪切板
        if (document.execCommand("Copy", "false", null)) {
            textarea.value = '';
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

async function addTableId() {
  console.log("增加列表 ID")
  await WaitUntil(() => {
    return !!document.querySelector('div[class^="index_tableRow"]')
  })
  let divList = document.querySelectorAll('div[class^="index_tableRow"]')
  for (let div of divList) {
      //console.log('addTableId',div)
      let data = extractOrderDiv(div)
      div.setAttribute('id', data['orderId'])
  }
}

function addButton () {
   console.log('添加按钮')
   addTableId()
   addDownloadButton()
   addCopyOrderInfoButton()
   Sleep(10)
}

(async function () {
  'use strict';
   setTimeout(function (){
       addButton()
       let auxoDiv = document.querySelector('div[class^="index_RichTable"] div[class^="index_ListWithPagination"] div[class^="auxo-spin-container"]')
       auxoDiv.addEventListener("DOMSubtreeModified", function(){
             let divList = document.querySelectorAll('div[class^="index_tableRow"]')
             for (let div of divList) {
                  let data = extractOrderDiv(div)
                  div.setAttribute('id', data['orderId'])
             }
       }, false);
   }, 3000 )
})();