// TODO: dummy-data-integrator
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import * as mockService from '@/data/utm-builder/mockService'
import type { Product } from '../types/products'
import type { Media } from '../types/media'
import type { ContentType } from '../types/content_types'
import type { Placement } from '../types/placements'

export interface Employee {
  id: string
  name: string
  initial?: string | null
  department?: string | null
}

export interface MasterData {
  products: Map<string, Product>
  media: Map<string, Media>
  employees: Map<string, Employee>
  contentTypes: Map<string, ContentType>
  placements: Map<string, Placement>
  productsList: Product[]
  mediaList: Media[]
  employeesList: Employee[]
  contentTypesList: ContentType[]
  placementsList: Placement[]
  loading: boolean
  error: string | null
}

const MasterDataContext = createContext<MasterData | null>(null)

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const [masterData, setMasterData] = useState<MasterData>({
    products: new Map(),
    media: new Map(),
    employees: new Map(),
    contentTypes: new Map(),
    placements: new Map(),
    productsList: [],
    mediaList: [],
    employeesList: [],
    contentTypesList: [],
    placementsList: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      try {
        // TODO: dummy-data-integrator
        const [products, media, employees, contentTypes, placements] = await Promise.all([
          mockService.getProducts(),
          mockService.getMedia(),
          mockService.getEmployees(),
          mockService.getContentTypes(),
          mockService.getPlacements(),
        ])
        if (cancelled) return
        setMasterData({
          products: new Map<string, Product>(products.map(p => [p.id, p])),
          media: new Map<string, Media>(media.map(m => [m.id, m])),
          employees: new Map<string, Employee>((employees as Employee[]).map(e => [e.id, e])),
          contentTypes: new Map<string, ContentType>(contentTypes.map(ct => [ct.id, ct])),
          placements: new Map<string, Placement>(placements.map(pl => [pl.id, pl])),
          productsList: products,
          mediaList: media,
          employeesList: employees as Employee[],
          contentTypesList: contentTypes,
          placementsList: placements,
          loading: false,
          error: null,
        })
      } catch (err) {
        if (cancelled) return
        setMasterData(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : '데이터 로드 실패',
        }))
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  return <MasterDataContext.Provider value={masterData}>{children}</MasterDataContext.Provider>
}

export function useMasterDataContext(): MasterData | null {
  return useContext(MasterDataContext)
}
