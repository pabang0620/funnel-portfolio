import { useCallback } from 'react';
import type { Product } from '../types/products';
import type { Media } from '../types/media';
import type { ContentType } from '../types/content_types';
import type { Placement } from '../types/placements';
import type { DropdownOption, SidebarItem } from '../types/sheet';
import { useMasterDataContext } from '../contexts/MasterDataContext';

export interface Employee {
  id: string;
  name: string;
  initial?: string | null;
  department?: string | null;
}

export interface MasterData {
  products: Map<string, Product>;
  media: Map<string, Media>;
  employees: Map<string, Employee>;
  contentTypes: Map<string, ContentType>;
  placements: Map<string, Placement>;
  productsList: Product[];
  mediaList: Media[];
  employeesList: Employee[];
  contentTypesList: ContentType[];
  placementsList: Placement[];
  loading: boolean;
  error: string | null;
}

export function useSheetMasterData() {
  const contextData = useMasterDataContext();

  // MasterDataContext에서 데이터를 가져옴 (funnel-portfolio는 항상 Context 사용)
  const masterData: MasterData = contextData ?? {
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
  };

  const getSidebarItems = useCallback((): SidebarItem[] => {
    const items: SidebarItem[] = [];
    masterData.productsList.forEach(product => {
      masterData.mediaList.forEach(media => {
        items.push({
          key: `${product.id}:${media.id}`,
          productId: product.id,
          productName: product.name,
          brandName: product.brand_name,
          mediaId: media.id,
          mediaName: media.name,
        });
      });
    });
    return items;
  }, [masterData.productsList, masterData.mediaList]);

  const getLandingOptions = useCallback((productId: string | null): DropdownOption[] => {
    if (!productId) return [];
    const product = masterData.products.get(productId);
    if (!product) return [];
    return (product.landing_numbers || []).map(ln => ({
      value: ln.id,
      label: (() => { const s = [ln.initial, ln.description].filter(Boolean).join('-'); return s ? `${ln.number} (${s})` : ln.number; })(),
    }));
  }, [masterData.products]);

  const getEmployeeOptions = useCallback((): DropdownOption[] => {
    return masterData.employeesList.map(e => ({
      value: e.id,
      label: e.initial ? `${e.name.trim()} (${e.initial})` : e.name.trim(),
      colorKey: e.initial ?? e.id,
    }));
  }, [masterData.employeesList]);

  const getMediaOptions = useCallback((): DropdownOption[] => {
    return masterData.mediaList.map(m => ({
      value: m.id,
      label: m.initial ? `${m.name} (${m.initial})` : m.name,
    }));
  }, [masterData.mediaList]);

  const getContentTypeOptions = useCallback((): DropdownOption[] => {
    return masterData.contentTypesList.map(ct => ({
      value: ct.id,
      label: ct.initial ? `${ct.name} (${ct.initial})` : ct.name,
    }));
  }, [masterData.contentTypesList]);

  const getPlacementOptions = useCallback((): DropdownOption[] => {
    return masterData.placementsList.map(pl => ({
      value: pl.id,
      label: pl.initial ? `${pl.name} (${pl.initial})` : pl.name,
    }));
  }, [masterData.placementsList]);

  return {
    masterData,
    getSidebarItems,
    getLandingOptions,
    getEmployeeOptions,
    getMediaOptions,
    getContentTypeOptions,
    getPlacementOptions,
  };
}
