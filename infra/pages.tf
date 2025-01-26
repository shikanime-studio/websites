data "cloudflare_pages_project" "default" {
  for_each     = var.projects
  account_id   = var.account
  project_name = each.value
}