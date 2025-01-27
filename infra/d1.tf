resource "cloudflare_d1_database" "default" {
  for_each              = var.d1s
  account_id            = var.account
  name                  = each.value
  primary_location_hint = "weur"
}
