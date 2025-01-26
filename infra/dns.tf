resource "cloudflare_dns_record" "default" {
  for_each = var.dns_records
  zone_id  = var.zone
  comment  = "Managed by Terraform"
  content  = data.cloudflare_pages_project.default[each.key].subdomain
  name     = each.value.name
  proxied  = true
  ttl      = 1
  type     = "CNAME"
}
