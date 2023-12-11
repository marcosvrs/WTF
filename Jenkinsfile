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
            when {
                beforeAgent true
                not { changelog 'skip ci' }
            }

            steps {
                sh 'npm ci'
            }
        }

        stage('Clean junk') {
            when {
                beforeAgent true
                not { changelog 'skip ci' }
            }

            steps {
                sh 'npm run clean'
            }
        }

        stage('Build') {
            when {
                beforeAgent true
                not { changelog 'skip ci' }
            }

            steps {
                sh 'npm run build'
            }
        }

        stage('Run Playwright tests') {
            when {
                beforeAgent true
                not { changelog 'skip ci' }
            }

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
            publishHTML (
                target : [
                    reportName: 'Playwright Report',
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    keepAll: false,
                    alwaysLinkToLastBuild: true,
                    allowMissing: true,
                    includes: '**/*'
                ]
            )
        }
    }
}