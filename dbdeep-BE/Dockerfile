FROM gradle:8.5-jdk17 as builder
WORKDIR /app
COPY . .
RUN gradle build --no-daemon -x test

FROM openjdk:17-jdk-slim
COPY --from=builder /app/build/libs/dbdeep-BE-0.0.1-SNAPSHOT.jar app.jar
COPY src/main/resources/dbdeep-458113-f062160db0ee.json /app/credentials/key.json
ENTRYPOINT ["java", "-jar", "app.jar"]
