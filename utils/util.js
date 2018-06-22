var api = require('../config/customer-api.js');

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-huashi-Token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.statusCode == 200) {
          if (res.data.code == -3) {
            //需要登录后才可以操作
            let code = null;
            return login().then((res) => {
              code = res.code;
              return getUserInfo();
            }).then((userInfo) => {
              //登录远程服务器
              request(api.AuthLoginByWeixin, { code: code, userInfo: JSON.stringify(userInfo) }, 'POST').then(res => {
                if (res.errno === 0) {
                  //存储用户信息
                  wx.setStorageSync('userInfo', res.data.userInfo);
                  wx.setStorageSync('token', res.data.token);
                  resolve(res);
                } else {
                  reject(res);
                }
              }).catch((err) => {
                reject(err);
              });
            }).catch((err) => {
              reject(err);
            })
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.errMsg);
        }
      },
      fail: function (err) {
        reject(err)
      }
    })
  });
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}

/**
 * 调用微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

function getUserInfo() {
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              resolve(res);
            },
            fail: function (err) {
              reject(err);
            }
          })
        }
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
}

function redirect(url) {
  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

function Map() {

  this.elements = new Array();

  this.size = function () {
    return this.elements.length;
  }

  this.isEmpty = function () {
    return (this.elements.length < 1);
  }

  this.clear = function () {
    this.elements = new Array();
  }

  this.put = function (_key, _value) {
    this.elements.push({
      key: _key,
      value: _value
    });
  }

  this.remove = function (_key) {
    var bln = false;

    try {
      for (i = 0; i < this.elements.length; i++) {
        if (this.elements[i].key == _key) {
          this.elements.splice(i, 1);
          return true;
        }
      }
    } catch (e) {
      bln = false;
    }
    return bln;
  }

  this.get = function (_key) {
    try {
      for (i = 0; i < this.elements.length; i++) {
        if (this.elements[i].key == _key) {
          return this.elements[i].value;
        }
      }
    } catch (e) {
      return null;
    }
  }

  this.element = function (_index) {
    if (_index < 0 || _index >= this.elements.length) {
      return null;
    }
    return this.elements[_index];
  }

  this.containsKey = function (_key) {
    var bln = false;
    try {
      for (i = 0; i < this.elements.length; i++) {
        if (this.elements[i].key == _key) {
          bln = true;
        }
      }
    } catch (e) {
      bln = false;
    }
    return bln;
  }

  this.containsValue = function (_value) {
    var bln = false;
    try {
      for (i = 0; i < this.elements.length; i++) {
        if (this.elements[i].value == _value) {
          bln = true;
        }
      }
    } catch (e) {
      bln = false;
    }
    return bln;
  }

  this.values = function () {
    var arr = new Array();
    for (i = 0; i < this.elements.length; i++) {
      arr.push(this.elements[i].value);
    }
    return arr;
  }

  this.keys = function () {
    var arr = new Array();
    for (i = 0; i < this.elements.length; i++) {
      arr.push(this.elements[i].key);
    }
    return arr;
  }
}  

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  checkSession,
  login,
  getUserInfo,
  Map
}


