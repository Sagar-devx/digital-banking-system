pipeline {
    agent any

    environment {
        DOCKER_HUB = 'sagr9900'
        TAG         = "${BUILD_NUMBER}"
    }

    stages {

        // Step 1: Test inside Docker
        stage('Test') {
            steps {
                script {
                    def services = ['account-service', 'api-gateway', 'fraud-detection-service',
                                    'notification-service', 'payment-service', 'transaction-service']
                    for (svc in services) {
                        dir(svc) {
                            sh "docker run --rm -v \$(pwd):/app -w /app maven:3.9-eclipse-temurin-17 mvn test -B"
                        }
                    }
                }
            }
        }

        // Step 2: Build JARs + Docker Images + Push to Docker Hub
        stage('Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DOCKERHUB_CREDENTIALS',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {

                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'

                    script {
                        def services = ['account-service', 'api-gateway', 'fraud-detection-service',
                                        'notification-service', 'payment-service', 'transaction-service']
                        for (svc in services) {
                            dir(svc) {
                                sh "docker build -t ${DOCKER_HUB}/${svc}:${TAG} -t ${DOCKER_HUB}/${svc}:latest ."
                                sh "docker push ${DOCKER_HUB}/${svc}:${TAG}"
                                sh "docker push ${DOCKER_HUB}/${svc}:latest"
                            }
                        }
                    }
                }
            }
        }

        // Step 3: Deploy to AWS EC2 via SSH
        stage('Deploy') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'AWS_SSH_KEY', keyFileVariable: 'KEY', usernameVariable: 'USER'),
                    string(credentialsId: 'AWS_EC2_HOST', variable: 'HOST')
                ]) {
                    // Send compose file to server
                    sh "scp -i \$KEY -o StrictHostKeyChecking=no docker-compose-prod.yml \${USER}@\${HOST}:~/digital-banking-system/docker-compose.yml"

                    // SSH → Stop old containers → Pull new images → Start
                    sh """
                        ssh -i \$KEY -o StrictHostKeyChecking=no \${USER}@\${HOST} '
                            cd ~/digital-banking-system &&
                            export IMAGE_TAG=${TAG} &&
                            export DOCKER_HUB_USER=${DOCKER_HUB} &&
                            docker compose down --remove-orphans || true &&
                            docker compose pull &&
                            docker compose up -d &&
                            docker image prune -f
                        '
                    """
                }
            }
        }
    }

    post {
        success { echo "Build #${BUILD_NUMBER} deployed successfully!" }
        failure { echo "Build #${BUILD_NUMBER} failed!" }
        always  { cleanWs() }
    }
}
