FROM gradle:8.5-jdk17 AS builder
WORKDIR /app
COPY . .

# ✅ 루트에서 gateway 모듈만 빌드
RUN gradle :dbdeep-gateway:build --no-daemon -x test

FROM openjdk:17-jdk-slim
COPY --from=builder /app/dbdeep-gateway/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
