output "d1s" {
  value       = [for d1 in cloudflare_d1_database.default : d1.id]
  description = "Cloudflare D1 databases"
}