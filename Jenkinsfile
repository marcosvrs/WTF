pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.35.1'
            args '--ipc=host'
        }
    }

    triggers {
        cron('H 3 * * *')
    }

    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Clean junk') {
            steps {
                sh 'npm run clean'
                sh "rm -rf ${WORKSPACE}/wa-js-test-chromium/SingletonLock"
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build --if-present'
            }
        }

        stage('Run Playwright tests') {
            steps {
                sh 'npx playwright test'
            }
        }
    }

    post {
        failure {
            httpRequest url: "http://ntfy/${NTFY_TOPIC}",
                httpMode: 'POST',
                customHeaders: [
                    [name: 'Authorization', value: "Basic ${NTFY_TOKEN}"],
                    [name: 'X-Click', value: "${BUILD_URL}"],
                    [name: 'X-Title', value: 'WTF CI Failed'],
                ]
        }

        always {
            sh 'npm run clean'
            sh "rm -rf ${WORKSPACE}/wa-js-test-chromium/SingletonLock"
        }
    }
}