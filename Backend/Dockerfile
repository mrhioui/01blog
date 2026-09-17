# Use Maven image with Java 17
FROM maven:3.9.3-eclipse-temurin-17 AS build

# Set working directory inside container
WORKDIR /app

# Copy pom.xml first to leverage Docker cache
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -q 

# Copy the rest of the project
COPY . .

# Build the Spring Boot app
RUN mvn clean package -DskipTests

# Use a smaller JDK image to run the app
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy the built jar from previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java","-jar","app.jar"]