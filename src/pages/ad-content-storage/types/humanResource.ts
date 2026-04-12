export interface Team {
  id: string
  name: string
}

export interface HumanResource {
  id: string
  name: string
  email: string
  team_id: string
  team?: Team
}
