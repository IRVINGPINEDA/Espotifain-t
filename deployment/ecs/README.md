# ECS Notes

Use ECS Fargate for the stateless application containers and move MySQL to Amazon RDS or Aurora MySQL. Running MySQL inside Fargate is possible but is not recommended for production persistence.

1. Build and push the `frontend`, `backend`, and `nginx` images to Amazon ECR.
2. Provision an RDS MySQL 8 instance and an EFS filesystem for `/uploads`.
3. Copy `task-definition.template.json`, replace every placeholder, and register the task definition.
4. Create an ECS service behind an Application Load Balancer that forwards port `80` to the `nginx` container.
5. Put the task in private subnets, attach the ALB in public subnets, and allow the ECS security group to reach RDS and EFS.
