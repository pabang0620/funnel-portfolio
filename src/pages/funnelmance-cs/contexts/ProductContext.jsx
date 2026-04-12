import { createContext, useContext, useState, useEffect } from 'react'

const ProductContext = createContext()

// UUID 생성 함수
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([
    {
      id: 1,
      s3_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      product_id: 'udit_001',
      name: 'Udit',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])

  // 로컬 스토리지에서 제품 목록 복원
  useEffect(() => {
    const savedProducts = localStorage.getItem('products')
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts)
        setProducts(parsed)
      } catch (e) {
        console.error('Failed to parse products from localStorage', e)
      }
    }
  }, [])

  // 제품 목록이 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products))
  }, [products])

  const addProduct = (productData) => {
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      s3_id: generateUUID(), // 자동 생성
      product_id: productData.product_id || null,
      name: productData.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setProducts([...products, newProduct])
    return newProduct
  }

  const updateProduct = (id, updatedData) => {
    setProducts(products.map(p =>
      p.id === id
        ? {
            ...p,
            ...updatedData,
            updated_at: new Date().toISOString()
          }
        : p
    ))
  }

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    setProducts
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProduct() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProduct must be used within ProductProvider')
  }
  return context
}
