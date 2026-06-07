// 识趣派 — 积分商城 API
import { get, post } from './request'

export const shopApi = {
  /**
   * 商品列表（分页 + 筛选 + 排序）
   * @param {Object} params - { page, pageSize, category, sort }
   */
  getGoodsList(params) {
    return get('/shop/goods', params)
  },

  /**
   * 商品详情（含 canExchange 判断）
   * @param {number} id - 商品ID
   */
  getGoodsDetail(id) {
    return get(`/shop/goods/${id}`)
  },

  /**
   * 兑换商品
   * @param {Object} data - { goodsId }
   */
  exchangeGoods(data) {
    return post('/shop/exchange', data)
  },

  /**
   * 兑换记录列表（分页）
   * @param {Object} params - { page, pageSize }
   */
  getOrders(params) {
    return get('/shop/orders', params)
  }
}
