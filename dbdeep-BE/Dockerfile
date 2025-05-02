FROM openjdk:17-jdk-slim

WORKDIR /app
COPY .env .

COPY build/libs/dbdeep-BE-0.0.1-SNAPSHOT.jar app.jar

COPY src/main/resources/dbdeep-458113-f062160db0ee.json /credentials/key.json

ENTRYPOINT ["java", "-jar", "app.jar"]
