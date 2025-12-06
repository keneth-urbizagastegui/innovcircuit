# ----- Etapa 1: Build (Construcción) -----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Construir el JAR saltando tests para agilizar
RUN mvn clean package -DskipTests

# ----- Etapa 2: Runtime (Ejecución) -----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copiar el JAR desde la etapa de construcción
COPY --from=build /app/target/innovcircuit-backend-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]