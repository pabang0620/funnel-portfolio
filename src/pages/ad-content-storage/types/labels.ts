// Category Group types
export interface CategoryGroup {
  id: string
  name: string
  priority: number
  user_id: string
  created_at: string
  updated_at: string
  description?: string
}

export interface CategoryGroupWithLabels extends CategoryGroup {
  labels: CategoryLabel[]
}

export interface CategoryGroupCreate {
  name: string
  description?: string
}

export interface CategoryGroupUpdate {
  name?: string
  priority?: number
  description?: string
}

// Category Label types
export interface CategoryLabel {
  id: string
  name: string
  description?: string
  group_id: string
  group_name?: string
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface CategoryLabelCreate {
  name: string
  description?: string
}

export interface CategoryLabelUpdate {
  name?: string
  description?: string
}

// Attribute Label types
export interface AttributeLabel {
  id: string
  name: string
  description?: string
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
  created_by_name?: string
  created_by_team?: string
}

export interface AttributeLabelCreate {
  name: string
  description?: string
}

export interface AttributeLabelUpdate {
  name?: string
  description?: string
}

// Label Connection types
export interface LabelConnection {
  id: string
  parent_label_id: string
  child_label_id: string
  user_id: string
  created_at: string
}

export interface LabelConnectionCreate {
  parent_label_id: string
  child_label_ids: string[]
}
