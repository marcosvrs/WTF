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
        stage('Check Commit Message') {
            when {
                changeRequest()
            }

            steps {
                script {
                    def commitMessage = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                    if (commitMessage.contains('[skip ci]')) {
                        currentBuild.result = 'NOT_BUILT'
                        echo 'Skipping CI due to [skip ci] in commit message.'
                        return
                    }
                }
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Clean junk') {
            steps {
                sh 'npm run clean'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build --if-present'
            }
        }

        stage('Run Playwright tests') {
            steps {
                sh 'npx playwright test --update-snapshots'
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
                    allowMissing: false,
                    includes: 'data/*.png'
                ]
            )
        }
    }
}