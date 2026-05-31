FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

ENV MAVEN_RETRY_OPTS="-Dmaven.wagon.http.retryHandler.count=5 -Dmaven.wagon.http.retryHandler.requestSentEnabled=true"

COPY pom.xml .
RUN mvn -B -ntp $MAVEN_RETRY_OPTS -DskipTests dependency:go-offline

COPY src ./src

RUN mvn -B -ntp $MAVEN_RETRY_OPTS -DskipTests clean package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /opt/app

RUN groupadd --system spring && useradd --system --gid spring spring

COPY --from=build /app/target/admin-service-*.jar app.jar

USER spring:spring
EXPOSE 8089

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
