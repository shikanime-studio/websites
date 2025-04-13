output "d1s" {
  value = {
    for name, config in var.d1s :
    name => cloudflare_d1_database.default[name].id
  }
  description = "Cloudflare D1 databases"
}