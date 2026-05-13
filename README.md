# WebSocket PayGate Service

A production-ready, real-time payment processing system built with Java 17 Spring Boot backend and Angular frontend. The system enables secure, bidirectional communication for payment transactions using WebSocket/STOMP protocol, providing immediate status updates to users as transactions progress through their lifecycle.

## 🚀 Features

### Core Features
- **Real-time Payment Processing**: WebSocket/STOMP for instant bidirectional messaging
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Payment Gateway Integration**: Circuit breaker and retry patterns for external payment gateways
- **Admin Dashboard**: Real-time metrics, transaction monitoring, and system health
- **Multi-device Support**: Concurrent WebSocket sessions per user
- **Transaction Management**: Complete lifecycle tracking with audit trails

### Security Features
- **TLS 1.3 Encryption**: All WebSocket and HTTP communications
- **AES-256 Data Encryption**: Sensitive transaction fields
- **Rate Limiting**: 100 requests/minute per user
- **Input Sanitization**: Prevention of injection attacks
- **CSRF Protection**: State-changing operations protection
- **Role-based Access Control**: User and Admin roles

### Scalability Features
- **Horizontal Scaling**: Stateless operation with message broker
- **Connection Pooling**: Database and message broker connections
- **Caching**: Frequently accessed transaction data
- **Load Balancing**: Support for multiple backend instances
- **Auto-scaling**: Kubernetes HPA configuration

<!-- ## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular       │    │   Load Balancer  │    │   Spring Boot   │
│   Frontend      │◄──►│   (Nginx)        │◄──►│   Backend       │
│                 │    │                  │    │   (Multiple)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   RabbitMQ      │◄────────────┤
                       │   Message       │             │
                       │   Broker        │             │
                       └─────────────────┘             │
                                                       │
                       ┌─────────────────┐             │
                       │   PostgreSQL    │◄────────────┘
                       │   Database      │
                       └─────────────────┘
``` -->

### Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.x
- Spring WebSocket with STOMP
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- RabbitMQ
- Resilience4j (Circuit Breaker, Retry)
- Micrometer/Prometheus (Metrics)

**Frontend:**
- Angular 17
- @stomp/rx-stomp (WebSocket client)
- Angular Material (UI components)
- RxJS (Reactive programming)

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes
- Nginx (Load balancer, SSL termination)
- Prometheus & Grafana (Monitoring)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 17 (for local development)
- Node.js 18+ (for frontend development)
- Git

<!-- ### 1. Clone the Repository
```bash
git clone https://github.com/your-org/websocket-payment-service.git
cd websocket-payment-service
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Start with Docker Compose
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 4. Access the Application
- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

### 5. Default Login Credentials
- **Admin**: admin / admin123
- **User**: testuser / user123

## 🛠️ Development Setup

### Backend Development
```bash
cd backend

# Install dependencies
./mvnw dependency:resolve

# Run tests
./mvnw test

# Start application (requires PostgreSQL and RabbitMQ)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build:prod
```

### Database Setup
```bash
# Start PostgreSQL with Docker
docker run -d \
  --name payment-postgres \
  -e POSTGRES_DB=payment_db \
  -e POSTGRES_USER=payment_user \
  -e POSTGRES_PASSWORD=payment_pass \
  -p 5432:5432 \
  postgres:15-alpine

# Run database migrations
cd backend
./mvnw flyway:migrate
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Unit tests
./mvnw test

# Integration tests
./mvnw test -Dtest="*IntegrationTest"

# Property-based tests
./mvnw test -Dtest="*PropertyTest"

# Test coverage report
./mvnw jacoco:report
```

### Frontend Testing
```bash
cd frontend

# Unit tests
npm test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage
```

### Load Testing
```bash
# Install k6
brew install k6  # macOS
# or
sudo apt install k6  # Ubuntu

# Run load tests
k6 run tests/load/websocket-load-test.js
```

## 📊 Monitoring

### Metrics
The application exposes metrics at `/actuator/prometheus` including:
- Payment request rate and duration
- WebSocket connection count
- Transaction success rate
- Database connection pool status
- JVM metrics

### Health Checks
- **Liveness**: `/actuator/health/liveness`
- **Readiness**: `/actuator/health/readiness`
- **Overall Health**: `/actuator/health`

### Logging
Structured JSON logging with correlation IDs:
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "logger": "com.example.payment.service.PaymentService",
  "message": "Transaction created",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "transactionId": "tx-550e8400"
}
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build images
docker-compose build

# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=payment-service

# View logs
kubectl logs -f deployment/payment-service
```

### Environment-specific Configurations

**Development**
```bash
export SPRING_PROFILES_ACTIVE=dev
export DATABASE_URL=jdbc:postgresql://localhost:5432/payment_db
```

**Staging**
```bash
export SPRING_PROFILES_ACTIVE=staging
export DATABASE_URL=jdbc:postgresql://staging-db:5432/payment_db
```

**Production**
```bash
export SPRING_PROFILES_ACTIVE=production
export DATABASE_URL=jdbc:postgresql://prod-db:5432/payment_db
export JWT_SECRET=your-production-secret
```

## 🔧 Configuration

### Key Configuration Options

**Application Properties**
```yaml
# Database
spring.datasource.hikari.maximum-pool-size: 50
spring.datasource.hikari.minimum-idle: 10

# WebSocket
spring.rabbitmq.host: rabbitmq-server
spring.rabbitmq.port: 5672

# Security
jwt.expiration: 3600000  # 1 hour
rate-limit.requests-per-minute: 100

# Payment Gateway
payment.gateway.url: https://api.stripe.com/v1
payment.gateway.timeout: 30000
```

**Environment Variables**
- `SPRING_PROFILES_ACTIVE`: Application profile (dev/staging/production)
- `DATABASE_URL`: PostgreSQL connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `JWT_SECRET`: JWT signing secret
- `PAYMENT_GATEWAY_API_KEY`: Payment gateway API key

## 🔒 Security

### Security Measures
1. **Transport Security**: TLS 1.3 for all communications
2. **Authentication**: JWT tokens with configurable expiration
3. **Authorization**: Role-based access control (USER, ADMIN)
4. **Data Protection**: AES-256 encryption for sensitive fields
5. **Input Validation**: Comprehensive validation and sanitization
6. **Rate Limiting**: Per-user request limits
7. **Audit Logging**: Complete transaction audit trail

### Security Best Practices
- Regular security updates
- Secrets management with external providers
- Network segmentation
- Regular penetration testing
- Compliance with PCI DSS standards

## 📈 Performance

### Performance Characteristics
- **Concurrent WebSocket Connections**: 10,000+ per instance
- **Payment Processing**: <200ms under normal load
- **Database Queries**: <2s for transaction history (1 year)
- **Message Broadcasting**: <500ms delivery time

### Optimization Tips
1. **Database Indexing**: Proper indexes on frequently queried columns
2. **Connection Pooling**: Optimized pool sizes for database and message broker
3. **Caching**: Redis for frequently accessed data
4. **Load Balancing**: Multiple backend instances with sticky sessions disabled

## 🐛 Troubleshooting

### Common Issues

**WebSocket Connection Failed**
```bash
# Check backend logs
docker-compose logs backend

# Verify RabbitMQ is running
docker-compose ps rabbitmq

# Test WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" \
  http://localhost:8080/ws
```

**Database Connection Issues**
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Test database connection
docker-compose exec postgres psql -U payment_user -d payment_db -c "SELECT 1;"

# View database logs
docker-compose logs postgres
```

**Payment Gateway Errors**
```bash
# Check circuit breaker status
curl http://localhost:8080/actuator/health

# View payment service logs
docker-compose logs backend | grep PaymentGateway
```

### Debug Mode
```bash
# Enable debug logging
export LOGGING_LEVEL_COM_EXAMPLE_PAYMENT=DEBUG

# Or in application.yml
logging:
  level:
    com.example.payment: DEBUG
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`./mvnw test && npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request -->

### Code Standards
- **Java**: Follow Google Java Style Guide
- **TypeScript**: Follow Angular Style Guide
- **Testing**: Minimum 80% code coverage
- **Documentation**: Update README and API docs

<!-- ## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

<!-- ## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

### Reporting Security Issues
Please report security vulnerabilities to security@yourcompany.com instead of creating public issues. -->

## 🗺️ Roadmap

### Upcoming Features
- [ ] Multi-currency support with real-time exchange rates
- [ ] Advanced fraud detection with machine learning
- [ ] Mobile app with push notifications
- [ ] Blockchain payment integration
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant architecture

<!-- ### Version History
- **v1.0.0**: Initial release with core payment functionality
- **v1.1.0**: Admin dashboard and monitoring
- **v1.2.0**: Enhanced security and performance optimizations -->

---

**Built with ❤️**
