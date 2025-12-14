# Use Maven + JDK 17 image
FROM maven:3.9.3-eclipse-temurin-17 AS build
WORKDIR /app

# Copy project files and build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Spring Boot app
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/java-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
CMD ["java", "-jar", "app.jar"]
