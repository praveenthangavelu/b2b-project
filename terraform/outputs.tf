output "alb_dns_name" {
  description = "The public DNS URL of the Application Load Balancer to access the web app"
  value       = aws_lb.main.dns_name
}

output "ecr_repository_url_frontend" {
  description = "ECR Repository URL for the frontend Docker image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_repository_url_backend" {
  description = "ECR Repository URL for the backend Docker image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS Cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_frontend" {
  description = "Name of the frontend ECS Service"
  value       = aws_ecs_service.frontend.name
}

output "ecs_service_backend" {
  description = "Name of the backend ECS Service"
  value       = aws_ecs_service.backend.name
}
