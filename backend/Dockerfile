# Usamos la imagen base de Java 17 (Temurin)
FROM eclipse-temurin:17-jre-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos el JAR (construido por Maven) al contenedor
# Usamos un comodín para el nombre del archivo JAR
COPY target/innovcircuit-backend-*.jar app.jar

# Exponemos el puerto 8080 (donde corre Spring)
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "/app/app.jar"]