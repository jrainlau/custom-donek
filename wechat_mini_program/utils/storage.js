/**
 * 本地存储模块 —— 使用微信小程序 Storage API
 */

var STORAGE_KEY = 'donek-user-schemes'

/**
 * 获取所有保存的配色方案
 * @returns {Array}
 */
function getAllSchemes() {
  try {
    var data = wx.getStorageSync(STORAGE_KEY)
    return data ? data : []
  } catch (e) {
    console.error('[Storage] 读取失败:', e)
    return []
  }
}

/**
 * 保存配色方案
 * @param {object} scheme
 */
function saveScheme(scheme) {
  try {
    var all = getAllSchemes()
    var idx = -1
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === scheme.id) {
        idx = i
        break
      }
    }
    if (idx >= 0) {
      all[idx] = scheme
    } else {
      all.push(scheme)
    }
    wx.setStorageSync(STORAGE_KEY, all)
  } catch (e) {
    console.error('[Storage] 保存失败:', e)
  }
}

/**
 * 删除配色方案
 * @param {string} id
 */
function deleteScheme(id) {
  try {
    var all = getAllSchemes().filter(function (s) {
      return s.id !== id
    })
    wx.setStorageSync(STORAGE_KEY, all)
  } catch (e) {
    console.error('[Storage] 删除失败:', e)
  }
}

module.exports = {
  getAllSchemes: getAllSchemes,
  saveScheme: saveScheme,
  deleteScheme: deleteScheme,
}
