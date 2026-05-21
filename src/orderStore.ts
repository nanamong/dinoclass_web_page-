import { type Product } from './productStore'

const ORDER_STORAGE_KEY = 'dinoclass_orders'

export type OrderStatus = 'SUCCESS' | 'REFUNDED'

export interface Order {
  id: string
  orderName: string
  amount: number
  items: Product[]
  status: OrderStatus
  createdAt: string
}

export function getOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDER_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    console.error('Failed to load orders', e)
  }
  return []
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders))
}

export function addOrder(order: Order) {
  const orders = getOrders()
  // 중복 방지 (이미 같은 orderId가 있다면 저장하지 않음)
  if (orders.find(o => o.id === order.id)) return
  orders.push(order)
  saveOrders(orders)
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = getOrders()
  const index = orders.findIndex(o => o.id === orderId)
  if (index !== -1) {
    orders[index].status = status
    saveOrders(orders)
  }
}

export function deleteOrder(orderId: string) {
  let orders = getOrders()
  orders = orders.filter(o => o.id !== orderId)
  saveOrders(orders)
}
