CUR_SPACE=.

version=`grep -E "\"version\":\s?\".*\"" package.json | sed s/[^0-9.]//g`;
versionCode=`grep -E "\"versionCode\":\s?\".*\"" package.json | sed s/[^0-9.]//g`;
echo "Infusing version $version-$versionCode to environment files & ios project.pbxproj";

sed -i -e 's/APP_VERSION_NAME=.*/APP_VERSION_NAME='$version'/' $CUR_SPACE/.env.development
sed -i -e 's/APP_VERSION_NAME=.*/APP_VERSION_NAME='$version'/' $CUR_SPACE/.env.production
sed -i -e 's/APP_VERSION_NAME=.*/APP_VERSION_NAME='$version'/' $CUR_SPACE/.env.staging
sed -i -e 's/APP_VERSION_NAME=.*/APP_VERSION_NAME='$version'/' $CUR_SPACE/.env.uat

sed -i -e 's/APP_VERSION_CODE=.*/APP_VERSION_CODE='$versionCode'/' $CUR_SPACE/.env.development
sed -i -e 's/APP_VERSION_CODE=.*/APP_VERSION_CODE='$versionCode'/' $CUR_SPACE/.env.production
sed -i -e 's/APP_VERSION_CODE=.*/APP_VERSION_CODE='$versionCode'/' $CUR_SPACE/.env.staging
sed -i -e 's/APP_VERSION_CODE=.*/APP_VERSION_CODE='$versionCode'/' $CUR_SPACE/.env.uat

# react-native-config is sloppy about config variables within info.plist in latest versions
# use MARKETING_VERSION and CURRENT_PROJECT_VERSION in info.plist and
# infuse them within the project
sed -i -e 's/MARKETING_VERSION = .*;/MARKETING_VERSION = '$version';/' $CUR_SPACE/ios/ModernMilkmanDriver.xcodeproj/project.pbxproj
sed -i -e 's/CURRENT_PROJECT_VERSION = .*;/CURRENT_PROJECT_VERSION = '$versionCode';/' $CUR_SPACE/ios/ModernMilkmanDriver.xcodeproj/project.pbxproj

find . -name *.*-e -exec rm -rf {} \;
