# SecureGate AI — Standalone Backend (Spring Boot 3.3 + Java 17)

This is the independent backend workspace for **SecureGate AI — Artifact Registry with Vulnerability Scanning Gates**. You can open this folder directly in Visual Studio Code or IntelliJ IDEA.

---

## 🚀 How to Run in VS Code

### Prerequisites
- **JDK 17** (e.g. Eclipse Temurin 17 or OpenJDK 17)
- **VS Code Extension**: "Extension Pack for Java" by Microsoft
- **MySQL 8.0** running locally or via Docker:
  ```bash
  docker run -d --name mysql -p 3306:3306 -e MYSQL_DATABASE=securegate_db -e MYSQL_USER=securegate_user -e MYSQL_PASSWORD=securegate_secret_pass -e MYSQL_ROOT_PASSWORD=root mysql:8.0
  ```

### Step 1: Open in VS Code
Open VS Code, select **File &rarr; Open Folder...**, and select the `backend/` folder:
```bash
code backend
```

### Step 2: Build & Run with Maven
Open the VS Code terminal (`Ctrl + \`` or `Cmd + \``) and run:
```bash
mvn spring-boot:run
```
Or run `SecureGateApplication.java` directly using the "Run Java" button in VS Code.

---

## 📡 API & Swagger Documentation

Once started, the backend runs on:
- API Base URL: `http://localhost:8080/api`
- OpenAPI Specification: `http://localhost:8080/api/v3/api-docs`
- Interactive Swagger UI: `http://localhost:8080/api/swagger-ui.html`

---

## 🧪 Running Automated Security Tests

Run the JUnit 5 test suite validating the 10 security gate invariants (zero critical, high threshold, fail-closed):
```bash
mvn test
```

---

## 📁 Folder Structure

```
backend/
├── pom.xml                                   # Maven dependencies (Spring Boot 3, Security, JPA, Flyway)
├── src/
│   ├── main/
│   │   ├── java/com/securegate/
│   │   │   ├── SecureGateApplication.java    # Spring Boot application entry point
│   │   │   ├── controller/                   # REST API Controllers (Scans, Policies, Deployments)
│   │   │   └── service/
│   │   │       ├── GatePolicyEvaluatorService.java # Strict Zero-Tolerance Gate Enforcer
│   │   │       └── TrivyScannerService.java        # Safe Process ProcessBuilder Adapter
│   │   └── resources/
│   │       ├── application.yml               # Database, JWT & GCP configurations
│   │       └── db/migration/
│   │           └── V1__initial_schema.sql    # Flyway MySQL 8 DDL with constraints & indexes
│   └── test/
│       └── java/com/securegate/
│           └── GatePolicyEvaluatorTest.java  # Automated tests for gate decisions
```
