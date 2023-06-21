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
                beforeAgent true
                changelog '\\[skip ci\\]'
            }

            steps {
                script {
                    currentBuild.setResult(hudson.model.Result.NOT_BUILT)
                    env.shouldBuild = false
                    echo 'Skipping CI due to [skip ci] in commit message.'
                    return
                }
            }
        }

        stage('Install dependencies') {
            when {
                beforeAgent true
                expression{
                    return env.shouldBuild != "false"
                }
            }

            steps {
                sh 'npm ci'
            }
        }

        stage('Clean junk') {
            when {
                beforeAgent true
                expression{
                    return env.shouldBuild != "false"
                }
            }

            steps {
                sh 'npm run clean'
            }
        }

        stage('Build') {
            when {
                beforeAgent true
                expression{
                    return env.shouldBuild != "false"
                }
            }

            steps {
                sh 'npm run build --if-present'
            }
        }

        stage('Run Playwright tests') {
            when {
                beforeAgent true
                expression{
                    return env.shouldBuild != "false"
                }
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