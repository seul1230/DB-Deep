pipeline {
  agent any
  stages {
    stage('Backend Build') {
      steps {
        dir('dbdeep-BE') {
          sh './gradlew clean build'
        }
      }
    }
  }
}
