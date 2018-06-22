const util = require('../../utils/util.js');
const api = require('../../config/customer-api.js');

//获取应用实例
const app = getApp()
Page({
  data: {         
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    floorGoods: [],
    banner: [],
    channel: [],
    showView: true
  },
  getUserInfoFun: function () {
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          showView: (!that.data.showView)
        })  
      },
      fail: function () { }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '花食',
      desc: '成都花食',
      path: '/pages/index/index'
    }
  },
  getIndexData: function () {
    let that = this;
    util.request(api.IndexUrl).then(function (res) {
      if (res.code === '1') {
        that.setData({
          banner: res.data.bannerList,
          channel: res.data.channelList,
          brands: res.data.brandList,
          newGoods: res.data.brandList
        });
      }
    });
  },
  onLoad: function (options) {
    this.getIndexData();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示时触发
    this.getUserInfoFun()
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})
