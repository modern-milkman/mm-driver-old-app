#!/bin/bash

# make sure we can determine the distro and version
apt install lsb-release gnupg2 -y
apt update -y
apt install kvm qemu-kvm libvirt-bin virtinst -y
apt install virt-manager -y
adduser `id -un` libvirt
adduser `id -un` kvm

# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# set max file watchers - package installation will otherwise fail
echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf 
sysctl -p 

export DISTRO_VER=$(lsb_release -r | grep -Eo [0-9.]+)
export DISTRO_NAME=$(echo $(lsb_release -i | grep -Eoi 'Debian|Ubuntu') | tr '[:upper:]' '[:lower:]')

# install the ODBC drivers 
sudo su -c "apt install curl -y"
sudo su -c "curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -"
sudo su -c "curl https://packages.microsoft.com/config/$(echo $DISTRO_NAME)/$(echo $DISTRO_VER)/prod.list > /etc/apt/sources.list.d/mssql-release.list"

sudo apt update -y
sudo ACCEPT_EULA=Y apt install msodbcsql18 -y
# optional: for bcp and sqlcmd
sudo ACCEPT_EULA=Y apt install mssql-tools -y
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bash_profile
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc

# satisfy the properties for the gradle so that it doesn't run in a daemon
# echo 'export JAVA_OPTS="-Xmx2048m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8 -Dfile.encoding=UTF-8 -Duser.country=US -Duser.language=en -Duser.variant"' >> ~/.bashrc
# echo 'export GRADLE_OPTS="-Xmx2048m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8 -Dfile.encoding=UTF-8 -Duser.country=US -Duser.language=en -Duser.variant"' >> ~/.bashrc
# echo 'export GRADLE_OPTS=-Dorg.gradle.daemon=false' >> ~/.bashrc
mkdir -p ~/.gradle
echo "org.gradle.daemon=false" >> ~/.gradle/gradle.properties
# echo "org.gradle.jvmargs=-Xmx2048m -XX:+HeapDumpOnOutOfMemoryError" >> ~/.gradle/gradle.properties

source ~/.bashrc
# optional: for unixODBC development headers
sudo apt install unixodbc-dev -y

# chmod +x $NVM_DIR/nvm.sh

# nvm install 16.13.0
# nvm use 16.13.0

# sudo ln -s $(echo $(which node)) /usr/bin/node
# sudo ln -s $(echo $(which npm)) /usr/bin/npm

cd android
chmod +x gradlew

# windows uses CLRF line endings. running gradlew without this fix will mean it fails to run
sed -i -e 's/\r$//' ./gradlew

cd ../
sudo gem install cocoapods
npm i -g detox-cli gulp yarn
yarn

cd ./detox
npm i
source ~/.bashrc
npm run build:android
cd ../android

# GRADLE_OPTS="-XX:+HeapDumpOnOutOfMemoryError
#              -Xmx2048m" ./gradlew --no-daemon --debug assembleDebug assembleAndroidTest -DtestBuildType=debug

cd .. && npx react-native start & 

cd ../detox && npm run test:android:headless
