export type Provider = 'github' | 'discord' | 'google'

export interface UserInfo {
  id: string
  username: string
  avatar?: string
  provider: Provider
}

export interface GitHubResponse {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
  name: string
  company: null
  blog: string
  location: null
  email: null
  hireable: null
  bio: null
  twitter_username: null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  private_gists: number
  total_private_repos: number
  owned_private_repos: number
  disk_usage: number
  collaborators: number
  two_factor_authentication: boolean
  plan: Plan
}

export interface DiscordResponse {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  premium_type: number
  flags: number
  banner: null
  accent_color: number
  global_name: string
  avatar_decoration_data: null
  banner_color: string
  mfa_enabled: boolean
  locale: string
}

export interface GoogleResponse {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}

export interface Plan {
  name: string
  space: number
  collaborators: number
  private_repos: number
}
